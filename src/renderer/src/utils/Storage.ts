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
  set
}
