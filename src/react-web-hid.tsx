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

    return (<div>WIP</div>);
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

