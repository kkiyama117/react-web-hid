
const getData = () => {

  let data = new Uint8Array(HID_REPORT_SIZE);
  data[0] = 0x3a;

  return new HidCommand(data, true);
}

const setRelay = (on) => {

  let data = new Uint8Array(HID_REPORT_SIZE);
  data[0] = 0x39;

  if (on) {
    data[1] = 0x01;
  } else {
    data[1] = 0x00;
  }

  return new HidCommand(data, false);
}
