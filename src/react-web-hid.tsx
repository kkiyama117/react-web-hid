import * as React from "react";
import {HidStateMachine} from "./logic/Command";

(function () {
  if (typeof window === 'undefined') {
    return;
  }

  // Older browsers might not implement HID at all, so we set an empty object first
  // Some browsers just don't implement it - return a rejected promise with an error
  // to keep a consistent interface
  if (!("hid" in navigator)) {
    (navigator as any).hid = {};
    return Promise.reject(
      new Error("HID is not implemented in this browser")
    );
  }
})();

export type WebhidProps = Omit<React.HTMLProps<HTMLElement>, "ref"> & {
  vendorId?: number;
  deviceId?: number;
}

interface WebhidState {
  isConnected: false,
  stateMachine?: HidStateMachine
}


const handleClose: React.EventHandler<any> = (e) => {
  e.preventDefault();
  console.log('The link was clicked.');
}


// デバイス切断
async function hidDisconnect(e) {
  console.log("hid disconnect");

  async function closeHid() {
    try {
      hid.removeEventListener('disconnect', hidDisconnect);
      await hid.close();
      hid = null;
    } finally {
    }
    updateStatus();
  }
}

export default class Webhid extends React.Component<WebhidProps, WebhidState> {
  constructor(props: WebhidProps) {
    super(props);
    this.state = {
      isConnected: false,
      stateMachine: undefined
    };
  }

  handleOpen: React.EventHandler<any> = (e) => {
    // "open"ボタンをクリックしたときの処理
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

  componentDidMount() {
    const {state, props} = this;
  }

  render() {
    const {state, props} = this;

    const {
      vendorId,
      deviceId,
      ...rest
    } = props;
    return (
      <div>
        {/*HID OPEN*/}
        <input type="button" value="Open" onClick={this.handleOpen}/>
        {/*HID CLOSE*/}
        <input type="button" value="Close" onClick={handleClose}/>

        <input type="button" value="リレーON" id="hid_on"/>
        <input type="button" value="リレーOFF" id="hid_off"/><br/>
        <input type="button" value="測定" id="hid_read"/><br/>
        <p>測定データ : <span id="hid_data"/></p>
        <p>温度 : <span id="hid_data_temp"/></p>
        <p>明るさ : <span id="hid_data_light"/></p>
        <p>人感 : <span id="hid_data_ir"/></p>
        <hr/>
      </div>);
  }

  componentWillUnmount() {
    this.stopAndCleanup();
  }

  private stopAndCleanup() {
    const {state} = this;

    if (state.isConnected) {
      // disconnect
    }
  }
}

class HIDEngine {


}
