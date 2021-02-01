import * as React from "react";

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
}

export default class Webhid extends React.Component<WebhidProps, WebhidState> {
  constructor(props: WebhidProps) {
    super(props);
    this.state = {
      isConnected: false,
    };
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

    return (<div>
      <input type="button" value="Open" id="hid_open"/><input type="button" value="Close" id="hid_close"/><br/>

      <br/>

      <input type="button" value="リレーON" id="hid_on"/><input type="button" value="リレーOFF" id="hid_off"/><br/>
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
