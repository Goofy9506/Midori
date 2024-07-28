import { For, createEffect, createSignal, type Component } from 'solid-js'

import '../styles/Anime.scss'
import Slideshow from '@renderer/components/Slideshow'
import {
  popularAnime,
  topRatedAnime,
  trendingAnimeInfo,
  trendingMovies,
  updatedAnimeInfo
} from '@renderer/App'
import EntryWrapper from '@renderer/components/EntryWrapper'
import { search } from '@renderer/api/Anilist/actions'
import Entry from '@renderer/components/Entry'

const Anime: Component = () => {
  const [updateAnime, setUpdateAnime] = createSignal<any>(null)
  const [updateMovies, setUpdateMovies] = createSignal<any>(null)
  const [updateTopRated, setUpdateTopRated] = createSignal<any>(null)
  const [updatePopular, setUpdatePopular] = createSignal<any>(null)
  const [currentTitle, setCurrentTitle] = createSignal<string>('')
  const [searchedContent, setSearched] = createSignal<any>()

  const handleSearch = async () => {
    if (currentTitle() === '') return setSearched()
    const response = await search('ANIME', 1, 50, currentTitle())
    const mediaArray: any[] = []
    response.media.forEach((media: any) => {
      if (media.isAdult) return
      if (media.countryOfOrigin !== 'JP') return
      mediaArray.push(media)
    })
    setSearched(mediaArray)
  }

  const inputKeydown = (event: KeyboardEvent) => {
    if (event.keyCode === 229) return

    if (event.code === 'Enter') handleSearch()
  }

  createEffect(() => {
    const mediaArray: any[] = []
    updatedAnimeInfo()?.forEach((media: any) => {
      if (media.media.isAdult) return
      if (media.media.countryOfOrigin !== 'JP') return
      mediaArray.push(media)
    })
    setUpdateAnime(mediaArray)
  })

  createEffect(() => {
    const mediaArray: any[] = []
    trendingMovies()?.forEach((media: any) => {
      if (media.isAdult) return
      if (media.countryOfOrigin !== 'JP') return
      mediaArray.push(media)
    })
    setUpdateMovies(mediaArray)
  })

  createEffect(() => {
    const mediaArray: any[] = []
    topRatedAnime()?.forEach((media: any) => {
      if (media.isAdult) return
      if (media.countryOfOrigin !== 'JP') return
      mediaArray.push(media)
    })
    setUpdateTopRated(mediaArray)
  })

  createEffect(() => {
    const mediaArray: any[] = []
    popularAnime()?.forEach((media: any) => {
      if (media.isAdult) return
      if (media.countryOfOrigin !== 'JP') return
      mediaArray.push(media)
    })
    setUpdatePopular(mediaArray)
  })

  return (
    <>
      <div class="body">
        <div class="main">
          <div class="background" onKeyDown={inputKeydown}>
            <input
              type="text"
              placeholder="Search Anime..."
              class="search"
              onInput={(e) => {
                setCurrentTitle(e.target.value)
              }}
            />
            {!searchedContent() ? (
              <div class="central">
                <Slideshow listInfo={trendingAnimeInfo()} />
                <EntryWrapper list={updateAnime()} title="Recently Updated" />
                <EntryWrapper list={updateMovies()} title="Trending Movies" />
                <EntryWrapper list={updateTopRated()} title="Top Rated" />
                <EntryWrapper list={updatePopular()} title="Recently Updated" />
              </div>
            ) : (
              <div class="search-container">
                <div class="title">Search Results</div>
                <div class="searched-content">
                  <For each={searchedContent()}>{(media: any) => <Entry media={media} />}</For>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Anime
