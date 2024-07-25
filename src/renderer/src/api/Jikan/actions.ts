import { Episode } from '@renderer/types/Media'
import axios, { AxiosInstance } from 'axios'

export default class Jikan {
  private BASE_URL: string
  private axiosInstance: AxiosInstance

  /**
   * Initializes the AniSkip class with the base URL and default headers.
   */
  constructor() {
    this.BASE_URL = `https://api.jikan.moe/v4/`
    this.axiosInstance = axios.create({
      baseURL: this.BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
  }

  /**
   * Asynchronously retrieves episodes for a given anime ID.
   *
   * @param id The ID of the anime to fetch episodes for.
   * @returns A promise that resolves to an array of Episode objects containing episode details.
   * @throws Error if there is a failure in fetching the episodes.
   */
  public async getEpisodes(id: number): Promise<any> {
    let hasNextPage = true
    let page = 0
    const episodes: Episode[] = []
    try {
      while (hasNextPage) {
        page++
        await this.axiosInstance
          .get<EpisodeResponse>(`anime/${id}/episodes?page=${page}`)
          .then((response) => {
            setTimeout(() => {}, 1500)
            response.data.data.forEach((episode: Data) => {
              const ep = episode.mal_id.toString()
              episodes.push({
                number: ep,
                // Continuing the revenge of Dantotsu :prayge:
                filler: id !== 34566 ? episode.filler : true,
                title: episode.title,
                link: null,
                desc: null,
                thumb: null,
                maxLength: null
              })
            })
            hasNextPage = response.data.pagination.has_next_page
          })
      }
      return episodes
    } catch (error) {
      throw new Error('Failed to fetch episodes')
    }
  }
}

type EpisodeResponse = {
  pagination: Pagination
  data: Data[]
}

type Data = {
  mal_id: number
  title: string
  filler: boolean
}

type Pagination = {
  has_next_page: boolean
}
