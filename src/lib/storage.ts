import type { AppSettings, Exercise, Profile, Workout, WorkoutSession } from '../types'

const STORAGE_KEYS = {
  theme: 'fitness-theme',
  profile: 'fitness-profile',
  settings: 'fitness-settings',
  exercises: 'fitness-exercises',
  workouts: 'fitness-workouts',
  sessions: 'fitness-sessions',
}

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export const saveToStorage = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getTheme = (): 'light' | 'dark' => {
  return loadFromStorage(STORAGE_KEYS.theme, 'dark')
}

export const saveTheme = (theme: 'light' | 'dark') => {
  saveToStorage(STORAGE_KEYS.theme, theme)
}

export const getProfile = (): Profile => {
  const fallback: Profile = {
    id: 'profile-local',
    name: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return loadFromStorage(STORAGE_KEYS.profile, fallback)
}

export const saveProfile = (profile: Profile) => {
  saveToStorage(STORAGE_KEYS.profile, profile)
}

export const getSettings = (): AppSettings => {
  return loadFromStorage(STORAGE_KEYS.settings, {
    demoMode: 'always',
    wakeLockEnabled: false,
  } as AppSettings)
}

export const saveSettings = (settings: AppSettings) => {
  saveToStorage(STORAGE_KEYS.settings, settings)
}

export const getExercises = (): Exercise[] => {
  return loadFromStorage(STORAGE_KEYS.exercises, [] as Exercise[])
}

export const saveExercises = (exercises: Exercise[]) => {
  saveToStorage(STORAGE_KEYS.exercises, exercises)
}

export const getWorkouts = (): Workout[] => {
  return loadFromStorage(STORAGE_KEYS.workouts, [] as Workout[])
}

export const saveWorkouts = (workouts: Workout[]) => {
  saveToStorage(STORAGE_KEYS.workouts, workouts)
}

export const getSessions = (): WorkoutSession[] => {
  return loadFromStorage(STORAGE_KEYS.sessions, [] as WorkoutSession[])
}

export const saveSessions = (sessions: WorkoutSession[]) => {
  saveToStorage(STORAGE_KEYS.sessions, sessions)
}
