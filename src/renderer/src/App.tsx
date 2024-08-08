import { createEffect, createSignal, type Component, type ComponentProps } from 'solid-js'

import './styles/App.scss'
import './styles/Colors.scss'
import Sidebar from './components/Sidebar'
import Titlebar from './components/Titlebar'
import { StorageProvider } from './hooks/Storage'

import { QLoader } from './services/anilist/QLoader'
import { getColorTheme } from './utils/UI'
import { STORAGE } from './utils/Storage'

export const [animeInfo, setAnimeInfo] = createSignal<any>()
export const [trendingAnimeInfo, setTrendingAnimeInfo] = createSignal<any>(null)
export const [trendingMovies, setTrendingMovies] = createSignal<any>(null)
export const [topRatedAnime, setTopRatedAnime] = createSignal<any>(null)
export const [popularAnime, setPopularAnime] = createSignal<any>(null)
export const [updatedAnimeInfo, setUpdatedAnimeInfo] = createSignal<any>(null)

const App: Component = (props: ComponentProps<'div'>) => {
  const [avatar, setAvatar] = createSignal<string>('')
  const ColorTheme = STORAGE.getColorTheme()
  const QLoad = new QLoader()

  createEffect(() => {
    // Gets the user's data && sets the avatar && sets the color theme
    ;(async () => {
      const viewer = await QLoad.getViewer()
      setAvatar(viewer.avatar.large ? viewer.avatar.large : viewer.avatar.medium)
      setAnimeInfo(await QLoad.getViewerList('ANIME', viewer.id))
      getColorTheme(await ColorTheme)
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
