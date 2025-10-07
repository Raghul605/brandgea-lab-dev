import { UAParser } from "ua-parser-js";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export async function getDeviceInfo() {
  const parser = new UAParser();
  const result = parser.getResult();

  const fp = await FingerprintJS.load();
  const fpResult = await fp.get();

  return {
    deviceName: fpResult.visitorId,
    browser: result.browser.name || "Unknown",
    deviceType: result.device.type || "desktop",
    userAgent: navigator.userAgent,
  };
}
