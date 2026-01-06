"use client"
// Obfuscated storage utilities for anti-tampering

const STORAGE_KEY_PREFIX = "rq_"
const OBFUSCATION_SALT = "readquest_2024"

// Simple obfuscation to discourage casual tampering
function encode(data: string): string {
  if (typeof window === "undefined" || typeof btoa === "undefined") return data
  const base64 = btoa(unescape(encodeURIComponent(data)))
  return base64.split("").reverse().join("")
}

function decode(encoded: string): string {
  if (typeof window === "undefined" || typeof atob === "undefined")
    return encoded
  const base64 = encoded.split("").reverse().join("")
  return decodeURIComponent(escape(atob(base64)))
}

function createChecksum(data: string): string {
  let hash = 0
  const str = data + OBFUSCATION_SALT
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    if (typeof window === "undefined" || typeof localStorage === "undefined")
      return

    const jsonStr = JSON.stringify(data)
    const checksum = createChecksum(jsonStr)
    const payload = JSON.stringify({ d: encode(jsonStr), c: checksum })
    localStorage.setItem(STORAGE_KEY_PREFIX + key, payload)
  } catch (error) {
    console.error("Failed to save to storage:", error)
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === "undefined" || typeof localStorage === "undefined")
      return defaultValue

    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key)
    if (!stored) return defaultValue

    const payload = JSON.parse(stored)
    const decoded = decode(payload.d)
    const checksum = createChecksum(decoded)

    // Verify integrity
    if (checksum !== payload.c) {
      console.warn("Storage integrity check failed, resetting to default")
      return defaultValue
    }

    return JSON.parse(decoded) as T
  } catch (error) {
    console.error("Failed to load from storage:", error)
    return defaultValue
  }
}

export function removeFromStorage(key: string): void {
  localStorage.removeItem(STORAGE_KEY_PREFIX + key)
}
