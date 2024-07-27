/* eslint-disable solid/no-innerhtml */

import { Show, createEffect, createSignal, type Component, For } from 'solid-js'
import { getAnime, setAnimeProgress } from '@renderer/api/Anilist/actions'
import { RiMediaPlayFill } from 'solid-icons/ri'
import { A, useParams } from '@solidjs/router'

import Relation from '@renderer/components/Relation'
import Episodes from '@renderer/components/Episodes'

import '../styles/Info.scss'
import AniZip from '@renderer/api/AniZip/actions'
import Jikan from '@renderer/api/Jikan/actions'

const Info: Component = () => {
  const animeId = useParams().id

  createEffect(() => {
    async function getData() {
      const animeLists = await getAnime(animeId)
      setAnimeInfo(animeLists)
      const ani = await new AniZip().getAniZip(Number(animeId))
      setAniInfo(ani)
      setEpisodeInfo(Object.values(aniInfo().episodes))
      const filler = await new Jikan().getEpisodes(aniInfo().mappings.mal_id)
      setFillerInfo(filler)
      // const ani2 = await new Kitsu().getEpisodes(Number(animeId))
      // console.log(ani2)
    }
    getData()
  })

  const [animeInfo, setAnimeInfo] = createSignal<any>(null)
  const [aniInfo, setAniInfo] = createSignal<any>()
  const [episodeInfo, setEpisodeInfo] = createSignal<any>()
  const [fillerInfo, setFillerInfo] = createSignal<any>()
  const [dialog, setDialog] = createSignal<boolean>(false)

  const localUpperCase = (str: string) => {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  return (
    <>
      <Show when={animeInfo()} keyed>
        <div class={`dialog ${dialog() ? '' : 'hidden'}`}>
          <h1 class="title">Options</h1>
          <div class="settings">
            <div class="option">
              <h1 class="option-title">
                Status
                <div class="name">{localUpperCase(animeInfo().mediaListEntry?.status)}</div>
              </h1>
              <div class="switch" style={{ display: 'block' }}>
                <select class="switch-select" value={animeInfo().mediaListEntry?.status}>
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
                  {animeInfo()?.progress} /{' '}
                  {animeInfo().episodes || animeInfo().nextAiringEpisode?.episode - 1}
                </div>
              </h1>
              <div class="switch">
                <div
                  class="minus-one"
                  onClick={() => {
                    setAnimeProgress(animeId, animeInfo()?.progress - 1)
                  }}
                >
                  - 1
                </div>
                <div
                  class="plus-one"
                  onClick={() => {
                    setAnimeProgress(animeId, animeInfo()?.progress + 1)
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
        </div>
        <div class={`blur ${dialog() ? '' : 'hidden'}`} />
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
                    fillerInfo={fillerInfo()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  )
  //(
  //   <>
  //     {infoHandler()?.media.userStatus && (
  //       <>
  //         <div class={`dialog ${dialog() ? '' : 'hidden'}`}>
  //           <h1 class="title">Options</h1>
  //           <div class="settings">
  //             <div class="option">
  //               <h1 class="option-title">
  //                 Status{' '}
  //                 <div class="name">
  //                   {localUpperCase(infoHandler()?.media.userStatus as string)}
  //                 </div>
  //               </h1>
  //               <div class="switch" style={{ display: 'block' }}>
  //                 <select class="switch-select" value={infoHandler()?.media.userStatus}>
  //                   <option value="CURRENT">Watching</option>
  //                   <option value="PLANNING">Planning</option>
  //                   <option value="COMPLETED">Completed</option>
  //                   <option value="DROPPED">Dropped</option>
  //                   <option value="PAUSED">Paused</option>
  //                   <option value="REPEATING">Repeating</option>
  //                 </select>
  //               </div>
  //             </div>
  //             <div class="option">
  //               <h1 class="option-title">
  //                 Progress{' '}
  //                 <div class="name">
  //                   {infoHandler()?.media.userProgress} /{' '}
  //                   {infoHandler()?.media.anime.totalEpisodes ||
  //                     infoHandler()?.media.anime.nextAiringEpisode}
  //                 </div>
  //               </h1>
  //               <div class="switch">
  //                 <div
  //                   class="minus-one"
  //                   onClick={() => {
  //                     setAnimeProgress(animeId, (infoHandler()?.media.userProgress as number) - 1)
  //                   }}
  //                 >
  //                   - 1
  //                 </div>
  //                 <div
  //                   class="plus-one"
  //                   onClick={() => {
  //                     setAnimeProgress(animeId, (infoHandler()?.media.userProgress as number) + 1)
  //                   }}
  //                 >
  //                   + 1
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //           <div class="close">
  //             <div onClick={() => setDialog(false)}>Ok</div>
  //           </div>
  //         </div>
  //         <div class={`blur ${dialog() ? '' : 'hidden'}`} />
  //       </>
  //     )}
  //     <div class="body">
  //       <div class="main">
  //         <div class="info">
  //           <div class="content">
  //             <div class="banner">
  //               {infoHandler()?.media.banner ? (
  //                 <img src={infoHandler()?.media.banner} alt="banner" />
  //               ) : null}
  //               <div class="gradient" />
  //             </div>
  //             <div class="section-info">
  //               <div class="details">
  //                 <img src={infoHandler()?.media.cover?.large} alt="poster" />
  //                 <div class="title-details">
  //                   <h1 class="english-title">{infoHandler()?.media.name}</h1>
  //                   <h2 class="romaji-title">{infoHandler()?.media.nameRomaji}</h2>
  //                   <div class="description" innerHTML={infoHandler()?.media.description ?? ''} />
  //                   <div class="tiny-details">
  //                     <A href={`/watch/${animeId}`} class="play-now">
  //                       <RiMediaPlayFill class="play-icon" /> Play Now
  //                     </A>
  //                     {infoHandler()?.media.userStatus && (
  //                       <div
  //                         class="status"
  //                         onClick={() => {
  //                           setDialog(true)
  //                         }}
  //                       >
  //                         Edit Status
  //                       </div>
  //                     )}
  //                   </div>
  //                 </div>
  //               </div>
  //               <div class="relations">
  //                 <h1>Relations</h1>
  //                 {infoHandler()?.media.relations?.length > 0 && (
  //                   <div class="list">
  //                     {
  //                       <For each={infoHandler()?.media.relations}>
  //                         {(relation: any) => {
  //                           if (
  //                             [
  //                               'ADAPTATION',
  //                               'SIDE_STORY',
  //                               'PREQUEL',
  //                               'SEQUEL',
  //                               'PARENT',
  //                               'SOURCE'
  //                             ].includes(relation?.relationType)
  //                           ) {
  //                             return <Relation media={relation?.node} />
  //                           }
  //                         }}
  //                       </For>
  //                     }
  //                   </div>
  //                 )}
  //               </div>
  //               <Episodes media={infoHandler()?.media as Media} />
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </>
  // )
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
