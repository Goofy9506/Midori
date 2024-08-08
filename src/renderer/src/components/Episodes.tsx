import { For, createSignal, type Component } from 'solid-js'

import '../styles/Episodes.scss'
import Player from './Player'
import {
  RiDesignGridFill,
  RiDesignLayoutGridFill,
  RiEditorListUnordered,
  RiSystemMenuFill
} from 'solid-icons/ri'
import { Anime } from '@renderer/types/Media'

interface props {
  mediaInfo: Anime | undefined
}

export const triggerPlayer = (episode: number) => {
  setPlayingEpisode(episode)
  setShowPlayer(true)
}

const [playingEpisode, setPlayingEpisode] = createSignal<any>()
const [showPlayer, setShowPlayer] = createSignal<any>()

const Episodes: Component<props> = (props) => {
  const [filter, setFilter] = createSignal<number>(0)
  const [dialog, setDialog] = createSignal<boolean>(false)
  const [layout, setLayout] = createSignal<string>('grid')
  const [subOrDub, setSubOrDub] = createSignal<string>('sub')

  // const sinceDate = (date: Date): string | undefined => {
  //   const formatter = typeof Intl !== 'undefined' && new Intl.RelativeTimeFormat('en')
  //   const secondsElapsed = (date.getTime() - Date.now()) / 1000
  //   const ranges = {
  //     years: 3600 * 24 * 365,
  //     months: 3600 * 24 * 30,
  //     weeks: 3600 * 24 * 7,
  //     days: 3600 * 24,
  //     hours: 3600,
  //     minutes: 60,
  //     seconds: 1
  //   }

  //   if (formatter) {
  //     for (const [key, value] of Object.entries(ranges)) {
  //       if (value < Math.abs(secondsElapsed)) {
  //         const delta = secondsElapsed / value
  //         return formatter.format(Math.round(delta), key as Intl.RelativeTimeFormatUnit)
  //       }
  //     }
  //   }
  // }

  const sortEpisodes = (): number[][] => {
    if (!props.mediaInfo) return []
    let perPage: number = 100
    const episodes: number[][] = []
    const episodeNum: number = props.mediaInfo.nextAiringEpisode
      ? props.mediaInfo.nextAiringEpisode - 1
      : props.mediaInfo.totalEpisodes
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
  const localUpperCase = (str: string) => {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  return (
    <>
      {showPlayer() && (
        <Player
          animeInfo={props.mediaInfo as Anime}
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
        </div>
        <div class="close">
          <div onClick={() => setDialog(false)}>Ok</div>
        </div>
      </div>
      <div class={`blur ${dialog() ? '' : 'hidden'}`} />
      {pages?.length !== 0 && props.mediaInfo?.episodes?.length !== 0 && (
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
                  class={`episode ${props.mediaInfo?.fillerEpisodes?.[episode]?.filler ? 'filler' : ''}`}
                  id={`${props.mediaInfo?.episodes?.[episode].number}`}
                  onClick={() => {
                    setPlayingEpisode(props.mediaInfo?.episodes?.[episode].number || episode)
                    setShowPlayer(true)
                  }}
                >
                  {props.mediaInfo?.episodes?.[episode]?.thumb ? (
                    <img src={props.mediaInfo?.episodes?.[episode]?.thumb} alt="" class="image" />
                  ) : (
                    <img src={props.mediaInfo?.cover} alt="" class="image" />
                  )}
                  <div class="content">
                    <div class="episode-title">
                      {episode + 1}.{' '}
                      {props.mediaInfo?.episodes?.[episode]?.title || 'Episode ' + `${episode + 1}`}
                    </div>
                    <div class="summary">{props.mediaInfo?.episodes?.[episode]?.desc}</div>
                    <div class="tiny-details">
                      {props.mediaInfo?.episodes?.[episode]?.maxLength ? (
                        <div class="episode-length">
                          {props.mediaInfo?.episodes?.[episode]?.maxLength}m
                        </div>
                      ) : null}
                      <div class="filler">
                        {props.mediaInfo?.episodes?.[episode]?.filler ? 'Filler' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      )}
    </>
  )
}

export default Episodes
