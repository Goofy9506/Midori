import { CheerioAPI, load } from 'cheerio'
import MegaCloud from '../media/MegaCloud'
import axios from 'axios'

export default class Zoro {
  private PREF_DOMAIN_DEFAULT = 'https://hianime.to'
  private baseUrl = this.PREF_DOMAIN_DEFAULT
  private AXIOS_DEFAULT = axios.create({
    baseURL: this.baseUrl,
    method: 'GET',
    timeout: 10000
  })

  public search = (name: string, page: number = 1) => {
    if (0 >= page) {
      page = 1
    }
    return this.scrapeCardPage(`/search?keyword=${decodeURIComponent(name)}&page=${page}`)
  }

  public fetchAnimeInfo = async (id: string): Promise<any> => {
    try {
      const info: any = {
        id: id,
        title: ''
      }

      const { data } = await this.AXIOS_DEFAULT({ url: `/watch/${id}` })
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

      const episodesAjax = await this.AXIOS_DEFAULT({
        url: `/ajax/v2/episode/list/${id.split('-').pop()}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

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
    const subOrDub: 'sub' | 'dub' = epUrl.endsWith('$dub') ? 'dub' : 'sub'
    const newUrl = `${this.baseUrl}/watch/${epUrl.replace('$episode$', '?ep=').replace(/\$both|\$sub|\$dub/gi, '')}`

    const { data } = await this.AXIOS_DEFAULT({
      url: `/ajax/v2/episode/servers?episodeId=${newUrl.split('?ep=')[1]}`
    })

    const $ = load(data.html)

    let server

    switch (serverUrl) {
      case 'vidcloud':
        server =
          this.retrieveServerId($, 1, subOrDub) ??
          (() => {
            throw new Error('VidCloud not found')
          })()
        break
      case 'vidstreaming':
        server = this.retrieveServerId($, 4, subOrDub)
        break
    }

    const serverId = server.id
    const language = server.language

    const {
      data: { link }
    } = await this.AXIOS_DEFAULT({
      url: `/ajax/v2/episode/sources?id=${serverId}`
    })

    return await { url: this.videoSourceRequest(serverUrl, new URL(link)), language }
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
    const getServerItem = (section: string) =>
      $(`.ps_-block.ps_-block-sub.servers-${section} > .ps__-list .server-item`)
        .filter((_: any, el: any) => $(el).attr('data-server-id') == `${index}`)
        .first()

    let language = subOrDub
    let serverItem = getServerItem(subOrDub)
    if (!serverItem.attr('data-id') && subOrDub === 'dub') {
      serverItem = getServerItem('sub')
      language = 'sub'
    }
    if (!serverItem.attr('data-id')) {
      serverItem = getServerItem('raw')
      language = 'sub'
    }

    if (serverItem.attr('data-id')) {
      return { id: serverItem.attr('data-id')!, language }
    } else {
      throw new Error('Server item with specified data-server-id not found')
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
    if (!url.startsWith('/') || !url.startsWith('/search')) {
      throw new Error('Invalid URL format')
    }

    const res: any = {
      currentPage: 0,
      hasNextPage: false,
      totalPages: 0,
      results: []
    }
    try {
      const { data } = await this.AXIOS_DEFAULT({
        url: url
      })
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
    const results: any[] = $('.flw-item')
      .map((_i, ele) => this.parseCard($, $(ele)))
      .get()
    return results
  }
}
