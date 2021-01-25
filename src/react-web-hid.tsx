import * as React from "react";

(function () {
  if (typeof window === 'undefined') {
    return;
  }

  // Older browsers might not implement HID at all, so we set an empty object first
  // Some browsers just don't implement it - return a rejected promise with an error
  // to keep a consistent interface
  if (chrome.hid.getDevices === undefined) {
    return Promise.reject(
      new Error("HID is not implemented in this browser")
    );
  }
})();

export type WebhidProps = Omit<React.HTMLProps<HTMLElement>, "ref"> & {}

interface WebhidState {
}

export default class Webhid extends React.Component<WebhidProps, WebhidState> {
  render() {
    return (<div>WIP</div>);
  }
}
