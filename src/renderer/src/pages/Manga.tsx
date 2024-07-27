import { For, createEffect, createSignal, type Component } from 'solid-js'

import '../styles/Anime.scss'
import { search } from '@renderer/api/Anilist/actions'
import Entry from '@renderer/components/Entry'
import Slideshow from '@renderer/components/Slideshow'
import { trendingMangaInfo, trendingManhwaInfo } from '@renderer/App'
import EntryWrapper from '@renderer/components/EntryWrapper'

const Manga: Component = () => {
  const [trendingManga, setTrendingManga] = createSignal<any>(null)
  const [trendingManhwa, setTrendingManhwa] = createSignal<any>(null)
  const [currentTitle, setCurrentTitle] = createSignal<string>('')
  const [searchedContent, setSearched] = createSignal<any>()

  const handleSearch = async () => {
    if (currentTitle() === '') return setSearched()
    const response = await search('MANGA', 1, 50, currentTitle())
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
    trendingMangaInfo()?.media?.forEach((media: any) => {
      if (media.isAdult) return
      mediaArray.push(media)
    })
    setTrendingManga(mediaArray)
  })

  createEffect(() => {
    const mediaArray: any[] = []
    trendingManhwaInfo()?.media?.forEach((media: any) => {
      if (media.isAdult) return
      mediaArray.push(media)
    })
    setTrendingManhwa(mediaArray)
  })

  return (
    <>
      <div class="body">
        <div class="main">
          <div class="background" onKeyDown={inputKeydown}>
            <input
              type="text"
              placeholder="Search Manga..."
              class="search"
              onInput={(e) => {
                setCurrentTitle(e.target.value)
              }}
            />
            {!searchedContent() ? (
              <div class="central">
                <Slideshow listInfo={trendingMangaInfo()} />
                <EntryWrapper list={trendingManga()} title="Trending Manga" />
                <EntryWrapper list={trendingManhwa()} title="Trending Manhwa" />
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

export default Manga
