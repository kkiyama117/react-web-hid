import * as React from "react";
import {HTMLProps, useRef} from "react";
import {HidDeviceFilter} from "./types";

export type WebhidProps = Omit<HTMLProps<HTMLElement>, "ref"> & {
  deviceOptions: HidDeviceFilter;
}

export const WebHid = (props: WebhidProps) => {
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

  const openRef = useRef(null);

  // const createHandleOpen = (options: HidDeviceFilter): React.EventHandler<React.MouseEvent<HTMLElement>> => async (e) => {
  //   "open"ボタンをクリックしたときの処理
    // try {
    //   @ts-ignore
      // const stateMachine: HidStateMachine = navigator.hid.getUserSelectedDevices({filter: [options]})
      // await stateMachine.open();
    // } catch (error) {
    //   console.log(error);
    // }
  // }

  return (
    <div>
      {/*HID OPEN*/}
      <div ref={openRef}/>
      {/*HID CLOSE*/}
      {/*<div onClick={handleClose}/>*/}

      <div onClick={(e) => console.log("switch on (WIP)")}/>
      <div onClick={(e) => console.log("switch off (WIP)")}/>
      <div onClick={(e) => console.log("read data (WIP)")}/>
    </div>);
}



// const handleClose: React.EventHandler<any> = (e) => {
//   e.preventDefault();
//   console.log('The link was clicked.');
// }

// デバイス切断
async function hidDisconnect(e) {
  try {
    await this.connectedDevice.close();
    this.connectedDevice = null;
  } finally {
    console.log("hid disconnect");
  }
}

export default WebHid;
