export type ThemeMode = 'light' | 'dark'
export type UnitSystem = 'kg' | 'lb'
export type DemoMode = 'always' | 'compact' | 'hidden'

export type Profile = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type AppSettings = {
  demoMode: DemoMode
  wakeLockEnabled: boolean
}

export type ExerciseAttribution = {
  creator: string
  creatorUrl?: string
  license: string
  licenseUrl?: string
  sourceName?: string
  sourceUrl?: string
  sourceLicense?: string
  sourceLicenseUrl?: string
  changes?: string
}

export type ExerciseType =
  | 'weight_reps'
  | 'bodyweight_reps'
  | 'duration'
  | 'distance_duration'
  | 'assisted_bodyweight'
  | 'other'

export type ExerciseFrame = {
  index: 1 | 2 | 3
  path: string
}

export type Exercise = {
  id: string
  slug?: string
  name: string
  displayName?: string
  category: string
  muscleGroup: string
  equipment: string
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado'
  type: 'Musculação' | 'Cardio' | 'Alongamento' | 'Funcional'
  description: string
  instructions: string[]
  tips: string[]
  errors: string[]
  imageUrl?: string
  videoFrames?: string[]
  animationUrl?: string
  videoUrl?: string
  isCustom?: boolean
  isFavorite?: boolean
  createdAt?: string
  exerciseType?: ExerciseType
  primaryMuscle?: string
  secondaryMuscles?: string[]
  isStretch?: boolean
  frames?: ExerciseFrame[]
  attribution?: ExerciseAttribution
  metadata?: {
    equipmentOriginal?: string
    primaryMuscleOriginal?: string
    exerciseTypeLabel?: string
  }
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
  dayOfWeek?: string
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
