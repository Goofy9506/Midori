import axios, { AxiosInstance } from 'axios'

export default class AniSkip {
  private BASE_URL: string
  private axiosInstance: AxiosInstance

  /**
   * Initializes the AniSkip class with the base URL and default headers.
   */
  constructor() {
    this.BASE_URL = `https://api.aniskip.com/v2/skip-times/`
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
   * Fetches skip times for a specific anime episode.
   * @param id The ID of the anime.
   * @param episode The episode number.
   * @returns Skip times data.
   */
  public async getAniSkip(id: string, episode: number): Promise<any> {
    let data: any = undefined
    try {
      await this.axiosInstance
        .get(
          `/${id}/${episode}?types[]=ed&types[]=mixed-ed&types[]=mixed-op&types[]=op&types[]=recap&episodeLength=`
        )
        .then((response) => {
          data = response.data.results
        })
        .catch((error) => {
          console.error('Error fetching skip times:', error)
        })

      return data
    } catch (error) {
      console.error('Error fetching skip times:', error)
    }
  }
}
