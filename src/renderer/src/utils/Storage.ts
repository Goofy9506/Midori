import { ipcRenderer } from 'electron'
import { StoreKeys, StoreType } from '../types/Storage'
import { EpisodeProgressType } from '@renderer/types/Player'

const getStore = async (): Promise<StoreType> => {
  const store: StoreType = await ipcRenderer.invoke('getStore')
  return store
}

const getAnilistToken = async (): Promise<string> => {
  const token = await ipcRenderer.invoke('getStoreValue', 'AnilistToken')
  return token
}

const getLogged = async (): Promise<boolean> => {
  const logged = await ipcRenderer.invoke('getStoreValue', 'Logged')
  return logged
}

const getEpisodeProgress = async (): Promise<EpisodeProgressType[]> => {
  const progress = await ipcRenderer.invoke('getStoreValue', 'EpisodeProgress')
  return progress
}

const getVolume = async (): Promise<number> => {
  const volume = await ipcRenderer.invoke('getStoreValue', 'Volume')
  return volume
}

const getAutoUpdate = async (): Promise<boolean> => {
  const autoupdate = await ipcRenderer.invoke('getStoreValue', 'AutoUpdate')
  return autoupdate
}

const getAudioLanguage = async (): Promise<string> => {
  const audiolanguage = await ipcRenderer.invoke('getStoreValue', 'AudioLanguage')
  return audiolanguage
}

const getSkipOPED = async (): Promise<boolean> => {
  const skipoped = await ipcRenderer.invoke('getStoreValue', 'SkipOPED')
  return skipoped
}

const getLoadTimeStamps = async (): Promise<boolean> => {
  const loadtimestamps = await ipcRenderer.invoke('getStoreValue', 'LoadTimeStamps')
  return loadtimestamps
}

const getAutoPlay = async (): Promise<boolean> => {
  const autoplay = await ipcRenderer.invoke('getStoreValue', 'AutoPlay')
  return autoplay
}

// Interface
const getColorTheme = async (): Promise<string> => {
  const colortheme = await ipcRenderer.invoke('getStoreValue', 'ColorTheme')
  return colortheme
}

const set = async (key: StoreKeys, value: any): Promise<void> => {
  await ipcRenderer.invoke('setStoreValue', key, value)
}

export const STORAGE = {
  getStore,
  getAnilistToken,
  getLogged,
  getEpisodeProgress,
  getVolume,
  getAutoUpdate,
  getAudioLanguage,
  getSkipOPED,
  getLoadTimeStamps,
  getAutoPlay,

  // Interface
  getColorTheme,
  set
}
