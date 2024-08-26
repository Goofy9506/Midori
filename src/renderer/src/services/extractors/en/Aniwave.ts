import axios from 'axios'
import { load } from 'cheerio'
import GogoCDN from '../media/GogoCDN'

export default class Aniwave {
  private PREF_DOMAIN_DEFAULT = 'https://aniwave.to'
  private baseUrl = this.PREF_DOMAIN_DEFAULT
  private AXIOS_DEFAULT = axios.create({
    baseURL: this.baseUrl,
    method: 'GET',
    timeout: 10000
  })

  /**
   * Performs an asynchronous search name on the GogoAnime website.
   * @param name - The search term.
   * @param page - The page number (default is 1).
   * @returns A promise that resolves to an object containing search results.
   */
  public search = async (name: string, page: number = 1) => {
    try {
      const searchResult: any = {
        currentPage: page,
        hasNextPage: false,
        results: []
      }

      const response = await this.AXIOS_DEFAULT({
        url: `/filter?keyword=${encodeURIComponent(name)}`
      })

      const $ = load(response.data)

      $('div#list-items > div.item').each((_i, el) => {
        const id = $(el).find('a.name').attr('href')?.split('/')[2]
        const url = $(el).find('a.name').attr('href')
        const title = $(el).find('a.name').text()
        searchResult.results.push({ id, title, url })
      })

      return searchResult
    } catch (err) {
      throw new Error((err as Error).message)
    }
  }

  /**
   * Fetches the available video servers for a given episode URL from the GogoAnime website.
   * Extracts server names and their corresponding video URLs from the HTML response.
   * @param epUrl - The episode URL.
   * @returns An array of objects, each with `name` and `url` properties representing the video servers.
   */
  public async videoServerRequest(epUrl: string, ep: string) {
    // Ensure the URL is complete
    // if (!epUrl.startsWith(this.baseUrl)) {
    //   epUrl = `${this.baseUrl}${epUrl}`
    // }

    const idFetch = await this.AXIOS_DEFAULT({
      url: epUrl
    })

    const w$ = load(idFetch.data)
    const id = w$('div[data-id]').attr('data-id')
    const vrf = this.vrfEncrypt(id as string)

    const {
      data: { result }
    } = await this.AXIOS_DEFAULT({
      url: `/ajax/episode/list/${id}?vrf=${encodeURIComponent(vrf)}`
    })

    const epIds = {
      sub: '',
      dub: '',
      sub_s: ''
    }

    const e$ = load(result)
    e$('div.episodes > ul > li').each((_i, el) => {
      if (e$(el).find('a').attr('data-num') === ep) {
        const eps = e$(el).find('a').attr('data-ids')?.split(',') as string[]
        const typeDub = e$(el).find('a').attr('data-dub')
        const typeSub = e$(el).find('a').attr('data-sub')
        const isTypeSub = Number(typeSub) === 1
        const isTypeDub = Number(typeDub) === 1

        if (isTypeSub && eps.length === 2) {
          epIds.sub = eps[0]
          epIds.sub_s = eps[1]
        }

        if (isTypeSub && eps.length === 1) {
          epIds.sub = eps[0]
        }

        if (isTypeDub && eps.length === 3) {
          epIds.sub = eps[0]
          epIds.sub_s = eps[1]
          epIds.dub = eps[2]
        }

        if (isTypeSub && isTypeDub && eps.length === 2) {
          epIds.sub = eps[0]
          epIds.dub = eps[1]
        }
      }
    })

    // Fetch HTML content
    const fetchServersList = await this.AXIOS_DEFAULT({
      url: `/ajax/server/list/${epIds.sub}?vrf=${encodeURIComponent(this.vrfEncrypt(epIds.sub))}`
    })
    const $ = load(fetchServersList.data.result)
    const servers: { name: string; url: string }[] = []

    // Extract server information
    $('div.servers > div.type').each((_i, el) => {
      if ($(el).attr('data-type')?.toLocaleLowerCase() === 'sub') {
        $(`ul > li`).each((_i, el) => {
          const serverName = $(el).text().toLocaleLowerCase()
          const serverUrl = $(el).attr('data-link-id')
          servers.push({
            name: serverName,
            url: serverUrl || ''
          })
        })
      }
    })

    return servers
  }

  /**
   * Fetches the video source URL for a given episode URL from the GogoAnime website.
   * Supports multiple video servers and returns the video source URL based on the specified server.
   * @param epUrl The URL of the episode.
   * @param server The name of the server to fetch the video source from (default is 'vidstreaming').
   * @returns A promise that resolves to the video source URL for the specified server.
   */
  public async videoSourceList(epUrl: string, server: string = 'vidstreaming') {
    const response = await this.AXIOS_DEFAULT({
      url: `/ajax/server/${epUrl}?vrf=${encodeURIComponent(this.vrfEncrypt(epUrl))}`
    })

    // const id = this.vrfDecrypt(this.vrfEncrypt(epUrl))

    // console.log(id)

    // const url = await this.AXIOS_DEFAULT({
    //   url: `/ajax/episode/sources/${id}?vrf=${encodeURIComponent(vrf)}`
    // })

    // console.log(url.data)

    const embedLink = this.vrfDecrypt(response.data.result.url)

    console.log(embedLink)
  }

  private rc4Encrypt(id: string, key: string): string {
    const s: number[] = Array.from({ length: 256 }, (_, i) => i)
    let x: number,
      j = 0,
      res = ''

    for (let i = 0; i < 256; i++) {
      j = (j + s[i] + key.charCodeAt(i % key.length)) % 256
      x = s[i]
      s[i] = s[j]
      s[j] = x
    }

    let i = 0
    j = 0

    for (let y = 0; y < id.length; y++) {
      i = (i + 1) % 256
      j = (j + s[i]) % 256
      x = s[i]
      s[i] = s[j]
      s[j] = x
      res += String.fromCharCode(id.charCodeAt(y) ^ s[(s[i] + s[j]) % 256])
    }

    return res
  }

  private safeBtoa(text: string) {
    return btoa(text).replace(/\//g, '_').replace(/\+/g, '-')
  }

  private safeAtob(text: string) {
    return atob(text.replace(/_/g, '/').replace(/-/g, '+'))
  }

  private vrfEncrypt(id: string) {
    let t: string = id
    t = encodeURIComponent(''.concat(t))
    t = this.rc4Encrypt(t, 'T78s2WjTc7hSIZZR')
    t = this.safeBtoa(t)
    return t
  }

  private vrfDecrypt(id: string) {
    let vrf = this.safeAtob(id)
    vrf = this.rc4Encrypt('ctpAbOz5u7S6OMkx', vrf)
    return decodeURIComponent(vrf)
  }
}

export type ServerData = {
  type: string
  id: string
  name: string
}
