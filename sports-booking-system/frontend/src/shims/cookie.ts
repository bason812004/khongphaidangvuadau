/**
 * ESM Shim for cookie package
 * Resolves CJS/ESM interop issues in Vite and React Router v7.
 */

export interface ParseOptions {
  decode?: (str: string) => string | undefined;
}

export type Cookies = Record<string, string | undefined>;

export interface StringifyOptions {
  encode?: (str: string) => string;
}

export interface SetCookie {
  name: string;
  value: string | undefined;
  maxAge?: number;
  expires?: Date;
  domain?: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  partitioned?: boolean;
  priority?: "low" | "medium" | "high";
  sameSite?: boolean | "lax" | "strict" | "none";
}

export type SerializeOptions = StringifyOptions & Omit<SetCookie, "name" | "value">;

const cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
const cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
const domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
const pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
const maxAgeRegExp = /^-?\d+$/;
const __toString = Object.prototype.toString;

const NullObject = (() => {
  const C = function () {};
  C.prototype = Object.create(null);
  return C as unknown as { new (): Cookies };
})();

export function parseCookie(str: string, options?: ParseOptions): Cookies {
  const obj = new NullObject();
  const len = str ? str.length : 0;
  if (len < 2) return obj;

  const dec = options?.decode || decode;
  let index = 0;
  do {
    const eqIdx = eqIndex(str, index, len);
    if (eqIdx === -1) break;
    const endIdx = endIndex(str, index, len);
    if (eqIdx > endIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = valueSlice(str, index, eqIdx);
    if (obj[key] === undefined) {
      obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
    }
    index = endIdx + 1;
  } while (index < len);
  return obj;
}

export const parse = parseCookie;

export function stringifyCookie(cookie: Cookies, options?: StringifyOptions): string {
  const enc = options?.encode || encodeURIComponent;
  const cookieStrings: string[] = [];
  for (const name of Object.keys(cookie)) {
    const val = cookie[name];
    if (val === undefined) continue;
    if (!cookieNameRegExp.test(name)) {
      throw new TypeError(`cookie name is invalid: ${name}`);
    }
    const value = enc(val);
    if (!cookieValueRegExp.test(value)) {
      throw new TypeError(`cookie val is invalid: ${val}`);
    }
    cookieStrings.push(`${name}=${value}`);
  }
  return cookieStrings.join("; ");
}

export function stringifySetCookie(
  _name: string | SetCookie,
  _val?: string | SerializeOptions,
  _opts?: SerializeOptions
): string {
  const cookie: SetCookie =
    typeof _name === "object"
      ? _name
      : ({ ..._opts, name: _name, value: String(_val) } as SetCookie);
  const options = (typeof _val === "object" ? _val : _opts) as SerializeOptions | undefined;
  const enc = options?.encode || encodeURIComponent;

  if (!cookieNameRegExp.test(cookie.name)) {
    throw new TypeError(`argument name is invalid: ${cookie.name}`);
  }
  const value = cookie.value ? enc(cookie.value) : "";
  if (!cookieValueRegExp.test(value)) {
    throw new TypeError(`argument val is invalid: ${cookie.value}`);
  }

  let str = cookie.name + "=" + value;

  if (cookie.maxAge !== undefined) {
    if (!Number.isInteger(cookie.maxAge)) {
      throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
    }
    str += "; Max-Age=" + cookie.maxAge;
  }
  if (cookie.domain) {
    if (!domainValueRegExp.test(cookie.domain)) {
      throw new TypeError(`option domain is invalid: ${cookie.domain}`);
    }
    str += "; Domain=" + cookie.domain;
  }
  if (cookie.path) {
    if (!pathValueRegExp.test(cookie.path)) {
      throw new TypeError(`option path is invalid: ${cookie.path}`);
    }
    str += "; Path=" + cookie.path;
  }
  if (cookie.expires) {
    if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
      throw new TypeError(`option expires is invalid: ${cookie.expires}`);
    }
    str += "; Expires=" + cookie.expires.toUTCString();
  }
  if (cookie.httpOnly) {
    str += "; HttpOnly";
  }
  if (cookie.secure) {
    str += "; Secure";
  }
  if (cookie.partitioned) {
    str += "; Partitioned";
  }
  if (cookie.priority) {
    const priority =
      typeof cookie.priority === "string"
        ? cookie.priority.toLowerCase()
        : undefined;
    switch (priority) {
      case "low":
        str += "; Priority=Low";
        break;
      case "medium":
        str += "; Priority=Medium";
        break;
      case "high":
        str += "; Priority=High";
        break;
      default:
        throw new TypeError(`option priority is invalid: ${cookie.priority}`);
    }
  }
  if (cookie.sameSite) {
    const sameSite =
      typeof cookie.sameSite === "string"
        ? cookie.sameSite.toLowerCase()
        : cookie.sameSite;
    switch (sameSite) {
      case true:
      case "strict":
        str += "; SameSite=Strict";
        break;
      case "lax":
        str += "; SameSite=Lax";
        break;
      case "none":
        str += "; SameSite=None";
        break;
      default:
        throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
    }
  }
  return str;
}

export const serialize = stringifySetCookie;

export function parseSetCookie(str: string, options?: ParseOptions): SetCookie {
  const dec = options?.decode || decode;
  const len = str ? str.length : 0;
  const endIdx = endIndex(str, 0, len);
  const eqIdx = eqIndex(str, 0, endIdx);
  const setCookie: SetCookie =
    eqIdx === -1
      ? { name: "", value: dec(valueSlice(str, 0, endIdx)) }
      : {
          name: valueSlice(str, 0, eqIdx),
          value: dec(valueSlice(str, eqIdx + 1, endIdx)),
        };
  let index = endIdx + 1;
  while (index < len) {
    const nextEndIdx = endIndex(str, index, len);
    const nextEqIdx = eqIndex(str, index, nextEndIdx);
    const attr =
      nextEqIdx === -1
        ? valueSlice(str, index, nextEndIdx)
        : valueSlice(str, index, nextEqIdx);
    const val =
      nextEqIdx === -1 ? undefined : valueSlice(str, nextEqIdx + 1, nextEndIdx);

    switch (attr.toLowerCase()) {
      case "httponly":
        setCookie.httpOnly = true;
        break;
      case "secure":
        setCookie.secure = true;
        break;
      case "partitioned":
        setCookie.partitioned = true;
        break;
      case "domain":
        setCookie.domain = val;
        break;
      case "path":
        setCookie.path = val;
        break;
      case "max-age":
        if (val && maxAgeRegExp.test(val)) setCookie.maxAge = Number(val);
        break;
      case "expires":
        if (!val) break;
        const date = new Date(val);
        if (Number.isFinite(date.valueOf())) setCookie.expires = date;
        break;
      case "priority":
        if (!val) break;
        const priority = val.toLowerCase();
        if (
          priority === "low" ||
          priority === "medium" ||
          priority === "high"
        ) {
          setCookie.priority = priority;
        }
        break;
      case "samesite":
        if (!val) break;
        const sameSite = val.toLowerCase();
        if (
          sameSite === "lax" ||
          sameSite === "strict" ||
          sameSite === "none"
        ) {
          setCookie.sameSite = sameSite;
        }
        break;
    }
    index = nextEndIdx + 1;
  }
  return setCookie;
}

function endIndex(str: string, min: number, len: number): number {
  const index = str.indexOf(";", min);
  return index === -1 ? len : index;
}

function eqIndex(str: string, min: number, max: number): number {
  const index = str.indexOf("=", min);
  return index < max ? index : -1;
}

function valueSlice(str: string, min: number, max: number): string {
  let start = min;
  let end = max;
  do {
    const code = str.charCodeAt(start);
    if (code !== 0x20 && code !== 0x09) break;
  } while (++start < end);
  while (end > start) {
    const code = str.charCodeAt(end - 1);
    if (code !== 0x20 && code !== 0x09) break;
    end--;
  }
  return str.slice(start, end);
}

function decode(str: string): string {
  if (str.indexOf("%") === -1) return str;
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

function isDate(val: unknown): val is Date {
  return __toString.call(val) === "[object Date]";
}

export default {
  parse,
  parseCookie,
  serialize,
  stringifyCookie,
  stringifySetCookie,
  parseSetCookie,
};
