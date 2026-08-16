// Grading a typed guess. The point is that "CATS!" and "cat" both count, and
// a small typo does not cost you the round.

// Exported so that "is this the same guess again?" uses exactly the same rules
// as "is this guess correct?" -- otherwise "cat" and "Cat!" count as two.
export function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(a|an|the) /, '')
}

function singular(word) {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`
  if (word.length > 4 && /(ches|shes|xes|sses)$/.test(word)) return word.slice(0, -2)
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

function levenshtein(a, b) {
  if (a === b) return 0
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost)
    }
    prev = row
  }
  return prev[b.length]
}

// Short words get no typo slack -- at three letters, one edit is a different
// word ("cat" vs "car"). Longer words get more room.
function tolerance(length) {
  if (length <= 3) return 0
  if (length <= 6) return 1
  return 2
}

export function isCorrectGuess(guess, answer) {
  const g = normalize(guess)
  const a = normalize(answer)
  if (!g || !a) return false
  if (g === a) return true

  const gs = singular(g)
  const as = singular(a)
  if (gs === as) return true

  // Multi-word answers ("ice cream") also accept the joined form.
  if (gs.replace(/ /g, '') === as.replace(/ /g, '')) return true

  return levenshtein(gs, as) <= tolerance(as.length)
}
