import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { ExerciseAnimation } from './components/ExerciseAnimation'
import { defaultWorkout } from './data/defaultWorkout'
import { initialExercises } from './data/exercises'
import {
  getExercises,
  getProfile,
  getSettings,
  getSessions,
  getTheme,
  getWorkouts,
  saveExercises,
  saveProfile,
  saveSessions,
  saveSettings,
  saveTheme,
  saveWorkouts,
} from './lib/storage'
import type { AppSettings, Exercise, Profile, Workout, WorkoutExercise, WorkoutSession } from './types'

const formatSeconds = (seconds: number) => {
  const total = Math.max(0, seconds)
  const minutes = String(Math.floor(total / 60)).padStart(2, '0')
  const secs = String(total % 60).padStart(2, '0')
  return `${minutes}:${secs}`
}

type WorkoutPhase = 'ready' | 'running' | 'paused' | 'rest' | 'finished'

const defaultProfile: Profile = {
  id: 'profile-local',
  name: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const defaultSettings: AppSettings = {
  demoMode: 'always',
  wakeLockEnabled: false,
}

const WEEK_DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

const readySeriesGuide = Array.from({ length: 50 }, (_, index) => {
  const presets = [
    ['Agachamento livre', 'Pernas', 4, 8, 35, 90],
    ['Supino reto', 'Peito', 4, 8, 30, 90],
    ['Levantamento terra', 'Costas', 4, 6, 45, 120],
    ['Remada curvada', 'Costas', 3, 10, 25, 75],
    ['Desenvolvimento', 'Ombros', 4, 8, 20, 75],
    ['Puxada alta', 'Costas', 3, 10, 25, 60],
    ['Cadeira extensora', 'Pernas', 4, 12, 20, 60],
    ['Rosca direta', 'Braços', 3, 12, 15, 45],
    ['Crucifixo', 'Peito', 3, 12, 14, 60],
    ['Leg press', 'Pernas', 4, 10, 40, 75],
  ] as const

  const [name, focus, sets, reps, load, rest] = presets[index % presets.length]

  return {
    id: `series-${index + 1}`,
    name: `${name} ${index + 1}`,
    focus,
    sets,
    reps,
    load: load + Math.floor(index / 5) * 5,
    rest,
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
  }
})

const createExercise = (): Exercise => ({
  id: `custom-${Date.now()}`,
  name: 'Novo exercício',
  category: 'Peito',
  muscleGroup: 'Peito',
  equipment: 'Máquina',
  difficulty: 'Iniciante',
  type: 'Musculação',
  description: 'Exercício personalizado.',
  instructions: ['Posicione-se corretamente.', 'Controle a execução.'],
  tips: ['Mantenha a postura.', 'Respire no tempo do movimento.'],
  errors: ['Evite impulso.', 'Não force o ROM.'],
  imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
  videoFrames: [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
  ],
  isCustom: true,
  attribution: {
    creator: 'Usuário local',
    creatorUrl: '',
    license: 'Uso local',
    licenseUrl: '',
    sourceName: 'Cadastro do usuário',
    sourceUrl: '',
  },
})

const createSession = (workout: Workout, elapsedSeconds: number): WorkoutSession => ({
  id: `session-${Date.now()}`,
  workoutId: workout.id,
  workoutName: workout.name,
  date: new Date().toISOString(),
  durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
  exercises: workout.exercises.length,
  sets: workout.exercises.reduce((total, item) => total + item.sets, 0),
  volume: workout.exercises.reduce((total, item) => total + item.sets * item.reps * item.load, 0),
})

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getTheme())
  const [profile, setProfile] = useState<Profile>(() => {
    const stored = getProfile()
    return stored.name ? stored : { ...defaultProfile, ...stored }
  })
  const [settings, setSettings] = useState<AppSettings>(() => ({ ...defaultSettings, ...getSettings() }))
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const stored = getExercises()
    return stored.length ? stored : initialExercises
  })
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const stored = getWorkouts()
    return stored.length ? stored : [defaultWorkout]
  })
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => getSessions())
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(defaultWorkout.id)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'inicio' | 'treinos' | 'evolucao' | 'config'>('inicio')
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(initialExercises[0]?.id ?? null)
  const [exerciseDraft, setExerciseDraft] = useState<Exercise | null>(null)
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null)
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [phase, setPhase] = useState<WorkoutPhase>('ready')
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(1)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [restSeconds, setRestSeconds] = useState(0)
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    saveTheme(theme)
  }, [theme])

  useEffect(() => {
    saveProfile(profile)
  }, [profile])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    saveExercises(exercises)
  }, [exercises])

  useEffect(() => {
    saveWorkouts(workouts)
  }, [workouts])

  useEffect(() => {
    saveSessions(sessions)
  }, [sessions])

  useEffect(() => {
    if (!isWorkoutActive || (phase !== 'running' && phase !== 'rest')) return

    const timer = window.setInterval(() => {
      if (phase === 'running') setElapsedSeconds((current) => current + 1)
      if (phase === 'rest') setRestSeconds((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isWorkoutActive, phase])

  useEffect(() => {
    if (phase !== 'rest' || restSeconds > 0) return

    const selectedWorkout = workouts.find((workout) => workout.id === selectedWorkoutId) ?? workouts[0]
    const exercise = selectedWorkout?.exercises[currentExerciseIndex]
    if (!exercise) return

    if (currentSetIndex >= exercise.sets) {
      const nextExerciseIndex = currentExerciseIndex + 1
      if (nextExerciseIndex < (selectedWorkout?.exercises.length ?? 0)) {
        setCurrentExerciseIndex(nextExerciseIndex)
        setCurrentSetIndex(1)
        setPhase('running')
      } else {
        completeWorkout(selectedWorkout)
      }
      return
    }

    setPhase('running')
  }, [phase, restSeconds, currentExerciseIndex, currentSetIndex, selectedWorkoutId, workouts])

  const filteredExercises = useMemo(() => {
    const term = search.toLowerCase()
    return exercises.filter((exercise) => {
      if (!term) return true
      return [exercise.name, exercise.category, exercise.muscleGroup, exercise.equipment].some((field) =>
        field.toLowerCase().includes(term),
      )
    })
  }, [exercises, search])

  const selectedWorkout = workouts.find((workout) => workout.id === selectedWorkoutId) ?? workouts[0]
  const currentExercise = selectedWorkout?.exercises[currentExerciseIndex]
  const selectedExercise = exercises.find((exercise) => exercise.id === selectedExerciseId) ?? exercises[0]

  const selectedFrames = selectedExercise?.videoFrames?.length ? selectedExercise.videoFrames : [selectedExercise?.imageUrl ?? '/icons.svg']

  useEffect(() => {
    if (!selectedFrames || selectedFrames.length <= 1) return
    const intervalId = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % selectedFrames.length)
    }, 900)
    return () => window.clearInterval(intervalId)
  }, [selectedFrames])

  const updateWorkoutExercise = (exerciseId: string, patch: Partial<WorkoutExercise>) => {
    setWorkouts((current) =>
      current.map((workout) =>
        workout.id === selectedWorkoutId
          ? { ...workout, exercises: workout.exercises.map((exercise) => (exercise.id === exerciseId ? { ...exercise, ...patch } : exercise)) }
          : workout,
      ),
    )
  }

  const removeWorkoutExercise = (exerciseId: string) => {
    setWorkouts((current) =>
      current.map((workout) =>
        workout.id === selectedWorkoutId
          ? { ...workout, exercises: workout.exercises.filter((exercise) => exercise.id !== exerciseId) }
          : workout,
      ),
    )
  }

  const addExerciseToWorkout = (exercise: Exercise | undefined) => {
    if (!exercise || !selectedWorkout) return
    const nextExercise: WorkoutExercise = {
      id: `${selectedWorkout.id}-${exercise.id}-${Date.now()}`,
      exerciseId: exercise.id,
      name: exercise.name,
      sets: 3,
      reps: 10,
      load: 0,
      rest: 60,
      notes: '',
    }
    setWorkouts((current) =>
      current.map((workout) =>
        workout.id === selectedWorkout.id ? { ...workout, exercises: [...workout.exercises, nextExercise] } : workout,
      ),
    )
  }

  const addCustomExercise = () => {
    const newExercise = createExercise()
    setExercises((current) => [newExercise, ...current])
    setSelectedExerciseId(newExercise.id)
    setExerciseDraft(newExercise)
  }

  const commitExerciseEdit = () => {
    if (!exerciseDraft) return
    setExercises((current) => current.map((item) => (item.id === exerciseDraft.id ? { ...item, ...exerciseDraft } : item)))
    setEditingExerciseId(null)
    setExerciseDraft(null)
  }

  const deleteExercise = (exerciseId: string) => {
    if (!window.confirm('Remover este exercício da biblioteca?')) return
    setExercises((current) => current.filter((exercise) => exercise.id !== exerciseId))
    setWorkouts((current) =>
      current.map((workout) => ({
        ...workout,
        exercises: workout.exercises.filter((item) => item.exerciseId !== exerciseId),
      })),
    )
    if (selectedExerciseId === exerciseId) setSelectedExerciseId(exercises[0]?.id ?? null)
  }

  const createWorkout = () => {
    const workout: Workout = {
      id: `workout-${Date.now()}`,
      name: 'Novo treino',
      description: 'Treino personalizado',
      goal: 'Geral',
      dayOfWeek: WEEK_DAYS[0],
      createdAt: new Date().toISOString(),
      exercises: [],
    }
    setWorkouts((current) => [workout, ...current])
    setSelectedWorkoutId(workout.id)
  }

  const applyReadySeries = (series: (typeof readySeriesGuide)[number]) => {
    if (!selectedWorkout) return

    const item: WorkoutExercise = {
      id: `${selectedWorkout.id}-ready-${series.id}-${Date.now()}`,
      exerciseId: series.id,
      name: series.name,
      sets: series.sets,
      reps: series.reps,
      load: series.load,
      rest: series.rest,
      notes: `Guia rápido • ${series.focus}`,
    }

    setWorkouts((current) =>
      current.map((workout) =>
        workout.id === selectedWorkout.id ? { ...workout, exercises: [...workout.exercises, item] } : workout,
      ),
    )
  }

  const duplicateWorkout = (workout: Workout) => {
    const duplicate: Workout = {
      ...workout,
      id: `workout-${Date.now()}`,
      name: `${workout.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      exercises: workout.exercises.map((exercise) => ({ ...exercise, id: `${exercise.id}-copy-${Date.now()}` })),
    }
    setWorkouts((current) => [duplicate, ...current])
    setSelectedWorkoutId(duplicate.id)
  }

  const startWorkout = () => {
    if (!selectedWorkout || selectedWorkout.exercises.length === 0) return
    setIsWorkoutActive(true)
    setPhase('running')
    setCurrentExerciseIndex(0)
    setCurrentSetIndex(1)
    setElapsedSeconds(0)
    setRestSeconds(0)
  }

  const togglePause = () => {
    if (!isWorkoutActive) return
    setPhase((current) => (current === 'running' ? 'paused' : current === 'paused' ? 'running' : current))
  }

  const completeCurrentSet = () => {
    if (!selectedWorkout || !currentExercise) return

    const isLastSetOfExercise = currentSetIndex >= currentExercise.sets
    if (isLastSetOfExercise) {
      const nextExerciseIndex = currentExerciseIndex + 1
      if (nextExerciseIndex < selectedWorkout.exercises.length) {
        setCurrentExerciseIndex(nextExerciseIndex)
        setCurrentSetIndex(1)
        setPhase('running')
      } else {
        completeWorkout(selectedWorkout)
      }
      return
    }

    setCurrentSetIndex((current) => current + 1)
    setPhase('rest')
    setRestSeconds(currentExercise.rest || 60)
  }

  const addRest = (seconds: number) => {
    if (phase !== 'rest') return
    setRestSeconds((current) => current + seconds)
  }

  const completeWorkout = (workout: Workout) => {
    const session = createSession(workout, elapsedSeconds)
    setSessions((current) => [session, ...current])
    setIsWorkoutActive(false)
    setPhase('finished')
    setActiveTab('evolucao')
    setCurrentExerciseIndex(0)
    setCurrentSetIndex(1)
    setRestSeconds(0)
  }

  const totalVolume = sessions.reduce((sum, session) => sum + session.volume, 0)

  const exportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile,
      settings,
      exercises,
      workouts,
      sessions,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `treino-rapido-backup-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const payload = JSON.parse(text)
      if (!payload || !Array.isArray(payload.exercises) || !Array.isArray(payload.workouts)) {
        throw new Error('Arquivo inválido')
      }
      if (payload.profile && payload.profile.name) setProfile(payload.profile)
      if (payload.settings) setSettings({ ...defaultSettings, ...payload.settings })
      setExercises(payload.exercises)
      setWorkouts(payload.workouts)
      setSessions(Array.isArray(payload.sessions) ? payload.sessions : [])
      setSelectedWorkoutId(payload.workouts[0]?.id ?? defaultWorkout.id)
    } catch {
      window.alert('Backup inválido. Verifique o arquivo exportado pela aplicação.')
    } finally {
      event.target.value = ''
    }
  }

  const resetLocalData = () => {
    if (!window.confirm('Apagar todos os dados locais?')) return
    setProfile({ ...defaultProfile, updatedAt: new Date().toISOString() })
    setSettings(defaultSettings)
    setExercises(initialExercises)
    setWorkouts([defaultWorkout])
    setSessions([])
    setSelectedWorkoutId(defaultWorkout.id)
    setActiveTab('inicio')
  }

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined)
    }
  }, [])

  const editExercise = (exercise: Exercise) => {
    setExerciseDraft(exercise)
    setEditingExerciseId(exercise.id)
  }

  const topGreeting = profile.name ? `Olá, ${profile.name} 👋` : 'Olá! 👋'
  const workoutProgress = selectedWorkout
    ? Math.min(100, Math.round(((currentExerciseIndex + (phase === 'rest' ? 0.5 : 0)) / Math.max(selectedWorkout.exercises.length, 1)) * 100))
    : 0

  const setDraftAttribution = (field: keyof NonNullable<Exercise['attribution']>, value: string) => {
    setExerciseDraft((current) => {
      if (!current) return current

      const attribution = current.attribution ?? {
        creator: '',
        creatorUrl: '',
        license: '',
        licenseUrl: '',
        sourceName: '',
        sourceUrl: '',
        sourceLicense: '',
        sourceLicenseUrl: '',
        changes: '',
      }

      return {
        ...current,
        attribution: { ...attribution, [field]: value } as NonNullable<Exercise['attribution']>,
      }
    })
  }

  const demoModeActive = settings.demoMode !== 'hidden'
  const demoCompact = settings.demoMode === 'compact'

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">{profile.name ? 'Perfil' : 'Olá!'}</p>
          <h1>{topGreeting}</h1>
        </div>
        <button className="theme-toggle" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="content">
        {activeTab === 'inicio' && (
          <>
            {isWorkoutActive && selectedWorkout && currentExercise ? (
              <section className="execution-card card">
                <div className="execution-header">
                  <p className="eyebrow">{selectedWorkout.name}</p>
                  <div className="progress-track"><span style={{ width: `${workoutProgress}%` }} /></div>
                </div>

                {demoModeActive && (
                  <div className={`exercise-media ${demoCompact ? 'compact' : ''}`}>
                    <img src={selectedExercise?.videoFrames?.[frameIndex] ?? selectedExercise?.imageUrl ?? '/icons.svg'} alt={currentExercise.name} />
                  </div>
                )}

                <h2>{currentExercise.name}</h2>
                <div className="series-badge">Série {currentSetIndex} de {currentExercise.sets}</div>
                <div className="stats-panel execution-stats">
                  <div><span>Grupo</span><strong>{selectedExercise?.muscleGroup ?? currentExercise.name}</strong></div>
                  <div><span>Carga</span><strong>{currentExercise.load} kg</strong></div>
                  <div><span>Tempo</span><strong>{formatSeconds(elapsedSeconds)}</strong></div>
                </div>

                {phase === 'rest' ? (
                  <div className="rest-panel">
                    <span>DESCANSO</span>
                    <strong>{formatSeconds(restSeconds)}</strong>
                    <small>Próxima série: {currentExercise.name}</small>
                  </div>
                ) : (
                  <div className="rest-panel idle">
                    <span>PROGRESSO</span>
                    <strong>{Math.round(((currentSetIndex - 1) / Math.max(currentExercise.sets, 1)) * 100)}%</strong>
                  </div>
                )}

                <div className="execution-actions">
                  {phase === 'running' && <button className="primary-button" onClick={completeCurrentSet}>✓ CONCLUIR SÉRIE</button>}
                  {phase === 'paused' && <button className="primary-button" onClick={togglePause}>CONTINUAR TREINO</button>}
                  {phase === 'rest' && (
                    <>
                      <button className="primary-button" onClick={() => addRest(30)}>+30s</button>
                      <button className="secondary-button" onClick={() => setPhase('running')}>PULAR DESCANSO</button>
                    </>
                  )}
                  {(phase === 'running' || phase === 'paused') && (
                    <button className="ghost-button" onClick={togglePause}>{phase === 'running' ? 'PAUSAR' : 'CONTINUAR'}</button>
                  )}
                  {phase === 'finished' && <button className="primary-button" onClick={() => setActiveTab('evolucao')}>VER RESUMO</button>}
                </div>
              </section>
            ) : (
              <section className="hero-card card">
                <div>
                  <span className="badge">Treino ativo</span>
                  <h2>{selectedWorkout?.name ?? 'Treino vazio'}</h2>
                  <p>{selectedWorkout?.description ?? 'Crie seu primeiro treino'}</p>
                  <small>
                    {selectedWorkout?.exercises.length ?? 0} exercícios · {selectedWorkout?.exercises.reduce((total, item) => total + item.sets, 0) ?? 0} séries
                  </small>
                </div>
                {selectedExercise && demoModeActive && (
                  <div className={`exercise-media ${demoCompact ? 'compact' : ''}`}>
                    <img src={selectedExercise.videoFrames?.[frameIndex] ?? selectedExercise.imageUrl ?? '/icons.svg'} alt={selectedExercise.name} />
                  </div>
                )}
                <button className="primary-button" onClick={startWorkout}>INICIAR TREINO</button>
              </section>
            )}

            <section className="section-block">
              <h3>Treinos recentes</h3>
              <div className="list-stack">
                {sessions.length ? sessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="mini-card card">
                    <div>
                      <strong>{session.workoutName}</strong>
                      <span>{new Date(session.date).toLocaleDateString('pt-BR')} · {session.durationMinutes} min</span>
                    </div>
                  </div>
                )) : <div className="empty-state card">Nenhum treino registrado ainda.</div>}
              </div>
            </section>

            <section className="metrics grid-3">
              <div className="metric card"><label>Volume total</label><strong>{totalVolume} kg</strong></div>
              <div className="metric card"><label>Melhores marcas</label><strong>{Math.max(...sessions.map((session) => session.volume), 0)} kg</strong></div>
              <div className="metric card"><label>Consistência</label><strong>{sessions.length} treinos</strong></div>
            </section>
          </>
        )}

        {activeTab === 'treinos' && (
          <>
            <section className="section-block">
              <div className="section-header">
                <h3>Treinos</h3>
                <button className="ghost-button" onClick={createWorkout}>Novo treino</button>
              </div>
              <div className="list-stack">
                {workouts.map((workout) => (
                  <div key={workout.id} className={`card workout-card ${selectedWorkoutId === workout.id ? 'active' : ''}`} onClick={() => setSelectedWorkoutId(workout.id)} role="button" tabIndex={0} onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') setSelectedWorkoutId(workout.id)
                  }}>
                    <div>
                      <strong>{workout.name}</strong>
                      <span>{workout.exercises.length} exercícios {workout.dayOfWeek ? `· ${workout.dayOfWeek}` : ''}</span>
                    </div>
                    <div className="inline-actions">
                      <button className="small-button" onClick={(event) => { event.stopPropagation(); duplicateWorkout(workout) }}>Duplicar</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {selectedWorkout && (
              <section className="section-block">
                <div className="card workout-editor">
                  <label className="field-label">Nome do treino</label>
                  <input className="search" value={selectedWorkout.name} onChange={(event) => setWorkouts((current) => current.map((workout) => workout.id === selectedWorkout.id ? { ...workout, name: event.target.value } : workout))} />

                  <label className="field-label">Descrição</label>
                  <textarea className="search textarea" value={selectedWorkout.description} onChange={(event) => setWorkouts((current) => current.map((workout) => workout.id === selectedWorkout.id ? { ...workout, description: event.target.value } : workout))} />

                  <div className="day-selector">
                    <label className="field-label">Dia da semana</label>
                    <div className="day-grid">
                      {WEEK_DAYS.map((day) => (
                        <button
                          key={day}
                          type="button"
                          className={selectedWorkout.dayOfWeek === day ? 'active' : ''}
                          onClick={() => setWorkouts((current) => current.map((workout) => workout.id === selectedWorkout.id ? { ...workout, dayOfWeek: day } : workout))}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="exercise-list">
                    {selectedWorkout.exercises.length ? selectedWorkout.exercises.map((exercise) => (
                      <div key={exercise.id} className="exercise-row card">
                        <div><strong>{exercise.name}</strong><span>{exercise.sets} séries · {exercise.reps} rep · {exercise.load} kg · {exercise.rest}s</span></div>
                        <div className="inline-actions">
                          <button className="small-button" onClick={() => setEditingExerciseId(editingExerciseId === exercise.id ? null : exercise.id)}>Editar</button>
                          <button className="small-button danger" onClick={() => removeWorkoutExercise(exercise.id)}>Remover</button>
                        </div>
                      </div>
                    )) : <div className="empty-state card">Nenhum exercício adicionado ao treino.</div>}
                  </div>

                  {editingExerciseId && (() => {
                    const exerciseToEdit = selectedWorkout.exercises.find((exercise) => exercise.id === editingExerciseId)
                    if (!exerciseToEdit) return null
                    return (
                      <div className="editing-panel card">
                        <strong>{exerciseToEdit.name}</strong>
                        <div className="field-grid">
                          <label>Séries<input type="number" value={exerciseToEdit.sets} onChange={(event) => updateWorkoutExercise(exerciseToEdit.id, { sets: Number(event.target.value || 1) })} /></label>
                          <label>Repetições<input type="number" value={exerciseToEdit.reps} onChange={(event) => updateWorkoutExercise(exerciseToEdit.id, { reps: Number(event.target.value || 1) })} /></label>
                          <label>Carga<input type="number" value={exerciseToEdit.load} onChange={(event) => updateWorkoutExercise(exerciseToEdit.id, { load: Number(event.target.value || 0) })} /></label>
                          <label>Descanso<input type="number" value={exerciseToEdit.rest} onChange={(event) => updateWorkoutExercise(exerciseToEdit.id, { rest: Number(event.target.value || 30) })} /></label>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </section>
            )}

            <section className="section-block">
              <div className="section-header"><h3>Biblioteca</h3></div>
              <input className="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar exercício..." />
              <div className="quick-series-block">
                <div className="section-header"><h4>Guia de 50 séries prontas</h4></div>
                <div className="quick-series-grid">
                  {readySeriesGuide.slice(0, 12).map((series) => (
                    <button key={series.id} type="button" className="quick-series-card" onClick={() => applyReadySeries(series)}>
                      <img src={series.imageUrl} alt={series.name} />
                      <div>
                        <strong>{series.name}</strong>
                        <span>{series.sets}x{series.reps} · {series.rest}s</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="list-stack library-list">
                {filteredExercises.map((exercise) => (
                  <div key={exercise.id} className="exercise-row card">
                    <div className="exercise-row-main">
                      <div className="exercise-thumb">
                        <img src={exercise.imageUrl ?? exercise.videoFrames?.[0] ?? 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80'} alt={exercise.name} />
                      </div>
                      <div>
                        <strong>{exercise.name}</strong>
                        <span>{exercise.category} · {exercise.equipment}</span>
                      </div>
                    </div>
                    <div className="inline-actions">
                      <button className="small-button" onClick={() => setSelectedExerciseId(exercise.id)}>Ver</button>
                      <button className="small-button" onClick={() => editExercise(exercise)}>Editar</button>
                      <button className="small-button" onClick={() => addExerciseToWorkout(exercise)}>+</button>
                      <button className="small-button danger" onClick={() => deleteExercise(exercise.id)}>Excluir</button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedExercise && (
                <div className="card exercise-detail">
                  <ExerciseAnimation exercise={selectedExercise} />
                  <div className="detail-header">
                    <strong>{selectedExercise.name}</strong>
                    <span>{selectedExercise.category} · {selectedExercise.muscleGroup} · {selectedExercise.type}</span>
                  </div>
                  <p>{selectedExercise.description}</p>
                  <div className="detail-grid">
                    <div>
                      <h4>Instruções</h4>
                      <ul>{selectedExercise.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ul>
                    </div>
                    <div>
                      <h4>Créditos</h4>
                      <p>{selectedExercise.attribution?.creator ?? 'Fonte local'} · {selectedExercise.attribution?.license ?? 'Uso local'}</p>
                      {selectedExercise.attribution?.sourceName && <small>{selectedExercise.attribution.sourceName}</small>}
                      {selectedExercise.attribution?.sourceUrl && <a href={selectedExercise.attribution.sourceUrl} target="_blank" rel="noreferrer">Fonte</a>}
                    </div>
                  </div>
                </div>
              )}

              <button className="secondary-button" onClick={addCustomExercise}>Criar exercício personalizado</button>
            </section>
          </>
        )}

        {activeTab === 'evolucao' && (
          <section className="section-block">
            <h3>Evolução</h3>
            <div className="stats-panel card">
              <div><span>Treinos</span><strong>{sessions.length}</strong></div>
              <div><span>Volume total</span><strong>{totalVolume} kg</strong></div>
              <div><span>Volume médio</span><strong>{sessions.length ? Math.round(totalVolume / sessions.length) : 0} kg</strong></div>
            </div>
            <div className="history-list list-stack">
              {sessions.map((session) => (
                <div key={session.id} className="mini-card card">
                  <div><strong>{session.workoutName}</strong><span>{new Date(session.date).toLocaleDateString('pt-BR')} · {session.durationMinutes} min</span></div>
                  <small>{session.volume} kg</small>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'config' && (
          <section className="section-block config-panel">
            <h3>Configurações</h3>

            <div className="card config-card">
              <label>Perfil</label>
              <input className="search" value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value, updatedAt: new Date().toISOString() }))} placeholder="Digite seu nome" />
            </div>

            <div className="card config-card">
              <label>Preferência de tema</label>
              <div className="segmented">
                <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>Escuro</button>
                <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>Claro</button>
              </div>
            </div>

            <div className="card config-card">
              <label>Demonstrações</label>
              <div className="segmented segmented-column">
                <button className={settings.demoMode === 'always' ? 'active' : ''} onClick={() => setSettings((current) => ({ ...current, demoMode: 'always' }))}>Sempre mostrar</button>
                <button className={settings.demoMode === 'compact' ? 'active' : ''} onClick={() => setSettings((current) => ({ ...current, demoMode: 'compact' }))}>Mostrar compactada</button>
                <button className={settings.demoMode === 'hidden' ? 'active' : ''} onClick={() => setSettings((current) => ({ ...current, demoMode: 'hidden' }))}>Ocultar durante o treino</button>
              </div>
            </div>

            <div className="card config-card">
              <label>Wake Lock</label>
              <button className={`secondary-button ${settings.wakeLockEnabled ? 'enabled' : ''}`} onClick={() => setSettings((current) => ({ ...current, wakeLockEnabled: !current.wakeLockEnabled }))}>{settings.wakeLockEnabled ? 'Desativar tela sempre ativa' : 'Ativar tela sempre ativa'}</button>
            </div>

            <div className="card config-card"><label>Descanso padrão</label><strong>60s</strong></div>

            <div className="card config-card">
              <label>Backup</label>
              <div className="backup-actions">
                <button className="secondary-button" onClick={exportBackup}>Exportar dados</button>
                <label className="file-button secondary-button">Importar dados<input type="file" accept="application/json" onChange={importBackup} /></label>
              </div>
            </div>

            <div className="card config-card danger-card">
              <label>Dados locais</label>
              <button className="danger-button" onClick={resetLocalData}>Apagar todos os dados</button>
            </div>
          </section>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Navegação principal">
        {[['inicio', '🏠'], ['treinos', '🏋️'], ['evolucao', '📊'], ['config', '⚙️']].map(([key, label]) => (
          <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key as typeof activeTab)}>{label}</button>
        ))}
      </nav>

      {!profile.name && (
        <div className="profile-overlay" role="dialog" aria-modal="true">
          <div className="profile-card card">
            <p className="eyebrow">Bem-vindo</p>
            <h2>Como podemos chamar você?</h2>
            <input className="search" value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value, updatedAt: new Date().toISOString() }))} placeholder="Digite seu nome" />
            <button className="primary-button" onClick={() => {
              const trimmed = profile.name.trim()
              if (!trimmed) return
              setProfile((current) => ({ ...current, name: trimmed, updatedAt: new Date().toISOString() }))
            }}>Continuar</button>
          </div>
        </div>
      )}

      {editingExerciseId && exerciseDraft && (
        <div className="editor-overlay" onClick={() => { setEditingExerciseId(null); setExerciseDraft(null) }}>
          <div className="editor-modal card" onClick={(event) => event.stopPropagation()}>
            <div className="editor-header">
              <h3>Editar exercício</h3>
              <button className="ghost-button" onClick={() => { setEditingExerciseId(null); setExerciseDraft(null) }}>Fechar</button>
            </div>

            <div className="editor-grid">
              <label>Nome<input value={exerciseDraft.name} onChange={(event) => setExerciseDraft((current) => current ? { ...current, name: event.target.value } : current)} /></label>
              <label>Categoria<input value={exerciseDraft.category} onChange={(event) => setExerciseDraft((current) => current ? { ...current, category: event.target.value } : current)} /></label>
              <label>Grupo muscular<input value={exerciseDraft.muscleGroup} onChange={(event) => setExerciseDraft((current) => current ? { ...current, muscleGroup: event.target.value } : current)} /></label>
              <label>Equipamento<input value={exerciseDraft.equipment} onChange={(event) => setExerciseDraft((current) => current ? { ...current, equipment: event.target.value } : current)} /></label>
              <label>Dificuldade<select value={exerciseDraft.difficulty} onChange={(event) => setExerciseDraft((current) => current ? { ...current, difficulty: event.target.value as Exercise['difficulty'] } : current)}><option value="Iniciante">Iniciante</option><option value="Intermediário">Intermediário</option><option value="Avançado">Avançado</option></select></label>
              <label>Tipo<select value={exerciseDraft.type} onChange={(event) => setExerciseDraft((current) => current ? { ...current, type: event.target.value as Exercise['type'] } : current)}><option value="Musculação">Musculação</option><option value="Cardio">Cardio</option><option value="Alongamento">Alongamento</option><option value="Funcional">Funcional</option></select></label>
              <label className="full-width">Descrição<textarea value={exerciseDraft.description} onChange={(event) => setExerciseDraft((current) => current ? { ...current, description: event.target.value } : current)} /></label>
              <label className="full-width">Instruções<textarea value={exerciseDraft.instructions.join('\n')} onChange={(event) => setExerciseDraft((current) => current ? { ...current, instructions: event.target.value.split(/\n+/).filter(Boolean) } : current)} /></label>
              <label className="full-width">Dicas<textarea value={exerciseDraft.tips.join('\n')} onChange={(event) => setExerciseDraft((current) => current ? { ...current, tips: event.target.value.split(/\n+/).filter(Boolean) } : current)} /></label>
              <label className="full-width">Erros<textarea value={exerciseDraft.errors.join('\n')} onChange={(event) => setExerciseDraft((current) => current ? { ...current, errors: event.target.value.split(/\n+/).filter(Boolean) } : current)} /></label>
              <label className="full-width">URL da imagem<input value={exerciseDraft.imageUrl ?? ''} onChange={(event) => setExerciseDraft((current) => current ? { ...current, imageUrl: event.target.value } : current)} /></label>
              <label className="full-width">Frames de vídeo (um por linha)<textarea value={(exerciseDraft.videoFrames ?? []).join('\n')} onChange={(event) => setExerciseDraft((current) => current ? { ...current, videoFrames: event.target.value.split(/\n+/).filter(Boolean) } : current)} /></label>
              <label>Créditos<input value={exerciseDraft.attribution?.creator ?? ''} onChange={(event) => setDraftAttribution('creator', event.target.value)} /></label>
              <label>Licença<input value={exerciseDraft.attribution?.license ?? ''} onChange={(event) => setDraftAttribution('license', event.target.value)} /></label>
            </div>

            <div className="editor-actions">
              <button className="secondary-button" onClick={commitExerciseEdit}>Salvar exercício</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
