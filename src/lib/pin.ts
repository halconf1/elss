export function hashPin(pin: string): string {
  let hash = 0
  for (const char of pin) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0
  return String(hash)
}
