export const runHidCommand = (cmd: Uint8Array): any => {
  return null;
}

interface HidDeviceInfo extends chrome.hid.HidDeviceInfo {
}

interface HidDeviceOptions extends chrome.hid.DeviceOptions {
}

class HidStateMachine {
  /** Internal WebHID device */
  device?: HidDeviceInfo
  /** Raw contents of the last HID Report sent by the controller. */
  lastReport ?: ArrayBuffer
  /** Raw contents of the last HID Report sent to the controller. */
  lastSentReport ?: ArrayBuffer

  /** Current controller state */
  isConnected = false;
  constructor(option: HidDeviceOptions) {
    //@ts-ignore
    // if (!navigator.hid || !navigator.hid.requestDevice) {
    //   throw new Error('WebHID not supported by browser or not available.')
    // }
  }
}
