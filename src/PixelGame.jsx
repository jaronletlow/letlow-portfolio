import { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import './PixelGame.css'
import {
  GRID_SIZE,
  PALETTE,
  buildChallengeUrl,
  clearChallengeFromUrl,
  emptyGrid,
  isBlank,
} from './pixelCodec'
import { isCorrectGuess, normalize } from './guessMatch'
import { randomWord } from './words'

function PixelGrid({ grid, editable, onPaint }) {
  const gridRef = useRef(null)
  const paintingRef = useRef(false)
  const lastCell = useRef(null)

  // Cells come from the pointer position rather than from event targets, so a
  // drag keeps painting on touch as well as mouse.
  const cellAt = (event) => {
    const rect = gridRef.current.getBoundingClientRect()
    return {
      x: Math.floor((event.clientX - rect.left) / (rect.width / GRID_SIZE)),
      y: Math.floor((event.clientY - rect.top) / (rect.height / GRID_SIZE)),
    }
  }

  // Pointer events arrive sampled, not continuous -- a quick swipe can jump
  // several cells between two events. Walking the line between samples
  // (Bresenham) keeps a fast stroke solid instead of dotted.
  const paintLine = (from, to, isStrokeStart) => {
    let { x, y } = from
    const dx = Math.abs(to.x - x)
    const dy = -Math.abs(to.y - y)
    const stepX = x < to.x ? 1 : -1
    const stepY = y < to.y ? 1 : -1
    let error = dx + dy
    let first = isStrokeStart

    for (;;) {
      if (x >= 0 && y >= 0 && x < GRID_SIZE && y < GRID_SIZE) {
        onPaint(y * GRID_SIZE + x, first)
        first = false
      }
      if (x === to.x && y === to.y) break
      const doubled = 2 * error
      if (doubled >= dy) {
        error += dy
        x += stepX
      }
      if (doubled <= dx) {
        error += dx
        y += stepY
      }
    }
  }

  const handlePointerDown = (event) => {
    if (!editable) return
    event.preventDefault()
    gridRef.current.setPointerCapture(event.pointerId)
    paintingRef.current = true
    const cell = cellAt(event)
    lastCell.current = cell
    paintLine(cell, cell, true)
  }

  const handlePointerMove = (event) => {
    if (!editable || !paintingRef.current) return
    const cell = cellAt(event)
    paintLine(lastCell.current ?? cell, cell, false)
    lastCell.current = cell
  }

  const stopPainting = () => {
    paintingRef.current = false
    lastCell.current = null
  }

  return (
    <div
      ref={gridRef}
      className={`pixel-grid${editable ? ' is-editable' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopPainting}
      onPointerCancel={stopPainting}
    >
      {grid.map((color, index) => (
        <div
          key={index}
          className="pixel-cell"
          style={color ? { backgroundColor: PALETTE[color] } : undefined}
        />
      ))}
    </div>
  )
}

PixelGrid.propTypes = {
  grid: PropTypes.arrayOf(PropTypes.number).isRequired,
  editable: PropTypes.bool,
  onPaint: PropTypes.func,
}

function DrawPhase({ onFinish }) {
  const [word, setWord] = useState(() => randomWord())
  const [usedWords, setUsedWords] = useState([])
  const [grid, setGrid] = useState(emptyGrid)
  const [color, setColor] = useState(1)
  const [erasing, setErasing] = useState(false)
  const [history, setHistory] = useState([])

  // A drag fires many pointer events per frame; React may batch them, which
  // would make a render-closure read of `grid` stale and drop pixels. This ref
  // always holds the latest grid, so every event paints onto the real state.
  const liveGrid = useRef(grid)
  // Snapshot taken at pointer-down, pushed to history only once the stroke
  // actually changes something -- so a click on an identical cell does not
  // leave a dead undo step.
  const strokeSnapshot = useRef(null)

  const applyGrid = (next) => {
    liveGrid.current = next
    setGrid(next)
  }

  const paint = (index, isStrokeStart) => {
    if (index < 0) return
    const value = erasing ? 0 : color
    if (isStrokeStart) strokeSnapshot.current = liveGrid.current

    const current = liveGrid.current
    if (current[index] === value) return

    if (strokeSnapshot.current) {
      const snapshot = strokeSnapshot.current
      strokeSnapshot.current = null
      setHistory((past) => [...past.slice(-40), snapshot])
    }

    const next = [...current]
    next[index] = value
    applyGrid(next)
  }

  const commit = (next) => {
    setHistory((past) => [...past.slice(-40), liveGrid.current])
    applyGrid(next)
  }

  const undo = () => {
    if (!history.length) return
    applyGrid(history[history.length - 1])
    setHistory(history.slice(0, -1))
  }

  const reroll = () => {
    const next = randomWord([word, ...usedWords])
    setUsedWords((past) => [...past, word])
    setWord(next)
  }

  return (
    <div className="pixel-phase">
      <p className="pixel-eyebrow">Draw this word</p>
      <h2 className="pixel-word">{word}</h2>
      <button className="pixel-link-button" type="button" onClick={reroll}>
        different word
      </button>

      <PixelGrid grid={grid} editable onPaint={paint} />

      <div className="pixel-palette">
        {PALETTE.map((swatch, index) =>
          swatch ? (
            <button
              key={swatch}
              type="button"
              aria-label={`Color ${index}`}
              className={`pixel-swatch${!erasing && color === index ? ' is-active' : ''}`}
              style={{ backgroundColor: swatch }}
              onClick={() => {
                setColor(index)
                setErasing(false)
              }}
            />
          ) : null
        )}
      </div>

      <div className="pixel-tools">
        <button
          type="button"
          className={erasing ? 'is-active' : ''}
          onClick={() => setErasing((on) => !on)}
        >
          Eraser
        </button>
        <button type="button" onClick={undo} disabled={!history.length}>
          Undo
        </button>
        <button type="button" onClick={() => commit(emptyGrid())} disabled={isBlank(grid)}>
          Clear
        </button>
      </div>

      <button
        type="button"
        className="pixel-primary"
        disabled={isBlank(grid)}
        onClick={() => onFinish(grid, word)}
      >
        Done — get my link
      </button>
      {isBlank(grid) && <p className="pixel-hint">Draw something first.</p>}
    </div>
  )
}

DrawPhase.propTypes = {
  onFinish: PropTypes.func.isRequired,
}

function SharePhase({ grid, word, onRestart }) {
  const url = buildChallengeUrl(grid, word)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const share = () => {
    navigator.share({ title: 'Guess the Pixel', text: 'Can you guess what this is?', url })
      .catch(() => {})
  }

  return (
    <div className="pixel-phase">
      <p className="pixel-eyebrow">Your drawing of</p>
      <h2 className="pixel-word">{word}</h2>

      <PixelGrid grid={grid} editable={false} />

      <p className="pixel-hint">
        Send this link. It opens straight to the guessing screen — the word stays hidden.
      </p>

      <input className="pixel-url" readOnly value={url} onFocus={(e) => e.target.select()} />

      <div className="pixel-tools">
        <button type="button" className="pixel-primary" onClick={copy}>
          {copied ? 'Copied' : 'Copy link'}
        </button>
        {typeof navigator !== 'undefined' && navigator.share && (
          <button type="button" onClick={share}>
            Share
          </button>
        )}
      </div>

      <button className="pixel-link-button" type="button" onClick={onRestart}>
        draw another
      </button>
    </div>
  )
}

SharePhase.propTypes = {
  grid: PropTypes.arrayOf(PropTypes.number).isRequired,
  word: PropTypes.string.isRequired,
  onRestart: PropTypes.func.isRequired,
}

function TriedList({ guesses }) {
  if (!guesses.length) return null
  return (
    <div className="pixel-tried">
      <p className="pixel-tried-label">Already tried ({guesses.length})</p>
      <ul className="pixel-tried-list">
        {guesses.map((attempt) => (
          // Guesses are de-duplicated on this same value, so the key is unique.
          <li key={normalize(attempt)}>{attempt}</li>
        ))}
      </ul>
    </div>
  )
}

TriedList.propTypes = {
  guesses: PropTypes.arrayOf(PropTypes.string).isRequired,
}

// Hint 2 counts letters, not characters, so "ice cream" reads as two words
// rather than a confusing "9".
function describeLength(word) {
  const parts = word.split(' ').filter(Boolean)
  const plural = (n) => `${n} letter${n === 1 ? '' : 's'}`
  if (parts.length === 1) return plural(word.length)
  return `${parts.length} words — ${parts.map((part) => part.length).join(' and ')} letters`
}

function GuessPhase({ grid, word, onDrawBack }) {
  const [guess, setGuess] = useState('')
  const [wrongGuesses, setWrongGuesses] = useState([])
  const [hintsUsed, setHintsUsed] = useState(0)
  const [repeated, setRepeated] = useState(false)
  const [outcome, setOutcome] = useState(null) // 'correct' | 'revealed'

  const hints = [`Starts with "${word[0].toUpperCase()}"`, describeLength(word)]

  const submit = (event) => {
    event.preventDefault()
    const attempt = guess.trim()
    if (!attempt) return

    if (isCorrectGuess(attempt, word)) {
      setOutcome('correct')
      return
    }

    // A repeat of something already tried is not a new wrong guess -- it would
    // pad the list and inflate the final count. Compared with the grader's own
    // normalization, so "cat", "Cat!" and "a cat" count as one attempt.
    const alreadyTried = wrongGuesses.some(
      (past) => normalize(past) === normalize(attempt)
    )
    if (!alreadyTried) setWrongGuesses((past) => [...past, attempt])
    setRepeated(alreadyTried)
    setGuess('')
  }

  return (
    <div className="pixel-phase">
      <p className="pixel-eyebrow">Someone drew this. What is it?</p>

      <PixelGrid grid={grid} editable={false} />

      {outcome ? (
        <>
          <h2 className={`pixel-word${outcome === 'correct' ? ' is-correct' : ''}`}>{word}</h2>
          <p className="pixel-hint">
            {outcome === 'correct'
              ? wrongGuesses.length === 0
                ? 'Got it first try.'
                : `Got it in ${wrongGuesses.length + 1} guesses.`
              : 'That was the word.'}
          </p>
          <TriedList guesses={wrongGuesses} />
          <button type="button" className="pixel-primary" onClick={onDrawBack}>
            Draw one back
          </button>
        </>
      ) : (
        <>
          <form className="pixel-guess-form" onSubmit={submit}>
            <input
              className="pixel-input"
              value={guess}
              onChange={(event) => {
                setGuess(event.target.value)
                if (repeated) setRepeated(false)
              }}
              placeholder="Type your guess"
              autoComplete="off"
              autoFocus
            />
            <button type="submit" className="pixel-primary">
              Guess
            </button>
          </form>

          {repeated && <p className="pixel-hint pixel-miss">You already tried that one.</p>}

          {hintsUsed > 0 && (
            <ul className="pixel-hints">
              {hints.slice(0, hintsUsed).map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          )}

          <TriedList guesses={wrongGuesses} />

          <div className="pixel-tools">
            {hintsUsed < hints.length && (
              <button type="button" onClick={() => setHintsUsed((used) => used + 1)}>
                {hintsUsed === 0 ? 'Get a hint' : 'One more hint'}
              </button>
            )}
            <button type="button" onClick={() => setOutcome('revealed')}>
              I give up
            </button>
          </div>
        </>
      )}
    </div>
  )
}

GuessPhase.propTypes = {
  grid: PropTypes.arrayOf(PropTypes.number).isRequired,
  word: PropTypes.string.isRequired,
  onDrawBack: PropTypes.func.isRequired,
}

export default function PixelGame({ initialChallenge, onExit }) {
  const [challenge, setChallenge] = useState(initialChallenge ?? null)
  const [finished, setFinished] = useState(null)

  const startFresh = () => {
    clearChallengeFromUrl()
    setChallenge(null)
    setFinished(null)
  }

  const close = () => {
    clearChallengeFromUrl()
    onExit()
  }

  let phase
  if (challenge) {
    phase = <GuessPhase grid={challenge.grid} word={challenge.word} onDrawBack={startFresh} />
  } else if (finished) {
    phase = <SharePhase grid={finished.grid} word={finished.word} onRestart={startFresh} />
  } else {
    phase = <DrawPhase onFinish={(grid, word) => setFinished({ grid, word })} />
  }

  return (
    <div className="pixel-game">
      <div className="pixel-game-inner">
        <header className="pixel-header">
          <h1 className="pixel-title">Guess the Pixel</h1>
          <button className="pixel-close" type="button" onClick={close} aria-label="Close game">
            ×
          </button>
        </header>
        {phase}
      </div>
    </div>
  )
}

PixelGame.propTypes = {
  initialChallenge: PropTypes.shape({
    grid: PropTypes.arrayOf(PropTypes.number).isRequired,
    word: PropTypes.string.isRequired,
  }),
  onExit: PropTypes.func.isRequired,
}
