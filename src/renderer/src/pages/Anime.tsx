import { createEffect, createSignal, type Component } from 'solid-js'

import '../styles/Anime.scss'
import Slideshow from '@renderer/components/Slideshow'
import { trendingAnimeInfo, updatedAnimeInfo } from '@renderer/App'
import EntryWrapper from '@renderer/components/EntryWrapper'

const Anime: Component = () => {
  const [hide, setHide] = createSignal<string>('')
  const [updateAnime, setUpdateAnime] = createSignal<any>(null)

  createEffect(() => {
    const mediaArray: any[] = []
    updatedAnimeInfo()?.forEach((media: any) => {
      if (media.media.isAdult) return
      if (media.media.countryOfOrigin !== 'JP') return
      mediaArray.push(media)
    })
    setUpdateAnime(mediaArray)
  })

  return (
    <>
      <div class="body">
        <div class="main">
          <div class="background">
            <input
              type="text"
              placeholder="Search Anime..."
              class="search"
              onInput={(e) => {
                setHide(e.target.value)
              }}
            />
            {hide().length === 0 && (
              <div class="central">
                <Slideshow listInfo={trendingAnimeInfo()} />
                <EntryWrapper list={updateAnime()} title="Recently Updated" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Anime
