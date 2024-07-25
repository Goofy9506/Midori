/* eslint-disable solid/prefer-for */
// import { useParams } from '@solidjs/router'
import { For, Show, createEffect, createSignal, type Component } from 'solid-js'

import '../styles/Episodes.scss'
import Player from './Player'
import {
  RiDesignGridFill,
  RiDesignLayoutGridFill,
  RiEditorListUnordered,
  RiSystemMenuFill
} from 'solid-icons/ri'
import { STORAGE } from '@renderer/utils/Storage'

interface props {
  animeInfo: any
  episodeInfo: any
  aniInfo: any
  fillerInfo: any
}

const AutoUpdate = await STORAGE.getAutoUpdate()
const [autoUpdate, setAutoUpdate] = createSignal<boolean>(false)
const Episodes: Component<props> = (props) => {
  const [playingEpisode, setPlayingEpisode] = createSignal<any>()
  const [filter, setFilter] = createSignal<number>(0)
  const [dialog, setDialog] = createSignal<boolean>(false)
  const [layout, setLayout] = createSignal<string>('grid')
  const [subOrDub, setSubOrDub] = createSignal<string>('sub')

  const [showPlayer, setShowPlayer] = createSignal<any>()

  const sinceDate = (date: Date): string | undefined => {
    const formatter = typeof Intl !== 'undefined' && new Intl.RelativeTimeFormat('en')
    const secondsElapsed = (date.getTime() - Date.now()) / 1000
    const ranges = {
      years: 3600 * 24 * 365,
      months: 3600 * 24 * 30,
      weeks: 3600 * 24 * 7,
      days: 3600 * 24,
      hours: 3600,
      minutes: 60,
      seconds: 1
    }

    if (formatter) {
      for (const [key, value] of Object.entries(ranges)) {
        if (value < Math.abs(secondsElapsed)) {
          const delta = secondsElapsed / value
          return formatter.format(Math.round(delta), key as Intl.RelativeTimeFormatUnit)
        }
      }
    }
  }

  const sortEpisodes = (): number[][] => {
    let perPage: number = 100
    const episodes: number[][] = []
    const episodeNum: number = props.animeInfo.nextAiringEpisode
      ? props.animeInfo.nextAiringEpisode?.episode - 1
      : props.animeInfo.episodes
    episodeNum > 25 && episodeNum < 100 ? (perPage = 25) : (perPage = 100)
    const pages: number = Math.ceil(episodeNum / perPage)

    for (let i = 0; i < pages; i++) {
      const indexStart = i * perPage
      const indexEnd = Math.min(indexStart + perPage, episodeNum)
      const newEpisodeInfo = Array.from(
        { length: indexEnd - indexStart },
        (_, index) => indexStart + index
      )
      episodes.push(newEpisodeInfo)
    }

    return episodes
  }

  // eslint-disable-next-line solid/reactivity
  const pages = sortEpisodes()
  setAutoUpdate(AutoUpdate)
  const localUpperCase = (str: string) => {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  createEffect(() => {
    props.animeInfo.id_mal = props.aniInfo?.mappings?.mal_id
  })

  return (
    <>
      {showPlayer() && (
        <Player
          animeInfo={props.animeInfo}
          episodeData={props.episodeInfo}
          episode={playingEpisode()}
          subOrDub={subOrDub()}
          onClose={() => setShowPlayer(false)}
        />
      )}
      <div class={`dialog ${dialog() ? '' : 'hidden'}`}>
        <h1 class="title">Options</h1>
        <div class="settings">
          <div class="option">
            <h1 class="option-title">
              Layout <div class="name">{localUpperCase(layout())}</div>
            </h1>
            <div class="switch">
              <RiEditorListUnordered
                onClick={() => {
                  setLayout('rows')
                }}
                class={layout() === 'rows' ? 'selected' : ''}
              />
              <RiDesignLayoutGridFill
                onClick={() => {
                  setLayout('grid')
                }}
                class={layout() === 'grid' ? 'selected' : ''}
              />
              <RiDesignGridFill
                onClick={() => {
                  setLayout('compact')
                }}
                class={layout() === 'compact' ? 'selected' : ''}
              />
            </div>
          </div>
          <div class="option">
            <h1 class="option-title">
              Prefer <div class="name">{localUpperCase(subOrDub())}</div>
            </h1>
            <div class="switch">
              <div
                onClick={() => {
                  setSubOrDub('sub')
                }}
                class={subOrDub() === 'sub' ? 'selected' : ''}
              >
                Sub
              </div>
              <div
                onClick={() => {
                  setSubOrDub('dub')
                }}
                class={subOrDub() === 'dub' ? 'selected' : ''}
              >
                Dub
              </div>
            </div>
          </div>
          <div class="option">
            <h1 class="option-title">
              Auto Update Progress
              <div class="name">{localUpperCase(autoUpdate() ? 'Yes' : 'No')}</div>
            </h1>
            <div class="switch">
              <div
                class={autoUpdate() ? 'selected' : ''}
                onClick={() => {
                  setAutoUpdate(true)
                  STORAGE.set('AutoUpdate', true)
                }}
              >
                Yes
              </div>
              <div
                class={!autoUpdate() ? 'selected' : ''}
                onClick={() => {
                  setAutoUpdate(false)
                  STORAGE.set('AutoUpdate', false)
                }}
              >
                No
              </div>
            </div>
          </div>
        </div>
        <div class="close">
          <div onClick={() => setDialog(false)}>Ok</div>
        </div>
      </div>
      <div class={`blur ${dialog() ? '' : 'hidden'}`} />
      <Show when={props.episodeInfo}>
        {pages?.length !== 0 && props.episodeInfo?.length !== 0 && (
          <div class="episode-list">
            <h1>
              Episodes
              <div>
                <RiSystemMenuFill
                  class="menu-icon"
                  onClick={() => {
                    setDialog(!dialog())
                  }}
                />
              </div>
            </h1>
            {pages[0].length > 25 && (
              <div class="filter">
                <For each={pages}>
                  {(page: any, index: any) => (
                    <div
                      onClick={() => {
                        setFilter(index)
                      }}
                      class={`${filter() === index() ? 'selected' : ''}`}
                    >
                      {`${page[0] + 1} - ${page[page.length - 1] + 1}`}
                    </div>
                  )}
                </For>
              </div>
            )}

            <div class={`list ${layout()} `}>
              <For each={pages[filter()]}>
                {(episode) => (
                  <div
                    class={`episode ${props.fillerInfo?.[episode]?.filler ? 'filler' : ''}`}
                    onClick={() => {
                      setPlayingEpisode(props.episodeInfo[episode])
                      setShowPlayer(true)
                    }}
                  >
                    {props.episodeInfo[episode].image ? (
                      <img src={props.episodeInfo[episode].image} alt="" class="image" />
                    ) : (
                      <img src={props.animeInfo.coverImage.large} alt="" class="image" />
                    )}
                    <div class="content">
                      <div class="episode-title">
                        {props.episodeInfo[episode].episode}.{' '}
                        {props.episodeInfo[episode]?.title?.en ||
                          'Episode ' + props.episodeInfo[episode].episode}
                      </div>
                      <div class="summary">{props.episodeInfo[episode].summary}</div>
                      <div class="tiny-details">
                        {props.episodeInfo[episode].length ? (
                          <div class="episode-length">{props.episodeInfo[episode].length}m</div>
                        ) : null}
                        <div class="episode-date">
                          {sinceDate(new Date(props.episodeInfo[episode].airDate))}
                        </div>
                        <div class="filler">
                          {props.fillerInfo?.[episode]?.filler ? 'Filler' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        )}
      </Show>
    </>
  )
}

export default Episodes
