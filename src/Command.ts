const HID_REPORT_SIZE = 64;

class HidCommand {
  private readonly _cmd: any;
  private readonly _response: any;

  constructor(cmd, response) {
    this._cmd = cmd;
    this._response = response;
  }

  get cmd() {
    return this._cmd;
  }

  get response() {
    return this._response;
  }
}

