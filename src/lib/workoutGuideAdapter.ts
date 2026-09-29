import {
  exercises as officialExercises,
  getAssetUrl,
  type Exercise as WorkoutGuideExercise,
} from '@bryllim/workout-guide'

import type { Exercise } from '../types'

const equipmentTranslations: Record<string, string> = {
  Barbell: 'Barra',
  Dumbbell: 'Halteres',
  Machine: 'Máquina',
  Cable: 'Cabo',
  Bodyweight: 'Peso corporal',
  Bench: 'Banco',
  Kettlebell: 'Kettlebell',
  Band: 'Elástico',
  TRX: 'TRX',
  'Pull-up bar': 'Barra de puxada',
  'Cable machine': 'Máquina de cabo',
  'Medicine ball': 'Medicine ball',
  'Smith machine': 'Smith machine',
  'EZ bar': 'Barra EZ',
  'Resistance band': 'Faixa de resistência',
  'Sled': 'Sled',
}

const muscleTranslations: Record<string, string> = {
  Chest: 'Peito',
  Back: 'Costas',
  Shoulders: 'Ombros',
  Biceps: 'Bíceps',
  Triceps: 'Tríceps',
  Quads: 'Quadríceps',
  Hamstrings: 'Posterior da coxa',
  Glutes: 'Glúteos',
  Calves: 'Panturrilhas',
  Core: 'Core',
  'Full Body': 'Corpo inteiro',
  'Lower Body': 'Parte inferior do corpo',
  'Upper Body': 'Parte superior do corpo',
  Forearms: 'Antebraços',
  Adductors: 'Adutores',
  Abs: 'Abdominais',
  Obliques: 'Oblíquos',
  HipFlexors: 'Flexores do quadril',
  'Inner thighs': 'Internas da coxa',
  'Outer thighs': 'Laterais da coxa',
  'Back shoulders': 'Ombros das costas',
  'Neck': 'Pescoço',
}

const exerciseTypeTranslations: Record<string, string> = {
  weight_reps: 'Peso + repetições',
  bodyweight_reps: 'Peso corporal + repetições',
  duration: 'Tempo',
  distance_duration: 'Distância',
  assisted_bodyweight: 'Peso corporal assistido',
}

const displayNameTranslations: Record<string, string> = {
  'Bench Press': 'Supino Reto',
  'Incline Bench Press': 'Supino Inclinado',
  'Dumbbell Bench Press': 'Supino com Halteres',
  'Push-up': 'Flexão',
  'Squat': 'Agachamento',
  'Deadlift': 'Levantamento Terra',
  'Lunge': 'Avanço',
  'Row': 'Remada',
  'Pull-up': 'Puxada',
  'Shoulder Press': 'Press de Ombros',
  'Bicep Curl': 'Rosca Bíceps',
  'Tricep Dip': 'Mergulho',
  'Plank': 'Prancha',
  'Romanian Deadlift': 'Deadlift Rumeno',
}

const genericInstructions = [
  'Posicione-se com a postura correta para o movimento.',
  'Mantenha o controle do movimento e a estabilidade corporal.',
  'Respire de forma constante e execute a carga em ritmo controlado.',
]

const genericTips = [
  'Priorize técnica antes de intensidade.',
  'Ajuste amplitude e carga conforme sua capacidade.',
]

const genericErrors = [
  'Evite impulso ou perda de postura.',
  'Não force o movimento quando a técnica falhar.',
]

const toDisplayName = (name: string) => displayNameTranslations[name] ?? name

const toCategory = (muscle: string) => muscleTranslations[muscle] ?? muscle

const toEquipment = (equipment: string) => equipmentTranslations[equipment] ?? equipment

const toDifficulty = (exercise: WorkoutGuideExercise): Exercise['difficulty'] => {
  if (exercise.isStretch) return 'Iniciante'
  if (exercise.exerciseType === 'weight_reps' || exercise.exerciseType === 'bodyweight_reps') return 'Intermediário'
  return 'Iniciante'
}

const toType = (exercise: WorkoutGuideExercise): Exercise['type'] => {
  if (exercise.isStretch) return 'Alongamento'
  if (exercise.exerciseType === 'duration' || exercise.exerciseType === 'distance_duration') return 'Cardio'
  if (exercise.exerciseType === 'bodyweight_reps') return 'Funcional'
  return 'Musculação'
}

const buildFrames = (exercise: WorkoutGuideExercise) => {
  const frames = exercise.frames.map((frame) => getAssetUrl(exercise.slug, frame.index) ?? `https://cdn.jsdelivr.net/npm/@bryllim/workout-guide@1.0.0/${frame.path}`)
  return frames
}

const buildAttribution = (exercise: WorkoutGuideExercise): Exercise['attribution'] => ({
  creator: exercise.attribution.creator,
  creatorUrl: exercise.attribution.creatorUrl,
  license: exercise.attribution.license,
  licenseUrl: exercise.attribution.licenseUrl,
  sourceName: exercise.attribution.source?.name,
  sourceUrl: exercise.attribution.source?.url,
  sourceLicense: exercise.attribution.source?.license,
  sourceLicenseUrl: exercise.attribution.source?.licenseUrl,
  changes: exercise.attribution.source?.changes,
})

export const workoutGuideExercises: Exercise[] = officialExercises.map((exercise) => ({
  id: exercise.id,
  slug: exercise.slug,
  name: toDisplayName(exercise.name),
  displayName: toDisplayName(exercise.name),
  category: toCategory(exercise.primaryMuscle),
  muscleGroup: toCategory(exercise.primaryMuscle),
  equipment: toEquipment(exercise.equipment),
  difficulty: toDifficulty(exercise),
  type: toType(exercise),
  description: `${toDisplayName(exercise.name)} com foco em ${toCategory(exercise.primaryMuscle)}. Movimentação técnica, controlada e adaptada para treino funcional e de força.`,
  instructions: genericInstructions,
  tips: genericTips,
  errors: genericErrors,
  imageUrl: buildFrames(exercise)[0] ?? '',
  videoFrames: buildFrames(exercise),
  animationUrl: buildFrames(exercise)[0] ?? '',
  isCustom: false,
  isFavorite: false,
  createdAt: new Date().toISOString(),
  exerciseType: exercise.exerciseType,
  primaryMuscle: toCategory(exercise.primaryMuscle),
  secondaryMuscles: exercise.secondaryMuscles.map((muscle) => toCategory(muscle)),
  isStretch: exercise.isStretch,
  frames: exercise.frames.map((frame) => ({ index: frame.index, path: frame.path })),
  attribution: buildAttribution(exercise),
  metadata: {
    equipmentOriginal: exercise.equipment,
    primaryMuscleOriginal: exercise.primaryMuscle,
    exerciseTypeLabel: exerciseTypeTranslations[exercise.exerciseType] ?? exercise.exerciseType,
  },
}))

export const initialExercises = workoutGuideExercises
