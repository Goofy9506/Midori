/* eslint-disable prefer-const */
/* eslint-disable solid/reactivity */
// import { STORAGE } from '@renderer/utils/Storage'
// import Hls from 'hls.js'
import { For, createSignal, type Component } from 'solid-js'

import '../styles/Player.scss'
import { Portal } from 'solid-js/web'
import AnimeHandler, {
  bufferedBar,
  episodeNumber,
  episodeTitle,
  loading,
  playing,
  progressBar,
  subtitles,
  videoTime
} from '@renderer/modules/AnimeHandler'
import {
  RiArrowsArrowLeftSLine,
  RiMediaClosedCaptioningFill,
  RiMediaFullscreenExitFill,
  RiMediaFullscreenFill,
  RiMediaPauseFill,
  RiMediaPlayFill,
  RiMediaSkipBackFill,
  RiMediaSkipForwardFill,
  RiMediaSpeedUpFill,
  RiMediaVolumeMuteFill,
  RiMediaVolumeUpFill,
  RiSystemListSettingsFill
} from 'solid-icons/ri'
import { STORAGE } from '@renderer/utils/Storage'

export const [defaultLanguage, setDefaultLanguage] = createSignal<string>('English')
export const [isFullscreen, setIsFullscreen] = createSignal<boolean>(false)
const [settingsOpen, setSettingsOpen] = createSignal<boolean>(false)
const [showed, setShowed] = createSignal<boolean>(true)
export let volume: number = await STORAGE.getVolume()
export let skipEnding: HTMLDivElement | undefined
export let skipIntro: HTMLDivElement | undefined
export let video: HTMLVideoElement | undefined
export let track: HTMLTrackElement | undefined
let sectionBar: HTMLDivElement | undefined
let timer: NodeJS.Timeout | undefined
let mouseDown: boolean = false

// const calculateProgressTime = (
//   event: MouseEvent & {
//     currentTarget: HTMLDivElement
//     target: Element
//   }
// ) => {
//   if (!video?.duration || !progressSection) return

//   const timelineWidth = progressSection.clientWidth
//   const newOffsetX = event.offsetX
//   let newPercent = Math.floor((newOffsetX / timelineWidth) * video.duration)
//   if (newPercent < 0) newPercent = 0
//   if (newPercent > video.duration) newPercent = video.duration
//   setEstTime(formatTime(newPercent))
// }

const Spinner: Component = () => {
  return (
    <>
      <div class="loading">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </>
  )
}

interface PlayerProps {
  animeInfo: any
  episodeData: any
  episode: any
  subOrDub: string
  onClose: () => void
}

const Player: Component<PlayerProps> = (props) => {
  const Handler = new AnimeHandler(
    props.episode.episode,
    props.animeInfo,
    props.subOrDub,
    props.episodeData
  )

  Handler.loadVideoSource()
  setIsFullscreen(false)

  // Handler.getTimeStamps()

  return (
    <Portal mount={document.getElementById('midori-root') as HTMLElement}>
      <div class={`dialog ${settingsOpen() ? '' : 'hidden'}`}>
        <h1 class="title">Settings</h1>
        <div class="settings">
          <div class="option">
            <h1 class="option-title">
              <RiMediaSpeedUpFill />
              Playback Speed
            </h1>
            <div class="switch">
              <select
                class="switch-select"
                onChange={(e) => {
                  if (!video) return
                  video.playbackRate = parseFloat(e.target.value)
                }}
              >
                <option value="0.25">0.25x</option>
                <option value="0.33">0.33x</option>
                <option value="0.50">0.5x</option>
                <option value="0.66">0.66x</option>
                <option value="0.75">0.75x</option>
                <option value="1" selected>
                  1.0x
                </option>
                <option value="1.25">1.25x</option>
                <option value="1.33">1.33x</option>
                <option value="1.50">1.5x</option>
                <option value="1.66">1.66x</option>
                <option value="1.75">1.75x</option>
                <option value="2">2.0x</option>
              </select>
            </div>
          </div>
          {/* <div class="option">
            <h1 class="option-title">
              <RiMediaHqFill />
              Quality
            </h1>
            <div class="switch">
              <select class="switch-select" onChange={qualityChange}>
                {hlsInfo() && (
                  <For each={hlsInfo()?.levels}>
                    {(level) => <option value={level.height}>{level.height}p</option>}
                  </For>
                )}
              </select>
            </div>
          </div>
          */}
          <div class="option">
            <h1 class="option-title">
              <RiMediaClosedCaptioningFill />
              Subtitles
            </h1>
            <div class="switch">
              <select
                class="switch-select"
                value={defaultLanguage()}
                onChange={(e) => {
                  setDefaultLanguage(e.target.value)
                  Handler.getSubtitles(subtitles())
                }}
              >
                {subtitles() && (
                  <For each={subtitles()}>
                    {(langs) =>
                      langs.lang === defaultLanguage() ? (
                        <option value={langs.lang} selected>
                          {langs.lang}
                        </option>
                      ) : (
                        <option value={langs.lang}>{langs.lang}</option>
                      )
                    }
                  </For>
                )}
              </select>
            </div>
          </div>
        </div>
        <div class="close">
          <div onClick={() => setSettingsOpen(false)}>Ok</div>
        </div>
      </div>
      <div class={`blur ${settingsOpen() ? '' : 'hidden'}`} />
      <div
        class="player-container"
        onMouseMove={() => {
          setShowed(true)
          clearTimeout(timer)
          timer = setTimeout(() => [setShowed(false)], 2000)
        }}
      >
        <div class={`controls ${showed() ? 'showed' : ''}`}>
          <div class="exit">
            <RiArrowsArrowLeftSLine onClick={() => Handler.closeVideoSource(props.onClose)} />
            <div>
              Episode {episodeNumber().toString()}: {episodeTitle()}
              <p>{props.animeInfo.title.english}</p>
            </div>
          </div>
          <div class="mid-controls">
            <span class="previous-episode" onClick={() => Handler.episodeChange(-1)}>
              <RiMediaSkipBackFill />
            </span>
            <span class="play-pause">
              {loading() ? (
                <Spinner />
              ) : !playing() ? (
                <RiMediaPauseFill
                  onClick={() => {
                    Handler.playVideoSource()
                  }}
                />
              ) : (
                <RiMediaPlayFill
                  onClick={() => {
                    Handler.playVideoSource()
                  }}
                />
              )}
            </span>
            <span class="next-episode" onClick={() => Handler.episodeChange(1)}>
              <RiMediaSkipForwardFill />
            </span>
          </div>
          <div class="lower-controls">
            <div class="player-time">{videoTime()}</div>
            <div class="skip-intro" ref={skipIntro} onClick={Handler.skipIntro}>
              Skip Intro
            </div>
            <div class="skip-ending" ref={skipEnding} onClick={Handler.skipEnding}>
              Skip Ending
            </div>
            {/* <div class="hover-time">{hoverTime()}</div> */}
            <div
              class="progress-section"
              onClick={Handler.dragProgressBar}
              onMouseMove={(e) => {
                // calculateProgressTime(e)
                if (!mouseDown) return
                Handler.dragProgressBar(e)
              }}
              onMouseDown={() => {
                mouseDown = true
              }}
              onMouseUp={() => {
                mouseDown = false
              }}
              ref={sectionBar}
            >
              <div class="loaded-bar" style={{ width: bufferedBar() }} />
              <div class="progress-bar" style={{ width: progressBar() }} />
            </div>
            <div class="volume">
              <div class="area">
                {video?.muted ? (
                  <RiMediaVolumeMuteFill
                    onClick={() => {
                      if (!video) return
                      video.muted = false
                    }}
                  />
                ) : (
                  <RiMediaVolumeUpFill
                    onClick={() => {
                      if (!video) return
                      video.muted = true
                    }}
                  />
                )}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="any"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = Math.min(Math.max(parseFloat(e.target.value), 0), 1)
                    if (!video) return
                    video.volume = newVolume
                    video.muted = newVolume === 0
                    STORAGE.set('Volume', newVolume)
                  }}
                />
              </div>
            </div>
            <div class="settings">
              <div class="icon" onClick={() => setSettingsOpen(true)}>
                <RiSystemListSettingsFill />
              </div>
            </div>
            <div
              class="fullscreen"
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen()
                  setIsFullscreen(false)
                } else {
                  if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen()
                    setIsFullscreen(true)
                  }
                }
              }}
            >
              {isFullscreen() ? <RiMediaFullscreenExitFill /> : <RiMediaFullscreenFill />}
            </div>
          </div>
        </div>
        <video
          id="midori-player"
          crossOrigin="anonymous"
          ref={video}
          onTimeUpdate={Handler.videoTimeUpdate}
        >
          <track ref={track} default data-type="vtt" class="subtitles" />
        </video>
      </div>
    </Portal>
  )
}

export default Player
