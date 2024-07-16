import axios from 'axios'
import { load } from 'cheerio'
import GogoCDN from '../../media/GogoCDN'

export default class GogoAnime {
  private PREF_DOMAIN_DEFAULT = 'https://anitaku.to'
  private AJAX_URL = 'https://ajax.gogocdn.net/ajax'

  baseUrl = this.PREF_DOMAIN_DEFAULT
  UserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'

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

      const response = await axios.get(
        `${this.baseUrl}/filter.html?keyword=${encodeURIComponent(name)}&page=${page}`
      )
      const $ = load(response.data)

      searchResult.hasNextPage =
        $('div.anime_name.new_series > div > div > ul > li.selected').next().length > 0

      $('div.last_episodes > ul > li').each((_i, el) => {
        const id = $(el).find('p.name > a').attr('href')?.split('/')[2]
        const title = $(el).find('p.name > a').text()
        const url = `${this.baseUrl}/${$(el).find('p.name > a').attr('href')}`
        const image = $(el).find('div > a > img').attr('src')
        const releaseDate = $(el).find('p.released').text().trim()
        const subOrDub = $(el).find('p.name > a').text().toLowerCase().includes('dub')
          ? 'dub'
          : 'sub'

        searchResult.results.push({ id, title, url, image, releaseDate, subOrDub })
      })

      return searchResult
    } catch (err) {
      throw new Error((err as Error).message)
    }
  }

  /**
   * Fetches detailed information about an anime from the GogoAnime website.
   * @param id - A string representing the anime's ID or URL.
   * @returns An object containing the anime's details.
   */
  public async animeDetailsRequest(id: string) {
    // Construct URL if necessary
    if (!id.includes('gogoanime')) {
      id = `${this.baseUrl}/category/${id}`
    }

    // Initialize animeInfo object
    const animeInfo: any = {
      id: '',
      title: '',
      url: '',
      totalEpisodes: 0,
      genres: [],
      episodes: []
    }

    // Fetch anime's HTML page
    const response = await axios.get(id)
    const $ = load(response.data)

    // Extract anime details
    animeInfo.id = new URL(id).pathname.split('/')[2]
    animeInfo.title = $(
      'section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > h1'
    )
      .text()
      .trim()
    animeInfo.url = id
    animeInfo.image = $('div.anime_info_body_bg > img').attr('src')
    animeInfo.releaseDate = $('div.anime_info_body_bg > p:nth-child(8)')
      .text()
      .trim()
      .split('Released: ')[1]
    animeInfo.description = $('div.anime_info_body_bg > div:nth-child(6)')
      .text()
      .trim()
      .replace('Plot Summary: ', '')

    // Determine sub or dub
    animeInfo.subOrDub = animeInfo.title.toLowerCase().includes('dub') ? 'dub' : 'sub'

    animeInfo.type = $('div.anime_info_body_bg > p:nth-child(4) > a').text().trim().toUpperCase()

    // Determine status
    const statusText = $('div.anime_info_body_bg > p:nth-child(9) > a').text().trim()
    switch (statusText) {
      case 'Ongoing':
        animeInfo.status = 'Ongoing'
        break
      case 'Completed':
        animeInfo.status = 'Completed'
        break
      case 'Upcoming':
        animeInfo.status = 'Not yet aired'
        break
      default:
        animeInfo.status = 'Unknown'
        break
    }

    animeInfo.otherName = $('div.anime_info_body_bg > p:nth-child(10)')
      .text()
      .replace('Other name: ', '')
      .replace(/;/g, ',')

    // Extract genres
    $('div.anime_info_body_bg > p:nth-child(7) > a').each((_i, el) => {
      animeInfo.genres.push($(el).attr('title')!.toString())
    })

    // Fetch episode list
    const ep_start = $('#episode_page > li').first().find('a').attr('ep_start')
    const ep_end = $('#episode_page > li').last().find('a').attr('ep_end')
    const movie_id = $('#movie_id').attr('value')
    const alias = $('#alias_anime').attr('value')

    const episodeListResponse = await axios.get(
      `${this.AJAX_URL}/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`
    )
    const $$ = load(episodeListResponse.data)

    // Extract episodes
    $$('#episode_related > li').each((_i, el) => {
      animeInfo.episodes.push({
        id: $(el).find('a').attr('href')?.split('/')[1],
        number: parseFloat($(el).find('div.name').text().replace('EP ', '')),
        url: `${this.baseUrl}/${$(el).find('a').attr('href')?.trim()}`
      })
    })
    animeInfo.episodes.reverse()

    animeInfo.totalEpisodes = parseInt(ep_end ?? '0')

    return animeInfo
  }

  /**
   * Fetches the available video servers for a given episode URL from the GogoAnime website.
   * Extracts server names and their corresponding video URLs from the HTML response.
   * @param epUrl - The episode URL.
   * @returns An array of objects, each with `name` and `url` properties representing the video servers.
   */
  public async videoServerRequest(epUrl: string) {
    // Ensure the URL is complete
    if (!epUrl.startsWith(this.baseUrl)) {
      epUrl = `${this.baseUrl}/${epUrl}`
    }

    // Fetch HTML content
    const response = await axios.get(epUrl)
    const $ = load(response.data)
    const servers: { name: string; url: string }[] = []

    // Extract server information
    $('div.anime_video_body > div.anime_muti_link > ul > li').each((_i, el) => {
      let url = $(el).find('a').attr('data-video')
      if (url && !url.startsWith('http')) {
        url = `https:${url}`
      }

      servers.push({
        name: $(el).find('a').text().replace('Choose this server', '').trim(),
        url: url || ''
      })
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
  public async videoSourceList(epUrl: string, server: string = 'vidstreaming'): Promise<any[]> {
    const response = await axios.get(`${this.baseUrl}/${epUrl}`)
    const $ = load(response.data)
    let serverSelector: string

    switch (server) {
      case 'gogocdn':
        serverSelector = '#load_anime > div > div > iframe'
        break
      case 'vidstreaming':
        serverSelector = 'div.anime_video_body > div.anime_muti_link > ul > li.vidcdn > a'
        break
      case 'streamsb':
        serverSelector = 'div.anime_video_body > div.anime_muti_link > ul > li.streamsb > a'
        break
      case 'streamwish':
        serverSelector = 'div.anime_video_body > div.anime_muti_link > ul > li.streamwish > a'
        break
      default:
        serverSelector = '#load_anime > div > div > iframe'
        break
    }

    const serverURL = new URL($(`${serverSelector}`).attr('data-video') || '')

    return await this.videoSourceRequest(server, serverURL)
  }

  private videoSourceRequest(serverName: string, serverUrl: URL) {
    switch (serverName) {
      case 'gogocdn':
        return new GogoCDN().videosFromUrl(serverUrl)
      default:
        return new GogoCDN().videosFromUrl(serverUrl)
    }
  }
}

export type ServerData = {
  type: string
  id: string
  name: string
}
