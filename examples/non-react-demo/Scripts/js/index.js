'use strict';

const HID_REPORT_SIZE = 64;
const HID_REPORT_ID = 0x00;

const HID_DEVICE_ID = {vendorId: 0x291f, produciId: 0x0007};
const SERIAL_DEVICE_ID = {vendorId: 0x291f, productId: 0x0005};

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

let cmdPhase = {
  Idle: 0,
  Sending: 1,
  Receiving: 2
}

class HidCommand {

  constructor(cmd, response) {
    this._cmd = cmd;
    this._response = response;
  }

  get cmd() {
    return this._cmd;
  }

  get response() {
    return this._response;
  }

  static getData() {

    let data = new Uint8Array(HID_REPORT_SIZE);
    data[0] = 0x3a;

    return new HidCommand(data, true);
  }

  static setRelay(on) {

    let data = new Uint8Array(HID_REPORT_SIZE);
    data[0] = 0x39;

    if (on) {
      data[1] = 0x01;
    } else {
      data[1] = 0x00;
    }

    return new HidCommand(data, false);
  }
}

/**
 * WebHIDを使ったプログラミングスイッチデバイス通信
 */
class CtrlHid {

  constructor({vendorId = 0x0, productId = 0x0}) {

    if (!("hid" in navigator)) {
      throw new Error('WebHID is not supported.')
    }

    this._vendorId = vendorId;
    this._productId = productId;

    this._sendTask = null;
    this._taskKill = false;

    this._device = null;
    this._sendCmdList = [];
    this._sendCmd = null;

    this._cmdPhase = cmdPhase.Idle;

    this._timeout_id = null;

    this._decoder = new TextDecoder();

    this._funcDisconnect = this.disconnect_.bind(this);
    this._funcInputreport = this.inputreport_.bind(this);

    this._process = false;

    this._outputReportId = HID_REPORT_ID;

    this._listeners = {};

  }

  addEventListener(type, listener) {
    if (!(type in this._listeners)) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(listener);
  }

  removeEventListener(type, listener) {
    if (!(type in this._listeners)) {
      return;
    }

    let stack = this._listeners[type];
    for (let i = 0, l = stack.length; i < l; i++) {
      if (stack[i] === listener) {
        stack.splice(i, 1);
        return;
      }
    }
  }

  dispatchEvent(event) {
    if (!(event.type in this._listeners)) {
      return;
    }

    let stack = this._listeners[event.type].slice();

    for (let i = 0, l = stack.length; i < l; i++) {
      stack[i].call(this, event);

    }

    return !event.defaultPrevented;
  }

  async disconnect_(e) {

    console.log('hid disconnect');

    if (e.device === this._device) {
      await this.close();

      this.dispatchEvent(new CustomEvent('disconnect'));
    }
  }

  async inputreport_(e) {
    console.log(e.device.productName + ": got input report " + e.reportId);
    let data = new Uint8Array(e.data.buffer);
    console.log(data);

    if (this._cmdPhase === cmdPhase.Sending) {
      this._cmdPhase = cmdPhase.Receiving;
    }

    if (this._cmdPhase === cmdPhase.Receiving) {
      if (this._sendCmd.resolve != null) {
        let resolve = this._sendCmd.resolve;
        this._sendCmd = null;
        resolve(data);
      }

      if (this._timeout_id) {
        clearTimeout(this._timeout_id);
      }

      this._cmdPhase = cmdPhase.Idle;
    }
  }

  async open() {

    if (this._device == null && !this._process) {
      this._process = true;

      let ex2 = null;
      try {
        const filter = {vendorId: this.vendorId, vroductId: this.productId};
        this._taskKill = false;

        navigator.hid.addEventListener("disconnect", this._funcDisconnect);

        let devices = await navigator.hid.requestDevice({filters: [filter]})
        if (devices != null && devices.length > 0) {
          this._device = devices[0];
          this._device.addEventListener('inputreport', this._funcInputreport);

          await this._device.open();

          this._sendTask = this.sendTask_();
        } else {
          throw new Error('Device is not found.')
        }
      } catch (error) {
        console.log(error);
        ex2 = error;
      } finally {
        this._process = false;
      }

      if (ex2) {
        try {
          if (this._device) {
            this._device.close();
          }
        } catch (error) {

        }

        throw ex2;
      }
    }
  }

  async close() {

    if (this._device && !this._process) {
      this._process = true;
      try {
        navigator.hid.removeEventListener("disconnect", this._funcDisconnect);

        this._taskKill = true;

        // 送信タスクが終了するまで待機する
        try {
          await Promise.resolve(this._sendTask);
        } catch (error) {

        }

        this._sendTask = null;

        try {
          if (this._device) {
            this._device.close();
          }
        } catch (error) {

        }

        while (this._sendCmdList.length > 0) {
          let cmd = this._sendCmdList.shift();
          if (cmd && cmd.reject) {
            let reject = cmd.reject;
            reject(new Error('hid port closed'));
          }
        }

        this._device = null;
      } catch (error) {
        console.log(error);
      } finally {
        this._taskKill = false;
        this._process = false;
      }
    }
  }

  get vendorId() {
    return this._vendorId;
  }

  get productId() {
    return this._productId;
  }

  async sendTimeout_() {

    if (this._timeout_id != null) {
      this._timeout_id = null;

      if (this._sendCmd && this._sendCmd.reject) {
        this._cmdPhase = cmdPhase.Idle;
        let reject = this._sendCmd.reject;
        this._sendCmd = null;
        reject(new Error('serial send timeout'));
      }
    }

  }

  async sendTask_() {

    console.log('Enter sendTask');

    try {
      while (true) {

        if (this._cmdPhase == cmdPhase.Idle && this._sendCmdList.length > 0) {
          this._sendCmd = this._sendCmdList.shift()
          if (this._sendCmd.response) {
            this._cmdPhase = cmdPhase.Sending;
            if (this._timeout_id) {
              clearTimeout(this._timeout_id);
            }

            this._timeout_id = setTimeout(this.sendTimeout_.bind(this), 1000);
          }

          await this._device.sendReport(this._outputReportId, this._sendCmd.data);

          if (!this._sendCmd.response) {
            this._cmdPhase = cmdPhase.Idle;
            if (this._sendCmd && this._sendCmd.resolve) {
              let resolve = this._sendCmd.resolve;
              this._sendCmd = null;
              resolve(null);
            }
          }

        } else if (this._taskKill) {
          break;
        } else {
          await sleep(100);
        }
      }
    } catch (error) {
      console.log(error);
    }

    if (this._sendCmd && this._sendCmd.reject) {
      let reject = this._sendCmd.reject;
      this._sendCmd = null;
      reject(new Error('serial port closed'));
    }

    console.log('Leave sendTask');

  }

  async sendData(cmd) {

    let param = {
      data: cmd.cmd,
      response: cmd.response,
      resolve: null,
      reject: null
    }

    let _this = this;
    let p = new Promise(function (resolve, reject) {

      param.resolve = resolve;
      param.reject = reject;

      _this._sendCmdList.push(param);

    });

    return p;
  }
}

window.addEventListener('load', function (e) {

  let hid = null;
  let hid_data = null;
  let hid_data_temp = null;
  let hid_data_light = null;
  let hid_data_ir = null;

  let hidProcess = false;

  if ("hid" in navigator) {

    // デバイス切断
    async function hidDisconnect(e) {
      console.log("hid disconnect");

      setImmediate(async function closeHid() {
        if (hid) {
          if (!hidProcess) {
            hidProcess = true;
            try {
              hid.removeEventListener('disconnect', hidDisconnect);
              await hid.close();
              hid = null;
            } finally {
              hidProcess = false;
            }
          } else {
            setTimeout(closeHid, 100);
          }
        }

        updateStatus();

      });
    }

    {
      let btn = document.getElementById('hid_open');
      if (btn) {
        btn.addEventListener('click', async function (e) {
          // "open"ボタンをクリックしたときの処理
          if (hid == null && !hidProcess) {
            hidProcess = true;

            try {
              hid = new CtrlHid(HID_DEVICE_ID);
              hid.addEventListener('disconnect', hidDisconnect);
              await hid.open();
            } catch (error) {
              console.log(error);
              if (hid) {
                await hid.close();

                hid = null;
              }
            } finally {
              hidProcess = false;
            }
          }

          updateStatus();
        });
      }
    }

    {
      let btn = document.getElementById('hid_read');
      if (btn) {
        btn.addEventListener('click', async function (e) {
          // "測定"ボタンをクリックしたときの処理
          if (hid && !hidProcess) {
            hidProcess = true;
            try {
              let data = await hid.sendData(HidCommand.getData());
              console.log(data.toString());

              // 受信データを変換
              let dv = new DataView(data.buffer);
              hid_data_temp = dv.getInt16(5, true) / 10;
              hid_data_light = Math.round(dv.getInt16(7, true) / 1024 * 100);
              let ir = dv.getUint8(9);
              if (ir) {
                hid_data_ir = "○";
              } else {
                hid_data_ir = "×";
              }

              hid_data = data.toString();
            } catch (error) {
              console.log(error);
            } finally {
              hidProcess = false;
            }
          }

          updateStatus();

        });
      }
    }

    {
      let btn = document.getElementById('hid_on');
      if (btn) {
        btn.addEventListener('click', async function (e) {
          // "リレーON"ボタンをクリックしたときの処理
          if (hid && !hidProcess) {
            hidProcess = true;

            try {
              let data = await hid.sendData(HidCommand.setRelay(true));
              console.log(data);
            } finally {
              hidProcess = false;
            }
          }

          updateStatus();

        });
      }
    }

    {
      let btn = document.getElementById('hid_off');
      if (btn) {
        btn.addEventListener('click', async function (e) {
          // "リレーOFF"ボタンをクリックしたときの処理
          if (hid && !hidProcess) {
            hidProcess = true;

            try {
              let data = await hid.sendData(HidCommand.setRelay(false));
              console.log(data);
            } finally {
              hidProcess = false;
            }
          }

          updateStatus();

        });
      }
    }

    {
      let btn = document.getElementById('hid_close');
      if (btn) {
        btn.addEventListener('click', async function (e) {
          // "Close"ボタンをクリックしたときの処理
          if (hid && !hidProcess) {
            hidProcess = true;

            try {
              hid.removeEventListener('disconnect', hidDisconnect);
              await hid.close();
              hid = null;
            } finally {
              hidProcess = false;
            }

          }

          updateStatus();
        });
      }
    }
  }

  /**
   * 表示を更新
   */
  function updateStatus() {
    let btnOpen = document.getElementById('hid_open');
    let btnClose = document.getElementById('hid_close');
    let btnRead = document.getElementById('hid_read');
    let btnOn = document.getElementById('hid_on');
    let btnOff = document.getElementById('hid_off');

    let textTemp = document.getElementById('hid_data_temp');
    let textLight = document.getElementById('hid_data_light');
    let textIr = document.getElementById('hid_data_ir');
    let textData = document.getElementById('hid_data');

    if ("hid" in navigator) {
      if (hid) {
        btnOpen.disabled = true;
        btnClose.disabled = false;
        btnRead.disabled = false;
        btnOn.disabled = false;
        btnOff.disabled = false;

        textData.innerHTML = hid_data;
        textTemp.innerHTML = hid_data_temp;
        textLight.innerHTML = hid_data_light;
        textIr.innerHTML = hid_data_ir;
      }
      else {
        btnOpen.disabled = false;
        btnClose.disabled = true;
        btnRead.disabled = true;
        btnOn.disabled = true;
        btnOff.disabled = true;

        textData.innerHTML = "";
        textTemp.innerHTML = "";
        textLight.innerHTML = "";
        textIr.innerHTML = "";
      }
    }
    else {
      btnOpen.disabled = true;
      btnClose.disabled = true;
      btnRead.disabled = true;
      btnOn.disabled = true;
      btnOff.disabled = true;

      textData.innerHTML = "";
      textTemp.innerHTML = "";
      textLight.innerHTML = "";
      textIr.innerHTML = "";
    }
  }
  // call `updateStatus`
  updateStatus();
});

