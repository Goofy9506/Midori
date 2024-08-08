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
  formatTime,
  loading,
  playing,
  progressBar,
  setPlaying,
  subtitles,
  videoTime
} from '@renderer/modules/AnimeHandler'
import {
  RiArrowsArrowLeftSLine,
  RiMediaClosedCaptioningFill,
  RiMediaFullscreenExitFill,
  RiMediaFullscreenFill,
  RiMediaPauseFill,
  RiMediaPictureInPicture2Fill,
  RiMediaPictureInPictureExitFill,
  RiMediaPlayFill,
  RiMediaSkipBackFill,
  RiMediaSkipForwardFill,
  RiMediaSpeedUpFill,
  RiMediaVolumeMuteFill,
  RiMediaVolumeUpFill,
  RiSystemListSettingsFill
} from 'solid-icons/ri'
import { Anime } from '@renderer/types/Media'
import { useStorageContext } from '@renderer/hooks/Storage'

export const [defaultLanguage, setDefaultLanguage] = createSignal<string>('English')
export const [showHoverTime, setShowHoverTime] = createSignal<boolean>(false)
export const [isFullscreen, setIsFullscreen] = createSignal<boolean>(false)
export const [hoverTime, setHoverTime] = createSignal<string>('00:00')
export const [showed, setShowed] = createSignal<boolean>(true)
export const [offsetX, setOffsetX] = createSignal<number>(0)
export const [PIP, setPIP] = createSignal<boolean>(false)
const [settingsOpen, setSettingsOpen] = createSignal<boolean>(false)

export let skipEnding: HTMLDivElement | undefined
export let skipIntro: HTMLDivElement | undefined
export let video: HTMLVideoElement | undefined
export let track: HTMLTrackElement | undefined
export let timer: NodeJS.Timeout | undefined
let sectionBar: HTMLDivElement | undefined

const calculateProgressTime = (
  event: MouseEvent & {
    currentTarget: HTMLDivElement
    target: Element
  }
) => {
  if (!video?.duration || !sectionBar) return

  const timelineWidth = sectionBar.clientWidth
  const newOffsetX = event.offsetX
  let newPercent = Math.floor((newOffsetX / timelineWidth) * video.duration)
  if (newPercent < 0) newPercent = 0
  if (newPercent > video.duration) newPercent = video.duration
  const clampedOffsetX =
    newOffsetX < 20 ? 20 : newOffsetX > timelineWidth - 20 ? timelineWidth - 20 : newOffsetX
  setOffsetX(clampedOffsetX)
  setHoverTime(formatTime(newPercent))
}

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
  animeInfo: Anime
  episode: any
  subOrDub: string
  onClose: () => void
}

const Player: Component<PlayerProps> = (props) => {
  const { Volume } = useStorageContext()
  const Handler = new AnimeHandler(Number(props.episode), props.animeInfo, props.subOrDub)

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
        class={`player-container${isFullscreen() ? ' fullscreen' : ''}`}
        onMouseMove={() => {
          setShowed(true)
          document.body.style.cursor = 'default'
          clearTimeout(timer)
          timer = setTimeout(() => [setShowed(false), (document.body.style.cursor = 'none')], 2000)
        }}
      >
        <div class={`controls ${showed() ? 'showed' : ''}`}>
          <div class="top-controls">
            <div class="inner-controls">
              <RiArrowsArrowLeftSLine
                onClick={() => Handler.closeVideoSource(props.onClose)}
                class="exit"
              />
              <div class="episode-info">
                Episode {episodeNumber().toString()}: {episodeTitle()}
                <p class="anime-name">{props.animeInfo.name}</p>
              </div>
            </div>
          </div>
          <div class="mid-controls">
            <div class="inner-controls">
              <span class="control" onClick={() => Handler.episodeChange(-1)}>
                <RiMediaSkipBackFill />
              </span>
              <span class="control">
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
              <span class="control" onClick={() => Handler.episodeChange(1)}>
                <RiMediaSkipForwardFill />
              </span>
            </div>
          </div>
          <div class="lower-controls">
            <div class="inner-controls">
              <div class="player-time">{videoTime()}</div>
              <div class="skip" ref={skipIntro} onClick={Handler.skipIntro}>
                Skip Intro
              </div>
              <div class="skip" ref={skipEnding} onClick={Handler.skipEnding}>
                Skip Ending
              </div>
              <div
                class="hover-time"
                style={{ left: `${offsetX()}px`, opacity: showHoverTime() ? '1' : '0' }}
              >
                {hoverTime()}
              </div>
              <div
                class="progress-section"
                onClick={Handler.dragProgressBar}
                onMouseMove={(e) => {
                  calculateProgressTime(e)
                }}
                onMouseDown={(e) => {
                  if (!video) return
                  if (!video.paused) video.pause()
                  setPlaying(true)
                  Handler.dragProgressBar(e)
                }}
                onMouseUp={() => {
                  if (!video) return
                  if (video.paused) video.play()
                  setPlaying(false)
                }}
                onMouseEnter={() => {
                  setShowHoverTime(true)
                }}
                onMouseLeave={() => {
                  setShowHoverTime(false)
                }}
                ref={sectionBar}
              >
                <div class="loaded-bar" style={{ width: bufferedBar() }} />
                <div class="progress-bar" style={{ width: progressBar() }} />
              </div>
              <div class="settings control">
                <div class="icon" onClick={() => setSettingsOpen(true)}>
                  <RiSystemListSettingsFill />
                </div>
              </div>
              <div class="volume control">
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
                    value={Volume()}
                    onChange={(e) => {
                      const newVolume = Math.min(Math.max(parseFloat(e.target.value), 0), 1)
                      const { setStore } = useStorageContext()
                      if (!video) return
                      video.volume = newVolume
                      video.muted = newVolume === 0
                      setStore('Volume', newVolume)
                    }}
                  />
                </div>
              </div>
              <div class="pip control">
                <div
                  class="icon"
                  onClick={() => {
                    Handler.togglePIP()
                  }}
                >
                  {PIP() ? <RiMediaPictureInPicture2Fill /> : <RiMediaPictureInPictureExitFill />}
                </div>
              </div>
              <div
                class="fullscreen control"
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
        </div>
        <video
          id="midori-player"
          crossOrigin="anonymous"
          ref={video}
          onEnded={() => Handler.videoEnded(props.onClose)}
          onTimeUpdate={Handler.videoTimeUpdate}
        >
          <track ref={track} default data-type="vtt" class="subtitles" />
        </video>
      </div>
    </Portal>
  )
}

export default Player
