import {EventHandler} from "react";

type octet = number;
type byte = number;
type unsignedShort = number;
type unsignedLong = number;
type long = number;

interface NavigatorWithHID extends Navigator {
  readonly hid: HID;
}

interface HID extends EventTarget {
  onconnect: EventHandler<any> | undefined;
  ondisconnect: EventHandler<any> | undefined;

  getDevices(): Promise<HIDDevice[]>;

  requestDevice(options: HIDDeviceRequestOptions): Promise<HDevice[]>;
}

interface HIDConnectionEvent extends Event {
  readonly device: HidDevice;
}

interface HIDInputReportEvent extends Event {
  readonly device: HIDDevice;
  readonly reportId: octet;
  readonly data: DataView;
}

interface HIDDeviceRequestOptions {
  filters: HIDDeviceFilter[];
}

interface HIDDeviceFilter {
  /** Device vendor ID. */
  vendorId: unsignedLong;
  /** Device product ID, only checked only if the vendor ID matches. */
  productId?: unsignedShort;
  /** HID usage page identifier. */
  usagePage?: unsignedShort;
  /** HID usage identifier, checked only if the HID usage page matches. */
  usage?: unsignedShort;
}

interface HIDDevice {
  oninputreport: EventHandler;
  readonly opened: boolean;
  /** Device vendor ID. */
  readonly vendorId: unsignedShort;
  /** Device product ID, only checked only if the vendor ID matches. */
  readonly productId?: unsignedShort;
  readonly productName?: string;
  readonly collections: HIDCollectionInfo[];

  open(): Promise<void>;

  close(): Promise<void>;

  sendReport(reportId: octet, data: BufferSource): Promise<void>;

  sendFeatureReport(reportId: octet, data: BufferSource): Promise<void>;

  receiveFeatureReport(reportId: octet): Promise<DataView>;
}

interface HIDCollectionInfo {
  readonly usagePage: unsignedShort;
  readonly usage: unsignedShort;
  readonly type: octet;
  readonly children: HIDCollectionInfo[];
  readonly inputReports: HIDReportInfo[];
  readonly outputReports: HIDReportInfo[];
  readonly featureReports: HIDReportInfo[];
}

interface HIDReportInfo {
  readonly reportId: octet;
  readonly items: HIDReportItem[];
}

type HIDUnitSystem =
// No unit system in use.
  "none" |
  // Centimeter, gram, seconds, kelvin, ampere, candela.
  "si-linear" |
  // Radians, gram, seconds, kelvin, ampere, candela.
  "si-rotation" |
  // Inch, slug, seconds, Fahrenheit, ampere, candela.
  "english-linear" |
  // Degrees, slug, seconds, Fahrenheit, ampere, candela.
  "english-rotation" |
  "vendor-defined" |
  "reserved";

interface HIDReportItem {
  readonly isAbsolute: boolean;
  readonly isArray: boolean;
  readonly isBufferedBytes: boolean;
  readonly isConstant: boolean;
  readonly isLinear: boolean;
  readonly isRange: boolean;
  readonly isVolatile: boolean;
  readonly hasNull: boolean;
  readonly hasPreferredState: boolean;
  readonly wrap: boolean;
  readonly usages: unsignedLong[];
  readonly usageMinimum: unsignedLong;
  readonly usageMaximum: unsignedLong;
  readonly reportSize: unsignedShort;
  readonly reportCount: unsignedShort;
  readonly unitExponent: byte;
  readonly unitSystem: HIDUnitSystem;
  readonly unitFactorLengthExponent: byte;
  readonly unitFactorMassExponent: byte;
  readonly unitFactorTimeExponent: byte;
  readonly unitFactorTemperatureExponent: byte;
  readonly unitFactorCurrentExponent: byte;
  readonly unitFactorLuminousIntensityExponent: byte;
  readonly logicalMinimum: long;
  readonly logicalMaximum: long;
  readonly physicalMinimum: long;
  readonly physicalMaximum: long;
  readonly strings: string[];
}
