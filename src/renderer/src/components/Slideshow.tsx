import { Component, For, createEffect, createSignal } from 'solid-js'

import '../styles/Slideshow.scss'

interface CardProps {
  listInfo: any
}

const SlideCard: Component<CardProps> = (props) => {
  return (
    <>
      <div class="slideshow">
        <div class="info">
          <div class="cover">
            <img src={props.listInfo.coverImage.large} alt="" />
          </div>
          <div class="episodes">
            {props.listInfo.nextAiringEpisode.episode - 1} / {props.listInfo.episodes || '??'}
            <strong> Episodes</strong>
          </div>
          <div class="status">{props.listInfo.status}</div>
          <h1 class="title">{props.listInfo.title.english || props.listInfo.title.romaji}</h1>
          {/* <ul class="genres">
            <For each={props.listInfo.genres}>
              {(genre: any) => {
                return <li>{genre}</li>
              }}
            </For>
          </ul> */}
        </div>
        <div class="banner">
          {props.listInfo.bannerImage ? (
            <img src={props.listInfo.bannerImage} alt="" />
          ) : (
            <img src={props.listInfo.coverImage.large} class="slide-y" alt="" />
          )}
        </div>
      </div>
    </>
  )
}

interface SlideProps {
  listInfo: any
}

const Slideshow: Component<SlideProps> = (props) => {
  const [listData, setListData] = createSignal<any>(null)

  let slideShowRef: HTMLDivElement | undefined
  let scroll = 0
  setInterval(() => {
    if (!slideShowRef) return
    if (scroll !== slideShowRef.childElementCount) {
      slideShowRef.scrollLeft += 1800
      scroll += 1
    }

    if (scroll === slideShowRef.childElementCount) {
      slideShowRef.scrollLeft -= 1800
      scroll--
    }
  }, 20000)

  createEffect(() => {
    const mediaArray: any[] = []
    props.listInfo?.media.forEach((media: any) => {
      if (media.isAdult) return
      if (media.countryOfOrigin !== 'JP') return
      mediaArray.push(media)
    })
    setListData(mediaArray)
  })

  return (
    <>
      {props.listInfo ? (
        <div class="slideshow-container">
          <div class="slideshow-wrapper" ref={slideShowRef}>
            <div class="gradient" />
            <For each={listData()?.slice(0, 12)}>
              {(media: any) => {
                return <SlideCard listInfo={media} />
              }}
            </For>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default Slideshow
