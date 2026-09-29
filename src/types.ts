export type ThemeMode = 'light' | 'dark'
export type UnitSystem = 'kg' | 'lb'

export type Exercise = {
  id: string
  name: string
  category: string
  muscleGroup: string
  equipment: string
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado'
  type: 'Musculação' | 'Cardio' | 'Alongamento' | 'Funcional'
  description: string
  instructions: string[]
  tips: string[]
  errors: string[]
  isCustom?: boolean
}

export type WorkoutExercise = {
  id: string
  exerciseId: string
  name: string
  sets: number
  reps: number
  load: number
  rest: number
  notes: string
}

export type Workout = {
  id: string
  name: string
  description: string
  goal: string
  exercises: WorkoutExercise[]
  createdAt: string
}

export type WorkoutSession = {
  id: string
  workoutId: string
  workoutName: string
  date: string
  durationMinutes: number
  exercises: number
  sets: number
  volume: number
}
