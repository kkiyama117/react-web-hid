import * as React from "react";
import {HTMLProps, useEffect, useRef, useState} from "react";
import {getDataArray, HID_REPORT_ID, HID_TEST_DEVICE_ID, setRelayArray} from "./test_data";

const sleep = milliSec => new Promise(resolve => setTimeout(resolve, milliSec));

const getUserDevices = async (n: Navigator): Promise<HIDDevice[] | undefined> => {
  try {
    return n.hid.requestDevice({filters: [HID_TEST_DEVICE_ID]});
  } catch (error) {
    // TODO: error handling
    console.log(error);
  }
}

const openConnection = async (device: HIDDevice) => {
  try {
    await device?.open();
  } catch (e) {
    // TODO: error handling
    console.error(e);
  }
}

export const WebHid = (props) => {
  const [device, setDevice] = useState<HIDDevice>();
  const cRef = useRef(null);

  useEffect(() => {
    // TODO: use ref?
    // https://reactjs.org/docs/react-component.html
    checkHidAvailable();
    if(device){
      device.addEventListener('inputreport', handleReceiveReport);
    }
    (navigator as Navigator).hid.addEventListener('inputreport', handleReceiveReport);
    return () => {
      // Clean up the subscription
      device?.removeEventListener('inputreport', handleReceiveReport);
    };
  }, [device]);

  const checkHidAvailable = () => {
    // Older browsers might not implement HID at all, so we set an empty object first
    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!("hid" in navigator)) {
      throw new Error("HID is not implemented in this browser")
    }
  }

  // OPEN ====================================================================
  const handleOpen: React.EventHandler<any> = async (e) => {
    const devices: HIDDevice[] | undefined = await getUserDevices(navigator as Navigator);
    if (devices) {
      const _device = devices[0];
      await openConnection(_device);
      setDevice(_device);

    } else {
      console.error("Device is not found.")
    }
  };

  // SEND ====================================================================
  const sendReport = async (reportId: number, data: BufferSource): Promise<void> => {
    try {
      await device?.sendReport(reportId, data);// 0x01 = enable, 0x00 = disable
    } catch (e) {
      // Todo: handle error
      console.error(e);
    }
  }

  // RECEIVE =================================================================
  const handleReceiveReport = (e: HIDInputReportEvent): void => {
    console.log(e.device.productName + ": got input report " + e.reportId);
    console.log(new Uint8Array(e.data.buffer));
  }

  return (
    <div>
      <div ref={cRef}/>
      {/*HID OPEN*/}
      <div onClick={handleOpen}>Open</div>
      <div>Current device: {device?.productName}</div>
      {/*HID CLOSE*/}
      {/*<div onClick={handleClose}/>*/}

      <div onClick={(e) => sendReport(HID_REPORT_ID, setRelayArray(true))}>On</div>
      <div onClick={(e) => sendReport(HID_REPORT_ID, setRelayArray(false))}>Off</div>
      <div onClick={(e) => sendReport(HID_REPORT_ID, getDataArray())}>Read data</div>
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
