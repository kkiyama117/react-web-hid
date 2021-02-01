export const runHidCommand = (cmd: Uint8Array): any => {
  return null;
}


export interface HidDeviceFilter extends chrome.hid.DeviceFilter {
}
export interface HidDeviceInfo extends chrome.hid.HidDeviceInfo {
}

export interface HidDeviceOptions extends chrome.hid.DeviceOptions {
}

type HidPhase = "Disconnected" | "Idle" | "Sending" | "Receiving";

export class HidStateMachine {
  options: HidDeviceOptions;
  /** Internal WebHID device */
  connectedDevice?: HidDeviceInfo;
  /** Raw contents of the last HID Report sent by the controller. */
  lastReport ?: ArrayBuffer;
  /** Raw contents of the last HID Report sent to the controller. */
  lastSentReport ?: ArrayBuffer;

  _funcDisconnect: (any) => any;
  _funcInputReport: (any) => any;

  /** Current controller state */
  phase?: HidPhase;

  constructor(option: HidDeviceOptions, fd: (any) => any, fir: (any) => any) {
    //@ts-ignore
    // if (!navigator.hid || !navigator.hid.requestDevice) {
    //   throw new Error('WebHID not supported by browser or not available.')
    // }
    this.options = option;
    this._funcDisconnect = fd.bind(this);
    this._funcInputReport = fir.bind(this);
    this.phase = "Disconnected"
  }

  async disconnect(e) {
    await this.close();
  }

  async inputReport(e) {
    console.log(e.device.productName + ": got input report " + e.reportId);
    let data = new Uint8Array(e.data.buffer);
    console.log(data);

    if (this.phase === "Sending") {
      this.phase = "Receiving";
    }

    if (this.phase === "Receiving") {
      // Todo: resolve
      this.phase = "Idle";
    }
  }

  async open() {
    // const device = this.
    if (this.connectedDevice === null) {
      let ex2 = null;
      try {
        this.connectedDevice = device;
        if (device !== null) {
          this.connectedDevice = device[0];
          // this._device.addEventListener('inputreport', this._funcInputreport);

          try {
            await this.connectedDevice?.open();
          } catch (e) {
            throw new Error('Device is not found.')
          }
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
          this.connectedDevice?.close();
        } catch (error) {
          console.error(error);
        }finally {
          this.connectedDevice = undefined;
        }
        throw ex2;
      }
    }
  }
}
