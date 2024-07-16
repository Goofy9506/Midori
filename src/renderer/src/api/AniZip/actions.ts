import { AniZipType } from '@renderer/types/Ani'
import axios, { AxiosInstance } from 'axios'

export default class AniZip {
  private BASE_URL: string
  private axiosInstance: AxiosInstance

  /**
   * Initializes the AniZip class with the base URL and default headers.
   */
  constructor() {
    this.BASE_URL = 'https://api.ani.zip/mappings'
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
   * Fetches anime data from the API based on the provided Anilist ID.
   * @param id The Anilist ID for which anime data needs to be fetched.
   * @returns A promise that resolves to an array of AniZipType.
   */
  public async getAniZip(id: string): Promise<AniZipType> {
    try {
      const response = await this.axiosInstance.get<AniZipType>('', {
        params: {
          anilist_id: id
        }
      })
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch anime data')
    }
  }
}
