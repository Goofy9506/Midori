import { Anime, Relation } from '@renderer/types/Media'
import { QLoader } from '../QLoader'

export class ALoader {
  private ANIME: any = {
    id: 0,
    idMal: 0,
    name: '',
    nameRomaji: '',
    cover: '',
    banner: '',
    isAdult: false,
    userProgress: 0,
    userStatus: '',
    userScore: 0,
    status: '',
    format: '',
    // source: {},
    relations: [],
    countryOfOrigin: '',
    meanScore: 0,
    genres: [],
    description: '',
    synonyms: [],
    timeTilAiring: new Date(),
    totalEpisodes: 0,
    currentEpisodes: 0,
    episodeDuration: 0,
    season: 'SPRING',
    seasonYear: 0,
    episodes: [],
    fillerEpisodes: []
  }

  public getDetailedInfo = async (anilistId: any, malId: number): Promise<Anime> => {
    const QLoad = new QLoader()
    const response = await QLoad.getMedia(anilistId, 'ANIME')
    const episodes = await QLoad.getEpisodes(anilistId)
    const filler = await QLoad.getFiller(malId)
    const relations = await this.getRelations(anilistId)
    const {
      id,
      idMal,
      title: { english, romaji },
      coverImage: { large, extraLarge },
      bannerImage,
      isAdult,
      status,
      format,
      source,
      countryOfOrigin,
      meanScore,
      genres,
      description,
      synonyms,
      episodes: totalEpisodes,
      duration: episodeDuration,
      season,
      seasonYear,
      mediaListEntry,
      nextAiringEpisode
    } = response

    this.ANIME.id = id
    this.ANIME.idMal = idMal
    this.ANIME.name = english
    this.ANIME.nameRomaji = romaji
    this.ANIME.cover = large ?? extraLarge
    this.ANIME.banner = bannerImage
    this.ANIME.isAdult = isAdult
    this.ANIME.status = status
    this.ANIME.format = format
    this.ANIME.source = source
    this.ANIME.countryOfOrigin = countryOfOrigin
    this.ANIME.meanScore = meanScore
    this.ANIME.genres = genres
    this.ANIME.description = description
    this.ANIME.synonyms = synonyms
    this.ANIME.totalEpisodes = totalEpisodes
    this.ANIME.episodeDuration = episodeDuration
    this.ANIME.season = season
    this.ANIME.seasonYear = seasonYear
    this.ANIME.episodes = episodes
    this.ANIME.fillerEpisodes = filler
    this.ANIME.relations = relations

    if (mediaListEntry) {
      this.ANIME.userProgress = mediaListEntry.progress
      this.ANIME.userStatus = mediaListEntry.status
      this.ANIME.userScore = mediaListEntry.score
    }

    if (nextAiringEpisode) {
      this.ANIME.timeTilAiring = nextAiringEpisode.timeUntilAiring
      this.ANIME.nextAiringEpisode = nextAiringEpisode.episode
      this.ANIME.nextAiringEpisodeTime = nextAiringEpisode.timeUntilAiring
      this.ANIME.currentEpisodes =
        nextAiringEpisode.episode - 1 ? nextAiringEpisode.episode - 1 : this.ANIME.totalEpisodes
    }

    return this.ANIME
  }

  public getRelations = async (id: number): Promise<Relation[]> => {
    let relations: Relation[] = []
    const response = await new QLoader().getRelations(id)

    if (!response.edges) return relations

    response.edges?.forEach((edge: any) => {
      const relation: Relation = {
        id: edge.node.id,
        idMal: edge.node.idMal,
        format: edge.node.format,
        name: edge.node.title.english || edge.node.title.romaji,
        status: edge.node.status,
        episodes: edge.node.episodes,
        chapters: edge.node.chapters,
        cover: edge.node.coverImage.large || edge.node.coverImage.extraLarge,
        startDate: edge.node.startDate,
        type: edge.node.type,
        relation: edge.relationType,
        meanScore: edge.node.meanScore
      }

      relations.push(relation)
    })

    relations.sort((a, b) => a.relation.localeCompare(b.relation))
    const prequelsAndSequels = relations.filter(
      (entry) => entry.relation === 'PREQUEL' || entry.relation === 'SEQUEL'
    )
    relations = prequelsAndSequels.concat(
      relations.filter((entry) => entry.relation !== 'PREQUEL' && entry.relation !== 'SEQUEL')
    )

    return relations
  }

  public returnMedia = (data: any, type: string) => {
    const media = {
      id: '',
      idMal: 0,
      name: '',
      nameRomaji: '',
      cover: '',
      banner: '',
      type: '',
      isAdult: false,
      userProgress: undefined,
      userScore: undefined,
      status: '',
      format: '',
      countryOfOrigin: '',
      meanScore: 0,
      totalEpisodes: 0
    }

    switch (type) {
      case 'SINGULAR':
        Object.assign(media, {
          id: data.id,
          idMal: data.idMal,
          name: data.title.english ?? data.title.romaji,
          nameRomaji: data.title.romaji,
          cover: data.coverImage.large ?? data.coverImage.extraLarge,
          banner: data.bannerImage,
          type: data.type,
          isAdult: data.isAdult,
          status: data.status,
          format: data.format,
          countryOfOrigin: data.countryOfOrigin,
          meanScore: data.meanScore,
          totalEpisodes: data.episodes
        })
        break
      case 'DOUBLE':
        Object.assign(media, {
          id: data.media.id,
          idMal: data.media.idMal,
          name: data.media.title.english ?? data.media.title.romaji,
          nameRomaji: data.media.title.romaji,
          cover: data.media.coverImage.large ?? data.media.coverImage.extraLarge,
          banner: data.media.bannerImage,
          type: data.media.type,
          isAdult: data.media.isAdult,
          status: data.media.status,
          format: data.media.format,
          userProgress: data.progress,
          userScore: data.score,
          countryOfOrigin: data.media.countryOfOrigin,
          meanScore: data.media.meanScore,
          totalEpisodes: data.media.episodes
        })
        break
    }

    return media
  }
}
