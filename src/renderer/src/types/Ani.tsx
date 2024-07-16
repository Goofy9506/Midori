export type AniZipType = {
  titles: {
    'x-jat': string
    zh_Hans: string
    ja: string
    en: string
  }
  episodes: {
    [key: string]: {
      tvdbShowId: number
      tvdbId: number
      seasonNumber: number
      episodeNumber: number
      absoluteEpisodeNumber: number
      title: {
        ja: string
        en: string
        'x-jat': string
      }
      airDate: string
      airDateUtc: string
      runtime: number
      overview: string
      image: string
      episode: string
      anidbEid: number
      length: number
      airdate: string
      rating: string
    }
  }
  episodeCount: number
  specialCount: number
  images: {
    coverType: string
    url: string
  }[]
  mappings: {
    animeplanet_id: string
    kitsu_id: number
    mal_id: number
    type: string
    anilist_id: number
    anisearch_id: number
    anidb_id: number
    notifymoe_id: string
    livechart_id: number
    thetvdb_id: number
    imdb_id: null
    themoviedb_id: string
  }
}

export const SkipType = ['op', 'ed', 'recap', 'mixed-op', 'mixed-ed']

export type AniSkipType = (typeof SkipType)[number]

export type AniSkipTime = {
  skipType: AniSkipType
  interval: {
    startTime: number
    endTime: number
  }
  episodeLength: number
  skipId: number
}
