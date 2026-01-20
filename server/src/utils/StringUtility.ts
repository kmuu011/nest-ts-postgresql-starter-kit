const UPPER = "QWERTYUIOPASDFGHJKLZXCVBNM";
const LOWER = "qwertyuiopasdfghjklzxcvbnm";
const DIGITS = '0123456789';
const BASE64URL_SYMBOLS = "-_";

export class StringUtility {
  static createRandomString = (
    length = 32,
    includeUpperCase = false,
    includeBase64Url = false,
  ): string => {
    let ranString = '';

    const ranStr = LOWER +
      DIGITS +
      (includeUpperCase ? UPPER : "") +
      (includeBase64Url ? BASE64URL_SYMBOLS : "");

    for (let i = 0; i < length; i++) {
      ranString += ranStr[Math.floor(Math.random() * ranStr.length)];
    }

    return ranString;
  };
}