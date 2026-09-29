import type { Workout } from '../types'

export const defaultWorkout: Workout = {
  id: 'workout-default',
  name: 'Treino A — Peito e Tríceps',
  description: 'Volume de força com foco em peito e triceps.',
  goal: 'Hipertrofia',
  createdAt: new Date().toISOString(),
  exercises: [
    { id: 'we-1', exerciseId: 'exercise-bench-press', name: 'Bench Press', sets: 4, reps: 8, load: 30, rest: 90, notes: 'Controle na descida' },
    { id: 'we-2', exerciseId: 'exercise-incline-bench-press', name: 'Incline Bench Press', sets: 3, reps: 10, load: 25, rest: 75, notes: 'Foco no peitoral superior' },
    { id: 'we-3', exerciseId: 'exercise-close-grip-bench-press', name: 'Close-Grip Bench Press', sets: 3, reps: 10, load: 20, rest: 60, notes: 'Cotovelos travados' },
  ],
}
