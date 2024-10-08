import { ComponentProps, createContext, createEffect, createSignal, useContext } from 'solid-js'
import { STORE_SCHEMA, StoreContextType, StoreKeys } from '../types/Storage'
import { STORAGE } from '../utils/Storage'

const StorageContext = createContext<StoreContextType>({
  AnilistToken: STORE_SCHEMA.AnilistToken.default,
  Logged: STORE_SCHEMA.Logged.default,
  EpisodeProgress: STORE_SCHEMA.EpisodeProgress.default,
  Volume: STORE_SCHEMA.Volume.default,
  AutoUpdate: STORE_SCHEMA.AutoUpdate.default,
  AudioLanguage: STORE_SCHEMA.AudioLanguage.default,
  SkipOPED: STORE_SCHEMA.SkipOPED.default,
  LoadTimeStamps: STORE_SCHEMA.LoadTimeStamps.default,
  AutoPlay: STORE_SCHEMA.AutoPlay.default,

  // Interface
  ColorTheme: STORE_SCHEMA.ColorTheme.default,
  setStore: async () => {}
})

export function useStorageContext() {
  return useContext(StorageContext)
}

/**
 * Custom hook to manage state of AnilistToken, Logged, and EpisodeProgress with storage persistence.
 * @returns Object containing state variables and setStore function
 */
export const useStorage = (): StoreContextType => {
  const [LoadTimeStamps, setLoadTimeStamps] = createSignal<boolean>(STORE_SCHEMA.LoadTimeStamps)
  const [EpisodeProgress, setEpisodeProgress] = createSignal<[]>(STORE_SCHEMA.EpisodeProgress)
  const [AudioLanguage, setAudioLanguage] = createSignal<string>(STORE_SCHEMA.AudioLanguage)
  const [AnilistToken, setAnilistToken] = createSignal<string>(STORE_SCHEMA.AnilistToken)
  const [AutoUpdate, setAutoUpdate] = createSignal<boolean>(STORE_SCHEMA.AutoUpdate)
  const [SkipOPED, setSkipOPED] = createSignal<boolean>(STORE_SCHEMA.SkipOPED)
  const [AutoPlay, setAutoPlay] = createSignal<boolean>(STORE_SCHEMA.AutoPlay)
  const [Logged, setLogged] = createSignal<boolean>(STORE_SCHEMA.Logged)
  const [Volume, setVolume] = createSignal<number>(STORE_SCHEMA.Volume)

  // Interface
  const [ColorTheme, setColorTheme] = createSignal<string>(STORE_SCHEMA.ColorTheme)

  /**
   * Asynchronously loads values from storage and updates the state variables
   */
  const loadStore = async () => {
    const store = await STORAGE.getStore()

    if (store.EpisodeProgress === undefined) STORAGE.set('EpisodeProgress', [])
    if (store.LoadTimeStamps === undefined) STORAGE.set('LoadTimeStamps', false)
    if (store.AudioLanguage === undefined) STORAGE.set('AudioLanguage', 'ja')
    if (store.AnilistToken === undefined) STORAGE.set('AnilistToken', '')
    if (store.AutoUpdate === undefined) STORAGE.set('AutoUpdate', false)
    if (store.AutoPlay === undefined) STORAGE.set('AutoPlay', true)
    if (store.SkipOPED === undefined) STORAGE.set('SkipOPED', false)
    if (store.Logged === undefined) STORAGE.set('Logged', false)
    if (store.Volume === undefined) STORAGE.set('Volume', 1)

    if (store.LoadTimeStamps !== LoadTimeStamps()) setLoadTimeStamps(store.LoadTimeStamps)
    if (store.AudioLanguage !== AudioLanguage()) setAudioLanguage(store.AudioLanguage)
    if (store.AnilistToken !== AnilistToken()) setAnilistToken(store.AnilistToken)
    if (store.AutoUpdate !== AutoUpdate()) setAutoUpdate(store.AutoUpdate)
    if (store.AutoPlay !== AutoPlay()) setAutoPlay(store.AutoPlay)
    if (store.SkipOPED !== SkipOPED()) setSkipOPED(store.SkipOPED)
    if (store.Logged !== Logged()) setLogged(store.Logged)
    if (store.Volume !== Volume()) setVolume(store.Volume)

    // Interface
    if (store.ColorTheme === undefined) STORAGE.set('ColorTheme', 'green')
    if (store.ColorTheme !== ColorTheme()) setColorTheme(store.ColorTheme)
  }

  createEffect(() => {
    loadStore()
  })

  /**
   * Updates state variables and persists changes to storage
   * @param key - Key to update
   * @param value - New value
   */
  const setStore = async (key: StoreKeys, value: any) => {
    switch (key) {
      case 'AnilistToken':
        setAnilistToken(value)
        break
      case 'EpisodeProgress':
        setEpisodeProgress(value)
        break
      case 'Logged':
        setLogged(value)
        break
      case 'Volume':
        setVolume(value)
        break
      case 'AutoUpdate':
        setAutoUpdate(value)
        break
      case 'AudioLanguage':
        setAudioLanguage(value)
        break
      case 'SkipOPED':
        setSkipOPED(value)
        break
      case 'LoadTimeStamps':
        setLoadTimeStamps(value)
        break
      case 'AutoPlay':
        setAutoPlay(value)
        break

      // Interface
      case 'ColorTheme':
        setColorTheme(value)
        break
      default:
        break
    }
    console.log(`store - ${key} updated to ${value}`)
    await STORAGE.set(key, value)
  }

  return {
    AnilistToken,
    Logged,
    EpisodeProgress,
    Volume,
    AutoUpdate,
    AudioLanguage,
    SkipOPED,
    LoadTimeStamps,
    AutoPlay,

    // Interface
    ColorTheme,
    setStore
  }
}

export function StorageProvider(props: ComponentProps<'div'>) {
  const Store = useStorage()

  return <StorageContext.Provider value={Store}>{props.children}</StorageContext.Provider>
}
