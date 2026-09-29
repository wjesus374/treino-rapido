import type { Workout } from '../types'

export const defaultWorkout: Workout = {
  id: 'workout-default',
  name: 'Treino A — Peito e Tríceps',
  description: 'Volume de força com foco em peito e pressões fundamentais.',
  goal: 'Hipertrofia',
  createdAt: new Date().toISOString(),
  exercises: [
    { id: 'we-1', exerciseId: 'ex-1', name: 'Supino Reto', sets: 4, reps: 10, load: 30, rest: 90, notes: 'Controle na descida' },
    { id: 'we-2', exerciseId: 'ex-2', name: 'Supino Inclinado', sets: 3, reps: 12, load: 25, rest: 60, notes: 'Foco no peitoral superior' },
    { id: 'we-3', exerciseId: 'ex-4', name: 'Rosca Direta', sets: 3, reps: 12, load: 20, rest: 60, notes: 'Cotovelos travados' },
  ],
}
