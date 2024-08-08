import { createEffect, createSignal, type Component, type ComponentProps } from 'solid-js'

import './styles/App.scss'
import Sidebar from './components/Sidebar'
import Titlebar from './components/Titlebar'
import { StorageProvider } from './hooks/Storage'
import { STORAGE } from './utils/Storage'

import { QLoader } from './services/anilist/QLoader'

export const [animeInfo, setAnimeInfo] = createSignal<any>()
export const [trendingAnimeInfo, setTrendingAnimeInfo] = createSignal<any>(null)
export const [trendingMovies, setTrendingMovies] = createSignal<any>(null)
export const [topRatedAnime, setTopRatedAnime] = createSignal<any>(null)
export const [popularAnime, setPopularAnime] = createSignal<any>(null)
export const [updatedAnimeInfo, setUpdatedAnimeInfo] = createSignal<any>(null)

const App: Component = (props: ComponentProps<'div'>) => {
  const [avatar, setAvatar] = createSignal<string>('')
  const QLoad = new QLoader()

  const defaultSettings = {
    EpisodeProgress: [],
    Volume: 1,
    AutoUpdate: false,
    AudioLanguage: 'ja',
    SkipOPED: false,
    AutoPlay: true,
    LoadTimeStamps: false
  }

  Object.entries(defaultSettings).forEach(([key, value]) => {
    if (STORAGE[`get${key}`]() === undefined) {
      STORAGE.set(key as keyof typeof defaultSettings, value)
    }
  })

  createEffect(() => {
    // Gets the user's data && sets the avatar
    ;(async () => {
      const viewer = await QLoad.getViewer()
      setAvatar(viewer.avatar.large ? viewer.avatar.large : viewer.avatar.medium)
      setAnimeInfo(await QLoad.getViewerList('ANIME', viewer.id))
    })()
  })

  createEffect(() => {
    ;(async () => {
      setTrendingAnimeInfo(await QLoad.getTrending('ANIME', 'TV'))
      setTrendingMovies(await QLoad.getTrending('ANIME', 'MOVIE', null, null))
      setTopRatedAnime(await QLoad.getTopRated('ANIME'))
      setPopularAnime(await QLoad.getPopular('ANIME'))
      setUpdatedAnimeInfo(await QLoad.getRecentlyUpdated())
    })()
  })

  return (
    <>
      <StorageProvider>
        <div id="midori-root" />
        <Titlebar />
        <Sidebar avatar={avatar()} />
        {props.children}
      </StorageProvider>
    </>
  )
}

export default App
