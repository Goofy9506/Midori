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
import Entry from '@renderer/components/Entry'
import { ALoader } from '@renderer/services/anilist/api/ALoader'
import { QLoader } from '@renderer/services/anilist/QLoader'
import { getYears } from '@renderer/utils/Date'

const Anime: Component = () => {
  const [trendingAnime, setTrendingAnime] = createSignal<any>(null)
  const [updateAnime, setUpdateAnime] = createSignal<any>(null)
  const [updateMovies, setUpdateMovies] = createSignal<any>(null)
  const [updateTopRated, setUpdateTopRated] = createSignal<any>(null)
  const [updatePopular, setUpdatePopular] = createSignal<any>(null)
  const [currentTitle, setCurrentTitle] = createSignal<string>('')
  const [searchedContent, setSearched] = createSignal<any>()
  const ALoad = new ALoader()
  const QLoad = new QLoader()

  // Search Parameters
  const [startYear, setStartYear] = createSignal<string | undefined>(undefined)
  const [format, setFormat] = createSignal<string | undefined>(undefined)
  const [status, setStatus] = createSignal<string | undefined>(undefined)
  const [season, setSeason] = createSignal<string | undefined>(undefined)
  const [genre, setGenre] = createSignal<string | undefined>(undefined)
  const [year, setYear] = createSignal<string | undefined>(undefined)
  const [sort, setSort] = createSignal<string | undefined>(undefined)

  const handleSearch = async () => {
    if (currentTitle() === '') return setSearched()
    const response = await QLoad.getSearched({
      type: 'ANIME',
      search: currentTitle(),
      sort: sort() !== '' ? sort() : undefined,
      genres: genre() !== '' ? genre() : undefined,
      tags: undefined,
      status: status() !== '' ? status() : undefined,
      format: format() !== '' ? format() : undefined,
      countryOfOrigin: undefined,
      excludeGenres: undefined,
      excludeTags: undefined,
      startYear: startYear() !== '' ? startYear() : undefined,
      seasonYear: year() !== '' ? year() : undefined,
      season: season() !== '' ? season() : undefined
    })
    const mediaArray: any[] = []
    response.forEach((media: any) => {
      if (media.isAdult) return
      if (media.countryOfOrigin !== 'JP') return
      const newMedia = ALoad.returnMedia(media, 'SINGULAR')
      mediaArray.push(newMedia)
    })
    setSearched(mediaArray)
  }

  const inputKeydown = (event: KeyboardEvent) => {
    if (event.keyCode === 229) return

    if (event.code === 'Enter') handleSearch()
  }

  createEffect(() => {
    const mediaArray: any[] = []
    trendingAnimeInfo()?.forEach((media: any) => {
      if (media.isAdult) return
      if (media.countryOfOrigin !== 'JP') return
      mediaArray.push(media)
    })
    setTrendingAnime(mediaArray)
  })

  createEffect(() => {
    const mediaArray: any[] = []
    updatedAnimeInfo()?.forEach((media: any) => {
      if (media.media.isAdult) return
      if (media.media.countryOfOrigin !== 'JP') return
      const newMedia = ALoad.returnMedia(media, 'DOUBLE')
      mediaArray.push(newMedia)
    })
    setUpdateAnime(mediaArray)
  })

  createEffect(() => {
    const mediaArray: any[] = []
    trendingMovies()?.forEach((media: any) => {
      if (media.isAdult) return
      if (media.countryOfOrigin !== 'JP') return
      const newMedia = ALoad.returnMedia(media, 'SINGULAR')
      mediaArray.push(newMedia)
    })
    setUpdateMovies(mediaArray)
  })

  createEffect(() => {
    const mediaArray: any[] = []
    topRatedAnime()?.forEach((media: any) => {
      if (media.isAdult) return
      if (media.countryOfOrigin !== 'JP') return
      const newMedia = ALoad.returnMedia(media, 'SINGULAR')
      mediaArray.push(newMedia)
    })
    setUpdateTopRated(mediaArray)
  })

  createEffect(() => {
    const mediaArray: any[] = []
    popularAnime()?.forEach((media: any) => {
      if (media.isAdult) return
      if (media.countryOfOrigin !== 'JP') return
      const newMedia = ALoad.returnMedia(media, 'SINGULAR')
      mediaArray.push(newMedia)
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
              class="search-bar"
              onInput={(e) => {
                setCurrentTitle(e.target.value)
              }}
            />
            {currentTitle() === '' && !searchedContent() ? (
              <div class="central">
                <Slideshow listInfo={trendingAnime()} />
                <EntryWrapper list={updateAnime()} title="Recently Updated" />
                <EntryWrapper list={updateMovies()} title="Trending Movies" />
                <EntryWrapper list={updateTopRated()} title="Top Rated" />
                <EntryWrapper list={updatePopular()} title="Popular Anime" />
              </div>
            ) : (
              <div class="search-container">
                <div class="title">Search Results</div>
                <div class="content">
                  <div class="filters">
                    <div class="filter">
                      <h1 class="filter-title">Format</h1>
                      <div class="filter-options">
                        <select value="" onChange={(e) => setFormat(e.target.value)}>
                          <option value="" />
                          <option value="TV">TV</option>
                          <option value="TV_SHORT">TV SHORT</option>
                          <option value="MOVIE">MOVIE</option>
                          <option value="SPECIAL">SPECIAL</option>
                          <option value="OVA">OVA</option>
                          <option value="ONA">ONA</option>
                          <option value="MUSIC">MUSIC</option>
                        </select>
                      </div>
                    </div>
                    <div class="filter">
                      <h1 class="filter-title">Genres</h1>
                      <div class="filter-options">
                        <select value="" onChange={(e) => setGenre(e.target.value)}>
                          <option value="" />
                          <option value="Action">Action</option>
                          <option value="Adventure">Adventure</option>
                          <option value="Comedy">Comedy</option>
                          <option value="Drama">Drama</option>
                          <option value="Ecchi">Ecchi</option>
                          <option value="Fantasy">Fantasy</option>
                          <option value="Horror">Horror</option>
                          <option value="Mahou Shoujo">Mahou Shoujo</option>
                          <option value="Mecha">Mecha</option>
                          <option value="Music">Music</option>
                          <option value="Mystery">Mystery</option>
                          <option value="Psychological">Psychological</option>
                          <option value="Romance">Romance</option>
                          <option value="Sci-Fi">Sci-Fi</option>
                          <option value="Slice of Life">Slice of Life</option>
                          <option value="Sports">Sports</option>
                          <option value="Supernatural">Supernatural</option>
                          <option value="Thriller">Thriller</option>
                        </select>
                      </div>
                    </div>
                    <div class="filter">
                      <h1 class="filter-title">Status</h1>
                      <div class="filter-options">
                        <select value="" onChange={(e) => setStatus(e.target.value)}>
                          <option value="" />
                          <option value="RELEASING">Releasing</option>
                          <option value="FINISHED">Finished</option>
                          <option value="NOT_YET_RELEASED">Not Yet Released</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div class="filter">
                      <h1 class="filter-title">Season</h1>
                      <div class="filter-options">
                        <select value="" onChange={(e) => setSeason(e.target.value)}>
                          <option value="" />
                          <option value="WINTER">Winter</option>
                          <option value="SPRING">Spring</option>
                          <option value="SUMMER">Summer</option>
                          <option value="FALL">Fall</option>
                        </select>
                      </div>
                    </div>
                    <div class="filter">
                      <h1 class="filter-title">Year</h1>
                      <div class="filter-options">
                        <select value="" onChange={(e) => setSort(e.target.value)}>
                          <option value="" />
                          <For each={getYears(1970).reverse()}>
                            {(year: number) => <option value={year}>{year}</option>}
                          </For>
                        </select>
                      </div>
                    </div>
                    <div class="filter">
                      <h1 class="filter-title">Starting Year</h1>
                      <div class="filter-options">
                        <select value="" onChange={(e) => setStartYear(e.target.value)}>
                          <option value="" />
                          <For each={getYears(1970).reverse()}>
                            {(year: number) => <option value={year}>{year}</option>}
                          </For>
                        </select>
                      </div>
                    </div>
                    <div class="filter">
                      <h1 class="filter-title">Sort</h1>
                      <div class="filter-options">
                        <select value="" onChange={(e) => setYear(e.target.value)}>
                          <option value="" />
                          <option value="SCORE_DESC">By Score</option>
                          <option value="POPULARITY_DESC">By Popularity</option>
                          <option value="TRENDING_DESC">By Trending</option>
                          <option value="START_DATE_DESC">By New Releases</option>
                          <option value="TITLE_ENGLISH">By English (A-Z)</option>
                          <option value="TITLE_ENGLISH_DESC">By English (Z-A)</option>
                        </select>
                      </div>
                    </div>

                    <div class="search" onClick={handleSearch}>
                      Search
                    </div>
                  </div>
                  <div class="searched-content">
                    <For each={searchedContent()}>{(media: any) => <Entry media={media} />}</For>
                  </div>
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
