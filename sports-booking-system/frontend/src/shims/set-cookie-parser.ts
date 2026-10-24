/**
 * ESM Shim for set-cookie-parser
 * Resolves CJS/ESM interop issues in Vite and React Router v7.
 */

export interface SetCookie {
  name: string;
  value: string;
  path?: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
  partitioned?: boolean;
  [key: string]: unknown;
}

export interface Options {
  decodeValues?: boolean;
  map?: boolean;
  silent?: boolean;
}

const defaultParseOptions: Options = {
  decodeValues: true,
  map: false,
  silent: false,
};

function isForbiddenKey(key: unknown): boolean {
  return typeof key !== "string" || key in {};
}

function createNullObj<T = Record<string, unknown>>(): T {
  return Object.create(null);
}

function isNonEmptyString(str: unknown): str is string {
  return typeof str === "string" && !!str.trim();
}

export function parseString(setCookieValue: string, options?: Options): SetCookie | null {
  const parts = setCookieValue.split(";").filter(isNonEmptyString);

  const nameValuePairStr = parts.shift();
  if (!nameValuePairStr) return null;
  const parsed = parseNameValuePair(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;

  const opts = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;

  if (isForbiddenKey(name)) {
    return null;
  }

  try {
    value = opts.decodeValues ? decodeURIComponent(value) : value;
  } catch (e) {
    console.error(
      "set-cookie-parser: failed to decode cookie value. Set options.decodeValues=false to disable decoding.",
      e
    );
  }

  const cookie: SetCookie = createNullObj<SetCookie>();
  cookie.name = name;
  cookie.value = value;

  parts.forEach((part) => {
    const sides = part.split("=");
    const key = (sides.shift() || "").trim().toLowerCase();
    if (isForbiddenKey(key)) {
      return;
    }
    const val = sides.join("=");
    if (key === "expires") {
      cookie.expires = new Date(val);
    } else if (key === "max-age") {
      const n = parseInt(val, 10);
      if (!Number.isNaN(n)) cookie.maxAge = n;
    } else if (key === "secure") {
      cookie.secure = true;
    } else if (key === "httponly") {
      cookie.httpOnly = true;
    } else if (key === "samesite") {
      cookie.sameSite = val;
    } else if (key === "partitioned") {
      cookie.partitioned = true;
    } else if (key) {
      cookie[key] = val;
    }
  });

  return cookie;
}

function parseNameValuePair(nameValuePairStr: string): { name: string; value: string } {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift() || "";
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }

  return { name, value };
}

export function splitCookiesString(cookiesString: string | string[]): string[] {
  if (Array.isArray(cookiesString)) {
    return cookiesString;
  }
  if (typeof cookiesString !== "string") {
    return [];
  }

  const cookiesStrings: string[] = [];
  let pos = 0;
  let start = 0;
  let ch = "";
  let lastComma = 0;
  let nextStart = 0;
  let cookiesSeparatorFound = false;

  function skipWhitespace(): boolean {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  }

  function notSpecialChar(): boolean {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  }

  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;

    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;

        skipWhitespace();
        nextStart = pos;

        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }

        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.substring(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }

    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
    }
  }

  return cookiesStrings;
}

export function parse(input: any, options?: Options): any {
  const opts = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;

  if (!input) {
    if (!opts.map) {
      return [];
    } else {
      return createNullObj();
    }
  }

  if (input.headers) {
    if (typeof input.headers.getSetCookie === "function") {
      input = input.headers.getSetCookie();
    } else if (input.headers["set-cookie"]) {
      input = input.headers["set-cookie"];
    } else {
      const sch =
        input.headers[
          Object.keys(input.headers).find((key) => key.toLowerCase() === "set-cookie") || ""
        ];
      if (!sch && input.headers.cookie && !opts.silent) {
        console.warn(
          "Warning: set-cookie-parser appears to have been called on a request object. Set option {silent: true} to suppress."
        );
      }
      input = sch;
    }
  }
  if (!Array.isArray(input)) {
    input = [input];
  }

  if (!opts.map) {
    return input
      .filter(isNonEmptyString)
      .map((str: string) => parseString(str, opts))
      .filter(Boolean);
  } else {
    const cookies = createNullObj<Record<string, SetCookie>>();
    return input.filter(isNonEmptyString).reduce((acc: Record<string, SetCookie>, str: string) => {
      const cookie = parseString(str, opts);
      if (cookie && !isForbiddenKey(cookie.name)) {
        acc[cookie.name] = cookie;
      }
      return acc;
    }, cookies);
  }
}

export default Object.assign(parse, {
  parse,
  parseString,
  splitCookiesString,
});
