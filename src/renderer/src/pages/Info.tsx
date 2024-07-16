/* eslint-disable solid/no-innerhtml */

import { Show, createEffect, createSignal, type Component, For } from 'solid-js'
import { getAnime } from '@renderer/api/Anilist/actions'
import { RiMediaPlayFill } from 'solid-icons/ri'
import { A, useParams } from '@solidjs/router'

import Relation from '@renderer/components/Relation'
import Episodes from '@renderer/components/Episodes'

import '../styles/Info.scss'
import AniZip from '@renderer/api/AniZip/actions'

const Info: Component = () => {
  const animeId = useParams().id

  createEffect(() => {
    async function getData() {
      const animeLists = await getAnime(animeId)
      setAnimeInfo(animeLists)
      const ani = await new AniZip().getAniZip(animeId)
      setAniInfo(ani)
      setEpisodeInfo(Object.values(aniInfo().episodes))
    }
    getData()
  })

  const [animeInfo, setAnimeInfo] = createSignal<any>(null)
  const [aniInfo, setAniInfo] = createSignal<any>()
  const [episodeInfo, setEpisodeInfo] = createSignal<any>()

  return (
    <>
      <Show when={animeInfo()} keyed>
        <div class="body">
          <div class="main">
            <div class="info">
              <div class="content">
                <div class="banner">
                  {animeInfo()?.bannerImage ? (
                    <img src={animeInfo()?.bannerImage} alt="banner" />
                  ) : null}
                  <div class="gradient" />
                </div>
                <div class="section-info">
                  <div class="details">
                    <img src={animeInfo()?.coverImage?.large} alt="poster" />
                    <div class="title-details">
                      <h1 class="english-title">{animeInfo()?.title?.english}</h1>
                      <h2 class="romaji-title">{animeInfo()?.title?.romaji}</h2>
                      <div class="description" innerHTML={animeInfo()?.description ?? ''} />
                      <div class="tiny-details">
                        <A href={`/watch/${animeId}`} class="play-now">
                          <RiMediaPlayFill class="play-icon" /> Play Now
                        </A>
                      </div>
                    </div>
                  </div>
                  <div class="relations">
                    <h1>Relations</h1>
                    {animeInfo()?.relations?.edges?.length > 0 && (
                      <div class="list">
                        {
                          <For each={animeInfo()?.relations?.edges}>
                            {(relation: any) => {
                              if (
                                [
                                  'ADAPTATION',
                                  'SIDE_STORY',
                                  'PREQUEL',
                                  'SEQUEL',
                                  'PARENT',
                                  'SOURCE'
                                ].includes(relation?.relationType)
                              ) {
                                return <Relation media={relation?.node} />
                              }
                            }}
                          </For>
                        }
                      </div>
                    )}
                  </div>
                  <Episodes
                    animeInfo={animeInfo()}
                    episodeInfo={episodeInfo()}
                    aniInfo={aniInfo()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  )
}

{
  /*                   <div class="text-info">
                    <div class="description" innerHTML={animeInfo()?.description ?? ''} />
                    <div class="statistics">
                      <div class="statistics-group">
                        <div class="statistics-item">
                          Type: <strong>{animeInfo()?.format}</strong>
                        </div>
                        <div class="statistics-item">
                          Year: <strong>{animeInfo()?.seasonYear}</strong>
                        </div>
                        <div class="statistics-item">
                          Status: <strong>{animeInfo()?.status}</strong>
                        </div>
                        <div class="statistics-item">
                          Rating: <strong>{animeInfo()?.meanScore}</strong>
                        </div>
                      </div>
                      <div class="statistics-group">
                        <div class="statistics-item">
                          Episodes:{' '}
                          <strong>
                            {animeInfo()?.nextAiringEpisode?.episode
                              ? animeInfo()?.nextAiringEpisode?.episode - 1
                              : animeInfo().episodes
                                ? animeInfo().episodes
                                : '~'}
                          </strong>
                        </div>
                        <div class="statistics-item">
                          Duration:{' '}
                          <strong>
                            {animeInfo()?.duration ? `${animeInfo()?.duration} min` : 'Unknown'}{' '}
                          </strong>
                        </div>
                        <div class="statistics-item">
                          Season: <strong>{capitalizeFirstLetter(animeInfo()?.season)}</strong>
                        </div>
                        <div class="statistics-item">
                          Country: <strong>{animeInfo()?.countryOfOrigin}</strong>
                        </div>
                      </div>
                    </div>
                  </div> */
}

{
  /* <div class="section-info">
<div class="relations">
  <h1 class="relation-title">Relations</h1>
  {animeInfo()?.relations?.edges?.length > 0 && (
    <div class="relations-list">
      {
        <For each={animeInfo()?.relations?.edges}>
          {(relation: any) => {
            if (
              relation?.relationType === 'ADAPTATION' ||
              relation?.relationType === 'SIDE_STORY' ||
              relation?.relationType === 'PREQUEL' ||
              relation?.relationType === 'SEQUEL' ||
              relation?.relationType === 'PARENT' ||
              relation?.relationType === 'SOURCE'
            ) {
              return <Relation media={relation?.node} />
            }
          }}
        </For>
      }
    </div>
  )}
</div>
</div> */
}
export default Info
