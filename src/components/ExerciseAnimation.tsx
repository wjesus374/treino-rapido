import { useEffect, useMemo, useState } from 'react'

import type { Exercise } from '../types'

type ExerciseAnimationProps = {
  exercise: Exercise
}

export function ExerciseAnimation({ exercise }: ExerciseAnimationProps) {
  const frames = useMemo(
    () => [...(exercise.videoFrames ?? [])].filter((frame): frame is string => Boolean(frame && frame.trim().length > 0)),
    [exercise.videoFrames],
  )

  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState<0.5 | 1>(1)

  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return

    const delay = speed === 0.5 ? 1800 : 900
    const timer = window.setInterval(() => {
      setFrameIndex((current) => {
        if (frames.length === 1) return 0

        const sequence = frames.length === 3 ? [0, 1, 2, 1] : Array.from({ length: frames.length }, (_, index) => index)
        const currentPosition = sequence.indexOf(current)
        const nextPosition = (currentPosition + 1) % sequence.length
        return sequence[nextPosition]
      })
    }, delay)

    return () => window.clearInterval(timer)
  }, [frames, isPlaying, speed])

  const currentFrame = frames[frameIndex] ?? exercise.imageUrl ?? null

  if (!currentFrame) {
    return (
      <div className="animation-fallback">
        <strong>Demonstração indisponível</strong>
        <span>Consulte as instruções de execução abaixo.</span>
      </div>
    )
  }

  return (
    <div className="animation-panel">
      <div className="animation-frame">
        <img src={currentFrame} alt={exercise.name} />
      </div>

      <div className="animation-controls">
        <div className="animation-actions">
          <button type="button" className="secondary-button compact" onClick={() => setIsPlaying((current) => !current)}>
            {isPlaying ? 'Pausar' : 'Play'}
          </button>
          <button type="button" className="secondary-button compact" onClick={() => { setFrameIndex(0); setIsPlaying(true) }}>
            Replay
          </button>
        </div>

        <div className="speed-toggle" aria-label="Velocidade da animação">
          <button type="button" className={speed === 0.5 ? 'active' : ''} onClick={() => setSpeed(0.5)}>
            0.5x
          </button>
          <button type="button" className={speed === 1 ? 'active' : ''} onClick={() => setSpeed(1)}>
            1x
          </button>
        </div>
      </div>
    </div>
  )
}
