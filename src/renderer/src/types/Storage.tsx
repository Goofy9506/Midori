import Store from 'electron-store'
import { Accessor } from 'solid-js'

export type StoreKeys = 'AnilistToken' | 'Logged' | 'EpisodeProgress' | 'Volume' | 'AutoUpdate'

export type StoreContextType = {
  AnilistToken: Accessor<string>
  Logged: Accessor<boolean>
  EpisodeProgress: Accessor<[]>
  Volume: Accessor<number>
  AutoUpdate: Accessor<boolean>
  setStore: (key: StoreKeys, value: any) => Promise<void>
}

export const STORE_SCHEMA: Record<StoreKeys, any> = {
  AnilistToken: {
    type: 'string',
    default: ''
  },
  Logged: {
    type: 'boolean',
    default: ''
  },
  EpisodeProgress: {
    type: '[]',
    default: []
  },
  Volume: {
    type: 'number',
    default: 1
  },
  AutoUpdate: {
    type: 'boolean',
    default: false
  }
}

export type StoreType = Record<StoreKeys, any>
export const STORE: Store<StoreType> = new Store({
  // schema: STORE_SCHEMA,
})
