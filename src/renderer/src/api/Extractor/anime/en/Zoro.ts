import { CheerioAPI, load } from 'cheerio'
import MegaCloud from '../../media/MegaCloud'
import axios from 'axios'
import Notify from '@renderer/modules/Notify'

export default class Zoro {
  private PREF_DOMAIN_DEFAULT = 'https://hianime.to'

  baseUrl = this.PREF_DOMAIN_DEFAULT
  UserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'

  public search = (name: string, page: number = 1) => {
    if (0 >= page) {
      page = 1
    }
    return this.scrapeCardPage(
      `${this.baseUrl}/search?keyword=${decodeURIComponent(name)}&page=${page}`
    )
  }

  public fetchAnimeInfo = async (id: string): Promise<any> => {
    try {
      const info: any = {
        id: id,
        title: ''
      }

      const { data } = await axios.get(`${this.baseUrl}/watch/${id}`)
      const $ = load(data)

      const { mal_id, anilist_id } = JSON.parse($('#syncData').text())
      info.malID = Number(mal_id)
      info.alID = Number(anilist_id)
      info.title = $('h2.film-name > a.text-white').text()
      info.japaneseTitle = $('div.anisc-info div:nth-child(2) span.name').text()
      info.image = $('img.film-poster-img').attr('src')
      info.description = $('div.film-description').text().trim()
      // Movie, TV, OVA, ONA, Special, Music
      info.type = $('span.item').last().prev().prev().text().toUpperCase()
      info.url = `${this.baseUrl}/${id}`
      info.recommendations = await this.scrapeCard($)

      const parseRelatedAnime = (card) => {
        const aTag = card.find('.film-name a')
        const id = aTag.attr('href')?.split('/')[1].split('?')[0]
        return {
          id: id!,
          title: aTag.text(),
          url: `${this.baseUrl}${aTag.attr('href')}`,
          image: card.find('img')?.attr('data-src'),
          japaneseTitle: aTag.attr('data-jname'),
          type: card.find('.tick').contents().last()?.text()?.trim(),
          sub: parseInt(card.find('.tick-item.tick-sub')?.text()) || 0,
          dub: parseInt(card.find('.tick-item.tick-dub')?.text()) || 0,
          episodes: parseInt(card.find('.tick-item.tick-eps')?.text()) || 0
        }
      }

      info.relatedAnime = []
      $('#main-sidebar section:nth-child(1) div.anif-block-ul li').each((_i, ele) => {
        const card = $(ele)
        info.relatedAnime.push(parseRelatedAnime(card))
      })
      const hasSub: boolean = $('div.film-stats div.tick div.tick-item.tick-sub').length > 0
      const hasDub: boolean = $('div.film-stats div.tick div.tick-item.tick-dub').length > 0

      if (hasSub) {
        info.subOrDub = 'sub'
        info.hasSub = hasSub
      }
      if (hasDub) {
        info.subOrDub = 'dub'
        info.hasDub = hasDub
      }
      if (hasSub && hasDub) {
        info.subOrDub = 'both'
      }

      const episodesAjax = await axios.get(
        `${this.baseUrl}/ajax/v2/episode/list/${id.split('-').pop()}`,
        {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      )

      const $$ = load(episodesAjax.data.html)

      info.totalEpisodes = $$('div.detail-infor-content > div > a').length
      info.episodes = []
      $$('div.detail-infor-content > div > a').each((_i, el) => {
        const episodeId = $$(el)
          .attr('href')
          ?.split('/')[2]
          ?.replace('?ep=', '$episode$')
          ?.concat(`$${info.subOrDub}`)
        const number = parseInt($$(el).attr('data-number')!)
        const title = $$(el).attr('title')
        const url = this.baseUrl + $$(el).attr('href')
        const isFiller = $$(el).hasClass('ssl-item-filler')

        info.episodes?.push({
          id: episodeId,
          number: number,
          title: title,
          isFiller: isFiller,
          url: url
        })
      })

      return info
    } catch (error) {
      console.error(`Error in fetchAnimeInfo: ${error}`)
      // Handle the error appropriately
    }
  }

  public videoSourceList = async (epUrl: string, serverUrl: string = 'vidstreaming') => {
    const subOrDub: 'sub' | 'dub' = epUrl.split('$')?.pop() === 'dub' ? 'dub' : 'sub'
    epUrl = `${this.baseUrl}/watch/${epUrl
      .replace('$episode$', '?ep=')
      .replace(/\$auto|\$sub|\$dub/gi, '')}`

    const { data } = await axios.get(
      `${this.baseUrl}/ajax/v2/episode/servers?episodeId=${epUrl.split('?ep=')[1]}`
    )

    const $ = load(data.html)

    let serverId = ''

    switch (serverUrl) {
      case 'vidcloud':
        serverId = this.retrieveServerId($, 1, subOrDub)
        if (!serverId) throw new Error('RapidCloud not found')
        break
      case 'vidstreaming':
        serverId = this.retrieveServerId($, 4, subOrDub)
        if (!serverId) {
          new Notify().Alert('Video source was not found, trying Gogo source instead...')
          return undefined
          // throw new Error('Vidstreaming not found')
        }
        break
    }

    const {
      data: { link }
    } = await axios.get(`${this.baseUrl}/ajax/v2/episode/sources?id=${serverId}`)

    return await this.videoSourceRequest(serverUrl, new URL(link))
  }

  private videoSourceRequest = async (serverName: string = 'vidstreaming', serverUrl: URL) => {
    switch (serverName) {
      case 'vidstreaming':
      case 'vidcloud':
      default:
        return {
          ...(await new MegaCloud().videosFromUrl(serverUrl))
        }
    }
  }

  private retrieveServerId = ($: any, index: number, subOrDub: 'sub' | 'dub') => {
    const serverItem = $(`.ps_-block.ps_-block-sub.servers-${subOrDub} > .ps__-list .server-item`)
      .filter((_, el) => $(el).attr('data-server-id') == `${index}`)
      .first()
    if (subOrDub === 'sub' && serverItem.length === 0) {
      const serverItem = $(`.ps_-block.ps_-block-sub.servers-raw > .ps__-list .server-item`)
        .filter((_, el) => $(el).attr('data-server-id') == `${index}`)
        .first()
      return serverItem.attr('data-id')!
    } else {
      if (!serverItem) {
        throw new Error('Server item with specified data-server-id not found')
      }
      return serverItem.attr('data-id')!
    }
  }

  private parsePagination = ($: CheerioAPI) => {
    const pagination = $('ul.pagination')
    const currentPage = parseInt(pagination.find('.page-item.active')?.text())
    const nextPage = pagination.find('a[title=Next]')?.attr('href')
    const totalPages = pagination.find('a[title=Last]').attr('href')?.split('=').pop()

    return {
      currentPage: currentPage,
      hasNextPage: nextPage !== undefined && nextPage !== '',
      totalPages: totalPages === undefined || totalPages === '' ? currentPage : parseInt(totalPages)
    }
  }

  private scrapeCardPage = async (url: string): Promise<any> => {
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      throw new Error('Invalid URL format')
    }

    const res: any = {
      currentPage: 0,
      hasNextPage: false,
      totalPages: 0,
      results: []
    }
    try {
      const { data } = await axios.get(url)
      const $ = load(data)

      const { currentPage, hasNextPage, totalPages } = this.parsePagination($)
      res.currentPage = currentPage
      res.hasNextPage = hasNextPage
      res.totalPages = totalPages

      res.results = await this.scrapeCard($)
      if (res.results.length === 0) {
        res.currentPage = 0
        res.hasNextPage = false
        res.totalPages = 0
      }
      return res
    } catch (error) {
      console.error(`Error in scrapeCardPage: ${error}`)
    }
  }

  private parseCard = (_$: CheerioAPI, card: any): any => {
    try {
      const atag = card.find('.film-name a')
      const id = atag.attr('href')?.split('/')[1].split('?')[0]
      const type = card
        .find('.fdi-item')
        ?.first()
        ?.text()
        .replace(' (? eps)', '')
        .replace(/\s\(\d+ eps\)/g, '')
      return {
        id: id!,
        title: atag.text(),
        url: `${this.baseUrl}${atag.attr('href')}`,
        image: card.find('img')?.attr('data-src'),
        duration: card.find('.fdi-duration')?.text(),
        japaneseTitle: atag.attr('data-jname'),
        type: type,
        nsfw: card.find('.tick-rate')?.text() === '18+' ? true : false,
        sub: Number(card.find('.tick-item.tick-sub')?.text()) || 0,
        dub: parseInt(card.find('.tick-item.tick-dub')?.text()) || 0,
        episodes: parseInt(card.find('.tick-item.tick-eps')?.text()) || 0
      }
    } catch (error) {
      console.error(`Error in parseCard: ${error}`)
    }
  }

  private scrapeCard = async ($: CheerioAPI): Promise<any[]> => {
    const results: any[] = []
    $('.flw-item').each((_i, ele) => {
      const card = $(ele)
      results.push(this.parseCard($, card))
    })
    return results
  }
}
