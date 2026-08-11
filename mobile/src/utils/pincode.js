export const formatPinCode = (code = "") =>
  code && code.length >= 4 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
