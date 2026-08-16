// Packs a 12x12 drawing plus its secret word into one URL-safe string, so a
// challenge travels entirely inside the link and the site can stay static.
//
// Layout before encoding:
//   [version][wordByteLength][...word utf-8][...run-length-encoded pixels]
// Everything after the version byte is XOR'd with a fixed key. That is
// obfuscation, not security -- it only stops the word being readable at a
// glance in the URL. Anyone determined can still decode it.

export const GRID_SIZE = 12
export const CELL_COUNT = GRID_SIZE * GRID_SIZE

// Index 0 is "empty". The other 15 are the drawing colors, so a cell fits in
// a nibble and the whole grid packs small.
export const PALETTE = [
  null,
  '#000000', '#ffffff', '#9d9d9d', '#5a5a5a',
  '#be2633', '#eb8931', '#f7e26b', '#a3ce27',
  '#44891a', '#2dc2bb', '#31a2f2', '#005784',
  '#7e2553', '#e06f8b', '#a46422',
]

const VERSION = 1
const XOR_KEY = [0x5a, 0x3c, 0x77, 0xe1, 0x29, 0x8b, 0x14, 0xc6]

export function emptyGrid() {
  return new Array(CELL_COUNT).fill(0)
}

export function isBlank(grid) {
  return grid.every((c) => c === 0)
}

// Each byte is one run: high nibble = color, low nibble = length - 1 (max 16).
function rleEncode(grid) {
  const out = []
  let i = 0
  while (i < grid.length) {
    const value = grid[i] & 0x0f
    let run = 1
    while (i + run < grid.length && (grid[i + run] & 0x0f) === value && run < 16) run++
    out.push((value << 4) | (run - 1))
    i += run
  }
  return out
}

function rleDecode(bytes) {
  const grid = []
  for (const byte of bytes) {
    const value = (byte >> 4) & 0x0f
    const run = (byte & 0x0f) + 1
    for (let i = 0; i < run && grid.length < CELL_COUNT; i++) grid.push(value)
  }
  while (grid.length < CELL_COUNT) grid.push(0)
  return grid
}

function xorInPlace(bytes, start) {
  for (let i = start; i < bytes.length; i++) {
    bytes[i] ^= XOR_KEY[(i - start) % XOR_KEY.length]
  }
}

function toBase64Url(bytes) {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text) {
  let base64 = text.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) base64 += '='
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function encodeChallenge(grid, word) {
  const wordBytes = new TextEncoder().encode(word)
  const payload = new Uint8Array([
    VERSION,
    wordBytes.length,
    ...wordBytes,
    ...rleEncode(grid),
  ])
  xorInPlace(payload, 1)
  return toBase64Url(payload)
}

// Returns { grid, word } or null for anything malformed -- a link can arrive
// truncated by a chat app, and a broken link should not take the page down.
export function decodeChallenge(code) {
  try {
    const bytes = fromBase64Url(code)
    if (bytes.length < 3 || bytes[0] !== VERSION) return null
    xorInPlace(bytes, 1)
    const wordLength = bytes[1]
    if (wordLength < 1 || bytes.length < 2 + wordLength + 1) return null
    const word = new TextDecoder().decode(bytes.slice(2, 2 + wordLength))
    const grid = rleDecode(bytes.slice(2 + wordLength))
    if (!word.trim()) return null
    return { grid, word }
  } catch {
    return null
  }
}

export const CHALLENGE_PARAM = 'p'

export function readChallengeFromUrl() {
  const code = new URLSearchParams(window.location.search).get(CHALLENGE_PARAM)
  return code ? decodeChallenge(code) : null
}

export function buildChallengeUrl(grid, word) {
  const { origin, pathname } = window.location
  return `${origin}${pathname}?${CHALLENGE_PARAM}=${encodeChallenge(grid, word)}`
}

// Drops the challenge out of the address bar without a reload, so starting a
// new round does not leave the old drawing in the URL.
export function clearChallengeFromUrl() {
  const { origin, pathname } = window.location
  window.history.replaceState(null, '', `${origin}${pathname}`)
}
