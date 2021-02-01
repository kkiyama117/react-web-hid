import {runHidCommand} from "./logic/Command";

const HID_REPORT_ID = 0x00;

const HID_DEVICE_ID = {vendorId: 0x291f, produciId: 0x0007};
const SERIAL_DEVICE_ID = {vendorId: 0x291f, productId: 0x0005};
const HID_REPORT_SIZE = 64;
export const getData = () => {
  let data = new Uint8Array(HID_REPORT_SIZE);
  data[0] = 0x3a;
  return runHidCommand(data);
}

export const setRelay = (on) => {
  let data = new Uint8Array(HID_REPORT_SIZE);
  data[0] = 0x39;
  if (on) {
    data[1] = 0x01;
  } else {
    data[1] = 0x00;
  }
  return runHidCommand(data);
}
