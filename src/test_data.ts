export const HID_TEST_DEVICE_ID: HIDDeviceFilter = {vendorId: 0x291f, productId: 0x0007};
export const SERIAL_TEST_DEVICE_ID: HIDDeviceFilter = {vendorId: 0x291f, productId: 0x0005};
const HID_REPORT_SIZE = 64;
export const HID_REPORT_ID: number= 0x00;

export const getDataArray = ():ArrayBuffer => {
  const data = new Uint8Array(HID_REPORT_SIZE);
  data[0] = 0x3a;
  return data;
}

export const setRelayArray = (on):ArrayBuffer => {
  const data = new Uint8Array(HID_REPORT_SIZE);
  data[0] = 0x39;
  if (on) {
    data[1] = 0x01;
  } else {
    data[1] = 0x00;
  }
  return data;
}
