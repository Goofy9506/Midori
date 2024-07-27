import { createEffect, createSignal, type Component, type ComponentProps } from 'solid-js'

import './styles/App.scss'
import Sidebar from './components/Sidebar'
import Titlebar from './components/Titlebar'
import { StorageProvider } from './hooks/Storage'
import {
  getPopularAnime,
  getTopRatedAnime,
  getTrending,
  getTrendingMovies,
  getUpdatedAnime,
  getUserAvatar,
  getUserId,
  getUserLists
} from './api/Anilist/actions'

export const [mangaInfo, setMangaInfo] = createSignal<any>()
export const [animeInfo, setAnimeInfo] = createSignal<any>()
export const [trendingAnimeInfo, setTrendingAnimeInfo] = createSignal<any>()
export const [trendingMangaInfo, setTrendingMangaInfo] = createSignal<any>()
export const [trendingManhwaInfo, setTrendingManhwaInfo] = createSignal<any>()
export const [trendingMovies, setTrendingMovies] = createSignal<any>(null)
export const [topRatedAnime, setTopRatedAnime] = createSignal<any>(null)
export const [popularAnime, setPopularAnime] = createSignal<any>(null)
export const [updatedAnimeInfo, setUpdatedAnimeInfo] = createSignal<any>(null)

const App: Component = (props: ComponentProps<'div'>) => {
  const [avatar, setAvatar] = createSignal<string>('')

  createEffect(() => {
    const getData = async () => {
      const id = await getUserId()
      const animeLists = await getUserLists(id, 'ANIME')
      const mangaLists = await getUserLists(id, 'MANGA')
      setAvatar(await getUserAvatar())
      setAnimeInfo(animeLists)
      setMangaInfo(mangaLists)
    }
    getData()
  })

  const getSeason = (d) => Math.floor((d.getMonth() / 12) * 4) % 4
  const season = ['WINTER', 'SPRING', 'SUMMER', 'FALL'][getSeason(new Date())]
  createEffect(() => {
    const getData = async () => {
      setTrendingAnimeInfo(
        await getTrending('TRENDING_DESC', 'ANIME', 'JP', season, new Date().getFullYear())
      )
      setTrendingMangaInfo(await getTrending('POPULARITY_DESC', 'MANGA', 'JP'))
      setTrendingManhwaInfo(await getTrending('POPULARITY_DESC', 'MANGA', 'KR'))
      setTopRatedAnime(await getTopRatedAnime())
      setTrendingMovies(await getTrendingMovies())
      setPopularAnime(await getPopularAnime())
      setUpdatedAnimeInfo(await getUpdatedAnime())
    }
    getData()
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
