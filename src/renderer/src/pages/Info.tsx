/* eslint-disable solid/no-innerhtml */

import { Show, createEffect, createSignal, type Component, For } from 'solid-js'
import { RiMediaPlayFill } from 'solid-icons/ri'
import { useLocation, useParams } from '@solidjs/router'

import '../styles/Info.scss'
import { ALoader } from '@renderer/services/anilist/api/ALoader'
import { Anime } from '@renderer/types/Media'
import Episodes, { triggerPlayer } from '@renderer/components/Episodes'
import Relation from '@renderer/components/Relation'

const Info: Component = () => {
  const animeId = useParams().id
  const malId = Number(useLocation().search.split('=')[1])
  const [mediaInfo, setMediaInfo] = createSignal<Anime>()

  createEffect(() => {
    ;(async () => {
      const ALoad = await new ALoader().getDetailedInfo(animeId, malId)
      setMediaInfo(ALoad)
    })()
  })

  // const [dialog, setDialog] = createSignal<boolean>(false)

  // const localUpperCase = (str: string) => {
  //   if (!str) return str
  //   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  // }

  return (
    <>
      <Show when={mediaInfo()} keyed>
        {/* <div class={`dialog ${dialog() ? '' : 'hidden'}`}>
          <h1 class="title">Options</h1>
          <div class="settings">
            <div class="option">
              <h1 class="option-title">
                Status
                <div class="name">{localUpperCase(mediaInfo()?.userStatus ?? '')}</div>
              </h1>
              <div class="switch" style={{ display: 'block' }}>
                <select class="switch-select" value={mediaInfo()?.userStatus}>
                  <option value="CURRENT">Watching</option>
                  <option value="PLANNING">Planning</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DROPPED">Dropped</option>
                  <option value="PAUSED">Paused</option>
                  <option value="REPEATING">Repeating</option>{' '}
                </select>
              </div>
            </div>
            <div class="option">
              <h1 class="option-title">
                Progress /{' '}
                <div class="name">
                  {mediaInfo()?.userProgress} /{' '}
                  {mediaInfo()?.totalEpisodes || Number(mediaInfo()?.nextAiringEpisode) - 1}
                </div>
              </h1>
              <div class="switch">
                <div
                  class="minus-one"
                  onClick={() => {
                    setAnimeProgress(animeId, Number(mediaInfo()?.userProgress) - 1)
                  }}
                >
                  - 1
                </div>
                <div
                  class="plus-one"
                  onClick={() => {
                    setAnimeProgress(animeId, Number(mediaInfo()?.userProgress) + 1)
                  }}
                >
                  + 1
                </div>
              </div>
            </div>
          </div>
          <div class="close">
            <div onClick={() => setDialog(false)}>Ok</div>
          </div>
        </div> */}
        {/* <div class={`blur ${dialog() ? '' : 'hidden'}`} /> */}
        <div class="body">
          <div class="main">
            <div class="info">
              <div class="content">
                <div class="banner">
                  {mediaInfo()?.banner ? <img src={mediaInfo()?.banner} alt="banner" /> : null}
                  <div class="gradient" />
                </div>
                <div class="section-info">
                  <div class="details">
                    <img src={mediaInfo()?.cover} alt="poster" />
                    <div class="title-details">
                      <h1 class="english-title">{mediaInfo()?.name}</h1>
                      <h2 class="romaji-title">{mediaInfo()?.nameRomaji}</h2>
                      <div class="description" innerHTML={mediaInfo()?.description ?? ''} />
                      <div class="tiny-details">
                        {mediaInfo()?.userProgress ? (
                          <div
                            class="button"
                            onClick={() => triggerPlayer(Number(mediaInfo()?.userProgress))}
                          >
                            <RiMediaPlayFill class="play-icon" /> Continue Where You Left Off
                          </div>
                        ) : (
                          <div class="button" onClick={() => triggerPlayer(1)}>
                            <RiMediaPlayFill class="play-icon" /> Start Watching Now
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div class="relations">
                    <h1>Relations</h1>
                    {mediaInfo()?.relations ? (
                      <div class="list">
                        {
                          <For each={mediaInfo()?.relations}>
                            {(relation: any) => <Relation media={relation} />}
                          </For>
                        }
                      </div>
                    ) : null}
                  </div>
                  <Episodes mediaInfo={mediaInfo()} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  )
}

export default Info
