import axios, { AxiosInstance } from 'axios'
import { ViewerId } from './graphql/Viewer'
import { STORAGE } from '@renderer/utils/Storage'
import { ViewerList } from './graphql/ViewerList'
import { MediaType } from '@renderer/types/Anilist'
import { Media } from './graphql/Media'
import { currentYear, currentSeason } from '@renderer/utils/Date'
import { AiringMedia } from './graphql/AiringMedia'
import { DetailedMedia } from './graphql/DetailedMedia'
import { Episode } from '@renderer/types/Media'
import { Relations } from './graphql/Relations'
import { Search } from './graphql/Search'
import { AnimeProgress } from './graphql/AnimeProgress'
import { AnimeStatus } from './graphql/AnimeStatus'

const store = await STORAGE.getStore()

export class QLoader {
  private ANILIST_URL: string = 'https://graphql.anilist.co'
  private ANIZIP_URL: string = 'https://api.ani.zip/mappings'
  private ANISKIP_URL: string = 'https://api.aniskip.com/v2/skip-times/'
  private JIKAN_URL: string = 'https://api.jikan.moe/v4/'
  private TOKEN: string = store.AnilistToken
  private AnilistInstance: AxiosInstance
  private AniskipInstance: AxiosInstance
  private AnizipInstance: AxiosInstance
  private JikanInstance: AxiosInstance
  private METHOD: string = 'POST'

  constructor() {
    const axiosConfig = {
      method: this.METHOD,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    }

    this.AnilistInstance = axios.create({
      baseURL: this.ANILIST_URL,
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers
      }
    })

    this.AniskipInstance = axios.create({
      baseURL: this.ANISKIP_URL,
      ...axiosConfig,
      method: 'GET'
    })

    this.AnizipInstance = axios.create({
      baseURL: this.ANIZIP_URL,
      ...axiosConfig,
      method: 'GET'
    })

    this.JikanInstance = axios.create({
      baseURL: this.JIKAN_URL,
      ...axiosConfig,
      method: 'GET'
    })
  }

  public getViewer = async () => {
    try {
      const response = await this.AnilistInstance({
        headers: {
          Authorization: 'Bearer ' + this.TOKEN
        },
        data: JSON.stringify({
          query: ViewerId,
          variables: {}
        })
      })
      return response.data.data.Viewer
    } catch (error) {
      throw new Error('Error fetching viewer: ' + error)
    }
  }

  public getViewerId = async () => {
    try {
      const response = await this.AnilistInstance({
        headers: {
          Authorization: 'Bearer ' + this.TOKEN
        },
        data: JSON.stringify({
          query: ViewerId,
          variables: {}
        })
      })
      return response.data.data.Viewer.id
    } catch (error) {
      throw new Error('Error fetching viewer id: ' + error)
    }
  }

  public getViewerList = async (type: MediaType, id?: number) => {
    try {
      const response = await this.AnilistInstance({
        headers: {
          Authorization: 'Bearer ' + this.TOKEN
        },
        data: JSON.stringify({
          query: ViewerList,
          variables: {
            userId: id ? id : await this.getViewerId(),
            type: type
          }
        })
      })
      return response.data.data.MediaListCollection
    } catch (error) {
      throw new Error('Error fetching viewer list: ' + error)
    }
  }

  public getTrending = async (
    type: string,
    format: string,
    seasonMonth?: number | null,
    seasonYear?: number | null
  ) => {
    try {
      const response = await this.AnilistInstance({
        data: JSON.stringify({
          query: Media,
          variables: {
            sort: 'POPULARITY_DESC',
            type: type,
            format: format,
            season: seasonMonth === null ? undefined : currentSeason,
            seasonYear: seasonYear === null ? undefined : currentYear
          }
        })
      })
      return response.data.data.Page.media
    } catch (error) {
      throw new Error('Error fetching trending: ' + error)
    }
  }

  public getTopRated = async (type: MediaType) => {
    try {
      const response = await this.AnilistInstance({
        data: JSON.stringify({
          query: Media,
          variables: {
            sort: 'SCORE_DESC',
            type: type
          }
        })
      })
      return response.data.data.Page.media
    } catch (error) {
      throw new Error('Error fetching top rated: ' + error)
    }
  }

  public getPopular = async (type: MediaType) => {
    try {
      const response = await this.AnilistInstance({
        data: JSON.stringify({
          query: Media,
          variables: {
            sort: 'POPULARITY_DESC',
            type: type
          }
        })
      })
      return response.data.data.Page.media
    } catch (error) {
      throw new Error('Error fetching popular: ' + error)
    }
  }

  public getRecentlyUpdated = async () => {
    try {
      const response = await this.AnilistInstance({
        data: JSON.stringify({
          query: AiringMedia,
          variables: {
            date: Math.floor(Date.now() / 1000 - 10000)
          }
        })
      })
      return response.data.data.Page.airingSchedules
    } catch (error) {
      throw new Error('Error fetching recently updated: ' + error)
    }
  }

  public getMedia = async (id: number, type: MediaType) => {
    try {
      const response = await this.AnilistInstance({
        data: JSON.stringify({
          query: DetailedMedia,
          variables: {
            id: id,
            type: type
          }
        })
      })
      return response.data.data.Media
    } catch (error) {
      throw new Error('Error fetching media: ' + error)
    }
  }

  public getRelations = async (id: number) => {
    try {
      const response = await this.AnilistInstance({
        data: JSON.stringify({
          query: Relations,
          variables: {
            id: id
          }
        })
      })
      return response.data.data.Media.relations
    } catch (error) {
      throw new Error('Error fetching relations: ' + error)
    }
  }

  public getSearched = async (options: Record<string, any>) => {
    try {
      const response = await this.AnilistInstance({
        data: JSON.stringify({
          query: Search,
          variables: {
            type: options.type,
            search: options.search,
            sort: options.sort ?? undefined,
            genres: options.genres ?? undefined,
            tags: options.tags ?? undefined,
            status: options.status ?? undefined,
            format: options.format ?? undefined,
            countryOfOrigin: options.countryOfOrigin ?? undefined,
            excludeGenres: options.excludeGenres ?? undefined,
            excludeTags: options.excludeTags ?? undefined,
            startYear: options.startYear ?? undefined,
            seasonYear: options.seasonYear ?? undefined,
            season: options.season ?? undefined
          }
        })
      })
      return response.data.data.Page.media
    } catch (error) {
      throw new Error('Error fetching searched: ' + error)
    }
  }

  public setAnimeProgress = async (id: number, progress: number) => {
    try {
      await this.AnilistInstance({
        headers: {
          Authorization: 'Bearer ' + this.TOKEN
        },
        data: JSON.stringify({
          query: AnimeProgress,
          variables: {
            mediaId: id,
            progress: progress
          }
        })
      })
    } catch (error) {
      throw new Error('Error setting anime progress: ' + error)
    }
  }

  public setAnimeStatus = async (
    id: number,
    status: string,
    progress: number,
    rawScore?: number
  ) => {
    try {
      await this.AnilistInstance({
        headers: {
          Authorization: 'Bearer ' + this.TOKEN
        },
        data: JSON.stringify({
          query: AnimeStatus,
          variables: {
            mediaId: id,
            status: status,
            progress: progress,
            scoreRaw: rawScore
          }
        })
      })
    } catch (error) {
      throw new Error('Error setting anime status: ' + error)
    }
  }

  public getSkipTimes = async (id: string, episode: number) => {
    try {
      const response = await this.AniskipInstance({
        url: `/${id}/${episode}?types[]=ed&types[]=mixed-ed&types[]=mixed-op&types[]=op&types[]=recap&episodeLength=`
      })
      return response.data.results
    } catch (error) {
      throw new Error('Error fetching skip times: ' + error)
    }
  }

  public getEpisodes = async (id: number) => {
    try {
      const episodes: Episode[] = []
      await this.AnizipInstance({
        params: {
          anilist_id: id
        }
      }).then((response) => {
        Object.values(response.data.episodes).forEach((episode: any) => {
          episodes.push({
            number: episode.episode,
            filler: null,
            title: episode.title.en,
            link: null,
            desc: episode.summary,
            thumb: episode.image,
            maxLength: episode.length
          })
        })
      })
      return episodes
    } catch (error) {
      throw new Error('Failed to fetch episodes: ' + error)
    }
  }

  public getFiller = async (id: any) => {
    const episodes = {}
    let hasNextPage = true
    let page = 0
    try {
      const interval = setInterval(async () => {
        if (hasNextPage) {
          page++
          await this.JikanInstance({
            url: `anime/${id}/episodes?page=${page}`
          }).then((response) => {
            response.data.data.forEach((episode: any) => {
              const ep = episode.mal_id.toString()
              if (episode.filler === true) {
                episodes[ep - 1] = {
                  number: ep - 1,
                  // :prayge:
                  filler: id !== 34566 ? episode.filler : true
                }
              }
            })
            hasNextPage = response.data.pagination.has_next_page
          })
        } else {
          clearInterval(interval)
        }
      }, 450)
      return episodes
    } catch (error) {
      throw new Error('Failed to fetch filler episodes: ' + error)
    }
  }
}
