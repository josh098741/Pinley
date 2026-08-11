const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export const generatePinCode = (length = 8) => {
  let code = ""
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return code
}

export const formatPinCode = (code = "") =>
  code && code.length >= 4 ? `${code.slice(0, 4)}-${code.slice(4)}` : code

export const normalizePinCode = (input = "") =>
  input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8)
