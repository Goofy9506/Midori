import axios, { AxiosInstance } from 'axios'
import { getOptions, makeRequest } from '../Anilist/actions'

export default class Kitsu {
  private BASE_URL: string
  private axiosInstance: AxiosInstance
  private METHOD: string = 'POST'

  /**
   * Initializes the AniSkip class with the base URL and default headers.
   */
  constructor() {
    this.BASE_URL = `https://kitsu.io/api/graphql`
    this.axiosInstance = axios.create({
      baseURL: this.BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
  }

  public async getEpisodes(id: number): Promise<any> {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }

    const query = `
    query {
  lookupMapping(externalId: ${id}, externalSite: ANILIST_ANIME) {
    __typename
    ... on Anime {
      id
      episodes(first: 2000) {
        nodes {
          number
          titles {
            canonical
          }
          description
          thumbnail {
            original {
              url
            }
          }
        }
      }
    }
  }
}`

    const options = getOptions(query)
    const response = await makeRequest(this.METHOD, this.BASE_URL, headers, options)

    console.log(response)
  }
}
