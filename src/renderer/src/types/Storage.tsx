import Store from 'electron-store'
import { Accessor } from 'solid-js'

export type StoreKeys =
  | 'AnilistToken'
  | 'Logged'
  | 'EpisodeProgress'
  | 'Volume'
  | 'AutoUpdate'
  | 'AudioLanguage'
  | 'SkipOPED'
  | 'LoadTimeStamps'
  | 'AutoPlay'

export type StoreContextType = {
  AnilistToken: Accessor<string>
  Logged: Accessor<boolean>
  EpisodeProgress: Accessor<[]>
  Volume: Accessor<number>
  AutoUpdate: Accessor<boolean>
  AudioLanguage: Accessor<string>
  SkipOPED: Accessor<boolean>
  LoadTimeStamps: Accessor<boolean>
  AutoPlay: Accessor<boolean>
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
  },
  AudioLanguage: {
    type: 'string',
    default: 'ja'
  },
  SkipOPED: {
    type: 'boolean',
    default: false
  },
  LoadTimeStamps: {
    type: 'boolean',
    default: false
  },
  AutoPlay: {
    type: 'boolean',
    default: true
  }
}

export type StoreType = Record<StoreKeys, any>
export const STORE: Store<StoreType> = new Store({
  // schema: STORE_SCHEMA,
})
