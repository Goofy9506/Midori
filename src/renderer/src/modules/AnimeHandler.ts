/* eslint-disable no-inner-declarations */
/* eslint-disable solid/reactivity */
import GogoAnime from '@renderer/services/extractors/en/GogoAnime'
import Zoro from '@renderer/services/extractors/en/Zoro'
import {
  PIP,
  defaultLanguage,
  setIsFullscreen,
  setPIP,
  skipEnding,
  skipIntro,
  timer,
  track,
  video
} from '@renderer/components/Player'
import { STORAGE } from '@renderer/utils/Storage'
import axios, { Axios } from 'axios'
import Hls from 'hls.js'
import { createSignal } from 'solid-js'
import Notify from '../components/Notify'
import { animeInfo, setAnimeInfo } from '@renderer/App'
import { Anime } from '@renderer/types/Media'
import { QLoader } from '@renderer/services/anilist/QLoader'

export const [aniSkipError, setAniSkipError] = createSignal<boolean>(false)
export const [aniSkipOnce, setAniSkipOnce] = createSignal<boolean>(false)
export const [timeStampsOnce, setTimeStampsOnce] = createSignal<boolean>(false)
export const [loading, setLoading] = createSignal<boolean>(true)
export const [playing, setPlaying] = createSignal<boolean>(true)
export const [subtitles, setSubtitles] = createSignal<any[]>([])
export const [bufferedBar, setBufferedBar] = createSignal<string>('0%')
export const [progressBar, setProgressBar] = createSignal<string>('0%')
export const [episodeTitle, setEpisodeTitle] = createSignal<string>('')
export const [episodeNumber, setEpisodeNumber] = createSignal<number>(0)
export const [videoTime, setVideoTime] = createSignal<string>('00:00 / 00:00')

let interval: NodeJS.Timeout | undefined

export const formatTime = (time: number) => {
  const seconds: any = Math.floor(time % 60)
    .toString()
    .padStart(2, '0')
  const minutes: any = (Math.floor(time / 60) % 60).toString().padStart(2, '0')
  const hours: any = Math.floor(time / 3600)
    .toString()
    .padStart(2, '0')
  if (hours == '00') {
    return `${minutes}:${seconds}`
  }
  return `${hours}:${minutes}:${seconds}`
}

const sortQuality = (videos: any[]) => {
  const qualityOrder = ['1080p', '720p', '480p', '360p', 'default', 'backup']

  videos.sort((a, b) => {
    const indexA = qualityOrder.indexOf(a.quality || 'default')
    const indexB = qualityOrder.indexOf(b.quality || 'default')

    if (indexA < indexB) return -1
    if (indexA > indexB) return 1
    return 0
  })

  return videos[0]
}

export default class AnimeHandler {
  private axiosInstance: Axios = axios.create()
  private hlsData: Hls = new Hls()
  private skipTimes: any[] = []
  private animeInfo: Anime
  private subOrDub: string
  private epNumb: number

  constructor(episodeNumber: number, animeInfo: Anime, subOrDub: string) {
    this.animeInfo = animeInfo
    this.subOrDub = subOrDub
    this.epNumb = episodeNumber
    setEpisodeNumber(episodeNumber)
  }

  /**
   * Asynchronously loads the video progress by retrieving the episode data from storage,
   * finding the progress of the current anime title and episode number,
   * and setting the video's current time to the calculated time with a minimum of 0.
   */
  private loadVideoProgress = async () => {
    if (!video) return
    const episodeData = await STORAGE.getEpisodeProgress()
    const progress = episodeData?.find(
      (item) => item.media === this.animeInfo.name && item.episode === episodeNumber()
    )

    if (!progress) {
      video.currentTime = 0
      return
    }

    const time: number = Math.max(progress.time - 5, 0)

    video.currentTime = time
  }

  /**
   * Saves the progress of the current video by updating the episode progress in the storage.
   * Retrieves the current episode progress data, checks if the episode exists, and updates its timestamp.
   * If the episode does not exist, a new entry is added to the progress data.
   * Limits the episode progress data to a maximum of 1000 entries by removing the oldest entry if necessary.
   * Finally, updates the 'EpisodeProgress' in the storage with the modified episode data.
   */
  private saveVideoProgress = async () => {
    if (!video) return
    const episodeData = await STORAGE.getEpisodeProgress()

    if (episodeData === undefined) {
      STORAGE.set('EpisodeProgress', [])
    }

    const existingEpisodeIndex = episodeData.findIndex(
      (item) => item.media === this.animeInfo.name && item.episode === episodeNumber()
    )

    const previous = episodeData?.find(
      (item) => item.media === this.animeInfo.name && item.episode === episodeNumber() - 1
    )

    if (previous) {
      episodeData.slice(episodeData.indexOf(previous))
    }

    if (video.currentTime === episodeData[existingEpisodeIndex]?.time) return

    if (existingEpisodeIndex !== -1) {
      episodeData[existingEpisodeIndex] = {
        ...episodeData[existingEpisodeIndex],
        time: video.currentTime,
        timeUpdated: Date.now()
      }
    } else {
      episodeData.push({
        media: this.animeInfo.name,
        episode: episodeNumber(),
        time: video.currentTime,
        timeUpdated: Date.now(),
        timeCreated: Date.now(),
        data: this.minifyData(this.animeInfo, episodeNumber())
      })
    }

    if (episodeData.length > 1000) {
      const oldestIndex = episodeData.reduce(
        (oldestIndex, item, currentIndex) =>
          item.timeUpdated < episodeData[oldestIndex].timeUpdated ? currentIndex : oldestIndex,
        0
      )
      episodeData.splice(oldestIndex, 1)
    }

    STORAGE.set('EpisodeProgress', episodeData)
  }

  private minifyData = (data: any, clientProgress: number) => {
    const newData = {
      id: data.id,
      idMal: data.idMal,
      name: data.name,
      nameRomaji: data.nameRomaji,
      cover: data.cover,
      userProgress: clientProgress,
      totalEpisodes: data.totalEpisodes,
      meanScore: data.meanScore,
      status: data.status
    }
    return newData
  }

  /**
   * Loads the video source for the current episode, including fetching subtitles if available.
   * Updates the episode title, resets the video player's current time, and loads the HLS source if supported.
   * @returns {Promise<void>} A promise that resolves once the video source is successfully loaded.
   */
  public loadVideoSource = async (): Promise<void> => {
    this.resetVideoSource()

    let currentSource = await this.retrieveZoro()
    if (!currentSource) {
      currentSource = await this.retrieveGogo()
    }

    if (Hls.isSupported() && video) {
      this.loadHLS(currentSource)
    }
  }

  /**
   * Resets the video source by updating the episode title, video time, buffered progress, playing status, subtitles, and loading status.
   * If a video element exists, sets its current time to 0. Detaches and removes the media element if it exists in the Hls data.
   */
  private resetVideoSource = () => {
    setEpisodeTitle(this.animeInfo.episodes[episodeNumber() - 1]?.title || '')
    setVideoTime('00:00')
    setBufferedBar('0%')
    setProgressBar('0%')
    setPlaying(true)
    setSubtitles([])
    setLoading(true)

    document.body.style.cursor = 'default'

    if (video) {
      video.currentTime = 0
    }
    if (this.hlsData.media) {
      this.hlsData.detachMedia()
      this.hlsData.media?.remove()
    }
    document.removeEventListener('keydown', this.keybindHandler)
  }

  /**
   * Retrieves the video source URL for a given title by searching on GogoAnime.
   * Uses the extra titles obtained and searches for the first available video source with the best quality.
   * @returns A promise that resolves to the video source URL if found, otherwise undefined.
   */
  private retrieveGogo = async () => {
    const gogo = new GogoAnime()
    const titles = await this.getExtraTitles()
    for (const title of titles) {
      const searchResult = await gogo.search(title)
      if (searchResult.results.length !== 0) {
        const resultId =
          this.subOrDub === 'sub' ? searchResult.results[0].id : searchResult.results[0].id + '-dub'
        const resultEpisode = `${resultId}-episode-${episodeNumber()}`
        const currentSource = sortQuality(await gogo.videoSourceList(resultEpisode)).url
        if (currentSource) {
          return currentSource
        }
      }
    }
  }

  /**
   * Retrieves information about a specific anime using the Zoro extractor.
   * Searches for the anime title, fetches detailed information, and retrieves the video source.
   * Alerts if the dub version is not found and loads the sub version instead.
   * @returns The URL of the current video source for the anime.
   */
  private retrieveZoro = async () => {
    const zoro = new Zoro()
    const language = await STORAGE.getAudioLanguage()
    const titles = this.getExtraTitles()
    for (const title of titles) {
      const searchResult = await zoro.search(title)
      const result = searchResult.results.find(
        (result: any) =>
          (result.title.toLowerCase() === title.toLowerCase() &&
            Number(result.sub) ===
              Number(
                this.animeInfo.nextAiringEpisode
                  ? this.animeInfo.nextAiringEpisode - 1
                  : this.animeInfo.episodes
              )) ||
          result.japaneseTitle.toLowerCase() === title.toLowerCase()
      )
      if (result) {
        const animeData = await zoro.fetchAnimeInfo(result.id)
        if (!animeData.episodes[episodeNumber() - 1]) {
          new Notify().Alert('Episode not found... Try again later!')
          return
        }
        const getEpisodeId = (
          language: string,
          animeData: any,
          episodeNumber: () => number
        ): string => {
          let episodeId: string
          if (language === 'en') {
            // eslint-disable-next-line prettier/prettier
            episodeId = animeData.episodes[episodeNumber() - 1].id.replace(
              /\$both|\$sub|\$dub/,
              `$dub`
            )
            if (!episodeId.includes('$dub')) {
              new Notify().Alert('dub was not found, loading sub instead...')
            }
          } else {
            episodeId = animeData.episodes[episodeNumber() - 1].id
          }
          return episodeId
        }

        const episodeId = getEpisodeId(language, animeData, episodeNumber)
        const source = await zoro.videoSourceList(episodeId)

        if (await source.url) {
          const sourceUrl = await source.url
          const currentSource = sourceUrl.sources[0].url
          if (sourceUrl.subtitles && (await source.language) === 'sub') {
            this.getSubtitles(sourceUrl.subtitles)
          }
          if (currentSource) {
            return currentSource
          }
        }
      }
    }
  }

  /**
   * Retrieves and sets the subtitles for the provided video source.
   *
   * @param source The video source containing the subtitles.
   */
  public getSubtitles = async (source: any) => {
    const subtitles: any[] = []
    const defaultSub = source.find((s: any) => s.lang === defaultLanguage())

    source.forEach((subtitle: any) => {
      if (subtitle.lang === 'Thumbnails') return
      subtitles.push(subtitle)
    })
    setSubtitles(subtitles)

    try {
      await this.axiosInstance.get(defaultSub?.url).then((response) => {
        if (!track) return
        const subBlock = new Blob([response?.data], { type: 'text/vtt' })
        const subUrl = URL.createObjectURL(subBlock)
        track.src = subUrl
      })
    } catch (error) {
      console.error('Error fetching subtitle:', error)
    }
  }

  /**
   * Asynchronously retrieves the timestamps for the opening (op) and ending (ed) sequences of the current anime episode.
   * Uses the AniSkip class to fetch skip times for the specified anime episode based on its ID and episode number.
   * @returns An object containing arrays of timestamps for the opening and ending sequences.
   */
  public getTimeStamps = async () => {
    const op: any = []
    const ed: any = []
    const timeStamp = await new QLoader().getSkipTimes(
      this.animeInfo.idMal.toString(),
      episodeNumber()
    )
    if (!timeStamp) return setAniSkipError(true)
    timeStamp.forEach((ep: any) => {
      if (ep.skipType === 'ed') {
        ed.push(ep)
      }
      if (ep.skipType === 'op') {
        op.push(ep)
      }
    })
    this.skipTimes.push({ op, ed })
    return
  }

  /**
   * Asynchronously updates the timestamps for the video player based on the current video time.
   * Checks if the video is within the opening or ending intervals and adjusts the display of skipIntro and skipEnding accordingly.
   */
  public updateTimeStamps = () => {
    if (!video) return

    if (this.skipTimes.length === 0 && !aniSkipError() && !aniSkipOnce()) {
      this.getTimeStamps()
      setAniSkipOnce(true)
    }

    if (aniSkipError()) return

    const checkInterval = async (element: any, button: any) => {
      if (!video) return
      const startTime = this.skipTimes[0]?.[element][0]?.interval.startTime
      const endTime = this.skipTimes[0]?.[element][0]?.interval.endTime

      if (video?.currentTime > startTime && video?.currentTime < endTime) {
        if (!button) return
        const SkipOPED = await STORAGE.getSkipOPED()
        if (SkipOPED) {
          if (element === 'op') {
            this.skipIntro()
          } else {
            this.skipEnding()
          }
          return
        }
        button.style.display = 'block'
      } else {
        if (!button) return
        if (button.style.display === 'block') {
          button.style.display = 'none'
        }
      }
    }

    checkInterval('op', skipIntro)
    checkInterval('ed', skipEnding)
  }

  /**
   * Asynchronously skips the intro of the video.
   * If the video element is not available, the function does nothing.
   * Retrieves the intro end time from the timestamps and sets the video's current time to the end of the intro.
   */
  public skipIntro = async () => {
    if (!video) return
    const { op } = this.skipTimes[0]
    video.currentTime = op[0]?.interval.endTime
  }

  /**
   * Asynchronously skips the ending of the video.
   * If the video element is not available, the function returns early.
   * Retrieves the ending timestamp and sets the video's current time to the end time of the ending interval.
   */
  public skipEnding = async () => {
    if (!video) return
    const { ed } = this.skipTimes[0]
    video.currentTime = ed[0]?.interval.endTime
  }

  /**
   * Loads the HLS video source and sets up event listeners for various HLS events.
   *
   * @param source - The HLS video source to load.
   */
  private loadHLS = async (source: string) => {
    if (!video) return
    document.addEventListener('keydown', this.keybindHandler)
    const volume: number = await STORAGE.getVolume()
    this.hlsData.loadSource(source)
    this.hlsData.attachMedia(video)
    this.hlsData.on(Hls.Events.MANIFEST_LOADED, async () => {
      this.hlsData.startLoad()
      this.loadVideoProgress()
      setLoading(false)
      setAniSkipError(false)
      this.hlsData.currentLevel = this.hlsData.levels.length - 1
      if (interval) clearInterval(interval)
      interval = setInterval(() => {
        this.saveVideoProgress()
      }, 30000)
      if (video?.autoplay) this.playVideoSource()
    })
    video.volume = volume
  }

  public togglePIP = () => {
    if (!video) return
    if (video !== document.pictureInPictureElement) {
      video.requestPictureInPicture().catch((err) => {
        console.error(err)
      })
    } else {
      document.exitPictureInPicture()
    }
    setPIP(!PIP())
  }

  /**
   * Closes the video source by detaching media, pausing the video, resetting sources, exiting fullscreen, and updating loading and playing states.
   * @param close - A function to be called after closing the video source.
   */
  public closeVideoSource = async (close: () => void) => {
    document.removeEventListener('keydown', this.keybindHandler)
    if (document.body.style.cursor === 'none') {
      document.body.style.cursor = 'default'
    }
    const autoUpdate = await STORAGE.getAutoUpdate()
    if (autoUpdate === true) {
      this.saveToAnilist()
    }
    if (this.hlsData.media) {
      this.hlsData.detachMedia()
      this.hlsData.media?.remove()
    }
    if (video) {
      video.pause()
      video.src = ''
    }
    if (track) {
      track.src = ''
    }
    this.resetVideoSource()
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
    setLoading(true)
    setPlaying(false)
    setTimeout(() => {
      close()
    }, 200)
    if (interval) clearInterval(interval)
    clearTimeout(timer)
    setTimeout(() => (document.body.style.cursor = 'default'), 2300)
  }

  /**
   * Toggles the playing state of the video element and either pauses or plays the video accordingly.
   */
  public playVideoSource = () => {
    if (!video) return
    setPlaying(!playing())
    playing() ? video.pause() : video.play()
  }

  /**
   * Asynchronous method to handle the event when the video ends.
   * Checks if the video exists, retrieves the autoPlay setting from storage,
   * and if autoPlay is enabled, triggers the method to change to the next episode.
   */
  public videoEnded = async (close: () => void) => {
    if (!video) return
    if (this.animeInfo?.currentEpisodes === episodeNumber()) return this.closeVideoSource(close)
    const autoPlay = await STORAGE.getAutoPlay()
    if (autoPlay) {
      this.episodeChange(1)
    }
  }

  /**
   * Updates the current episode number based on the provided arithmetic value and loads the corresponding video source.
   *
   * @param arithmetic - The value by which the episode number will be incremented or decremented.
   */
  public episodeChange = async (arithmetic: number) => {
    const autoUpdate = await STORAGE.getAutoUpdate()
    if (autoUpdate === undefined) {
      STORAGE.set('AutoUpdate', false)
    }
    const episodeInfo = this.animeInfo.nextAiringEpisode
      ? this.animeInfo.nextAiringEpisode - 1
      : this.animeInfo.episodes
    if (Number(episodeNumber()) === Number(episodeInfo)) return
    if (arithmetic === 1 && autoUpdate === true) this.saveToAnilist()
    this.epNumb = Number(this.epNumb) + Number(arithmetic)
    setEpisodeNumber(this.epNumb)
    this.loadVideoSource()
  }

  /**
   * Updates the video time display by formatting the current time and duration of the video.
   * If the video element is not available, no action is taken.
   */
  public videoTimeUpdate = async () => {
    if (!video) return

    if (video.readyState === 4) {
      setBufferedBar(`${(video?.buffered?.end(0) / (video?.duration ?? 0)) * 100}%`)
    }
    if (video.duration > 0) {
      setVideoTime(formatTime(video.currentTime) + ' / ' + formatTime(video.duration))
      setProgressBar(`${(video.currentTime / video.duration) * 100}%`)
    }
    if (timeStampsOnce()) return
    const loadTimeStamps = await STORAGE.getLoadTimeStamps()
    if (loadTimeStamps === undefined) {
      STORAGE.set('LoadTimeStamps', false)
      setTimeStampsOnce(true)
    }
    if (loadTimeStamps) {
      this.updateTimeStamps()
    } else {
      setTimeStampsOnce(true)
    }
  }

  /**
   * Updates the progress bar and video time based on the mouse drag event on the timeline.
   *
   * @param event - The mouse event that triggers the drag action.
   */
  public dragProgressBar = (event: MouseEvent) => {
    if (!video) return

    const timeline = event.currentTarget as HTMLDivElement
    const rect = timeline.getBoundingClientRect()
    const offsetX = event.clientX - rect.left
    const percentage = offsetX / timeline.clientWidth

    const newTime = Math.min(Math.max(0, percentage * video.duration), video.duration)
    setProgressBar(`${((newTime ?? 0) / (video.duration ?? 0)) * 100}%`)

    video.currentTime = newTime
  }

  /**
   * Handles key events for video player controls.
   *
   * @param event - The keyboard event triggering the keybind.
   */
  public keybindHandler = (event: KeyboardEvent) => {
    if (event.keyCode === 229 || !video) return

    switch (event.code) {
      case 'Space':
        event.preventDefault()
        this.playVideoSource()
        break
      case 'ArrowLeft':
        event.preventDefault()
        video.currentTime -= 5
        break
      case 'ArrowUp':
        event.preventDefault()
        video.volume = Math.min(Math.max(video.volume + 0.1, 0), 1)
        STORAGE.set('Volume', video.volume)
        break
      case 'ArrowDown':
        event.preventDefault()
        video.volume = Math.min(Math.max(video.volume - 0.1, 0), 1)
        STORAGE.set('Volume', video.volume)
        break
      case 'ArrowRight':
        event.preventDefault()
        video.currentTime += 5
        break
      case 'KeyF':
        if (document.fullscreenElement) {
          document.exitFullscreen()
          setIsFullscreen(false)
        } else {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
          }
        }
        break
      case 'KeyM':
        video.muted = !video.muted
        break
      case 'KeyN':
        this.episodeChange(1)
        break
      case 'KeyP':
        this.episodeChange(-1)
        break
      default:
        break
    }
  }

  /**
   * Saves the user's progress and status for the current anime to Anilist.
   * Retrieves the user's data for the anime, checks the current status, and updates the progress accordingly.
   */
  public saveToAnilist = async () => {
    if (!video) return
    if (episodeNumber() < this.animeInfo.userProgress) return
    if (!((video.currentTime * 100) / video.duration > 80)) return

    const status = this.animeInfo.userStatus
    const QLoad = new QLoader()
    switch (status) {
      case 'CURRENT':
        QLoad.setAnimeStatus(this.animeInfo.id, 'CURRENT', episodeNumber())
        break
      case 'REPEATING':
      case 'COMPLETED':
        QLoad.setAnimeStatus(this.animeInfo.id, 'REWATCHING', episodeNumber())
        break
      default:
        QLoad.setAnimeStatus(this.animeInfo.id, 'CURRENT', episodeNumber())
        break
    }

    if (this.animeInfo.userProgress) {
      this.animeInfo.userProgress = episodeNumber()
      const updatedAnimeInfo = animeInfo()
      if (updatedAnimeInfo) {
        updatedAnimeInfo.lists.forEach((list: any) => {
          if (list.status === 'CURRENT') {
            const existingEpisodeIndex = list.entries.findIndex(
              (entry: any) => entry.mediaId === this.animeInfo.id
            )
            if (existingEpisodeIndex !== -1) {
              list.entries[existingEpisodeIndex] = {
                ...list.entries[existingEpisodeIndex],
                progress: Number(episodeNumber())
              }
              const [updatedEntry] = list.entries.splice(existingEpisodeIndex, 1)
              list.entries.unshift(updatedEntry)
              setAnimeInfo(updatedAnimeInfo)
            }
          }
        })
      }
    }
  }

  /**
   * Retrieves extra titles for the anime from the provided anime information.
   * Combines English, Romaji, Native, and Synonyms titles, removes specific keywords,
   * and returns a list of modified titles.
   *
   * @returns {string[]} List of modified anime titles
   */
  private getExtraTitles = (): string[] => {
    const titles: string[] = []
    const returnTitles: string[] = []
    if (this.animeInfo.name) {
      titles.push(this.animeInfo.name)
    }
    if (this.animeInfo.nameRomaji) {
      titles.push(this.animeInfo.nameRomaji)
    }
    const renameTitles = !this.animeInfo.synonyms
      ? titles
      : titles.concat(Object.values(this.animeInfo.synonyms))
    renameTitles.forEach((title) => {
      returnTitles.push(title.replace('Season ', '').replace('Part', ' ').replace(':', ''))
    })
    return returnTitles
  }
}
