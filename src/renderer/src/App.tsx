import { createEffect, createSignal, type Component, type ComponentProps } from 'solid-js'

import './styles/App.scss'
import Sidebar from './components/Sidebar'
import Titlebar from './components/Titlebar'
import { StorageProvider } from './hooks/Storage'
import {
  getTrending,
  getUpdatedAnime,
  getUserAvatar,
  getUserId,
  getUserLists
} from './api/Anilist/actions'

export const [mangaInfo, setMangaInfo] = createSignal<any>(null)
export const [animeInfo, setAnimeInfo] = createSignal<any>(null)
export const [trendingAnimeInfo, setTrendingAnimeInfo] = createSignal<any>(null)
export const [updatedAnimeInfo, setUpdatedAnimeInfo] = createSignal<any>(null)

const App: Component = (props: ComponentProps<'div'>) => {
  const [avatar, setAvatar] = createSignal<string>('')

  createEffect(() => {
    const getData = async () => {
      setAvatar(await getUserAvatar())
    }
    getData()
  })

  createEffect(() => {
    const getData = async () => {
      const id = await getUserId()
      const animeLists = await getUserLists(id, 'ANIME')
      const mangaLists = await getUserLists(id, 'MANGA')
      setAnimeInfo(animeLists)
      setMangaInfo(mangaLists)
    }
    getData()
  })

  const getSeason = (d) => Math.floor((d.getMonth() / 12) * 4) % 4
  const season = ['WINTER', 'SPRING', 'SUMMER', 'FALL'][getSeason(new Date())]
  createEffect(() => {
    const getData = async () => {
      setTrendingAnimeInfo(await getTrending('ANIME', season, new Date().getFullYear()))
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
