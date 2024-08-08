export type Episode = {
  number: string
  link?: string | null
  title?: string | null
  desc?: string | null
  thumb?: string
  filler: boolean | null
  maxLength?: number | null
}

export type Studio = {
  id: string
  name: string
}

export type Anime = {
  id: number
  idMal: number

  name: string
  nameRomaji: string

  cover: string
  banner: string

  totalEpisodes: number
  currentEpisodes: number
  episodeDuration: number
  season: string
  seasonYear: number
  isAdult: boolean
  userProgress: number
  userStatus: string
  userScore: number
  status: string
  format: string
  // source: Anime
  countryOfOrigin: string
  meanScore: number
  genres: string[]
  description: string
  synonyms: string[]

  timeTilAiring: Date

  nextAiringEpisode: number
  nextAiringEpisodeTime: string

  relations: Relation[]
  episodes: Episode[]
  fillerEpisodes: Episode[]
}

export type Media = {
  anime: Anime

  id: number
  idMal: number | undefined
  idKitsu: number

  name: string
  nameRomaji: string

  cover: {
    extraLarge: string
    large: string
  }

  banner?: string

  isAdult: boolean

  userProgress: number
  userStatus: string
  userScore: number

  status: string
  format: string
  source: string
  countryOfOrigin: string
  meanScore: number
  genres: string[]
  tags: string[]
  description: string
  synonyms: string[]
  trailer: string
  startDate: Date
  endDate: Date
  popularity: number

  timeTilAiring: Date

  // characters: Character[]
  // staff: Staff[]
  // prequel: Media
  // sequel: Media
  relations: Relation[]

  // constructor(anime: Anime, id: number, idMal: number, idKitsu: number) {
  //   this.anime = anime
  //   this.id = id
  //   this.idMal = idMal
  //   this.idKitsu = idKitsu
  //   this.name = ''
  //   this.nameRomaji = ''
  //   this.banner = ''
  //   this.isAdult = false
  //   this.userProgress = 0
  //   this.userStatus = ''
  //   this.userScore = 0
  //   this.status = ''
  //   this.format = ''
  //   this.source = ''
  //   this.countryOfOrigin = ''
  //   this.meanScore = 0
  //   this.genres = []
  //   this.tags = []
  //   this.description = ''
  //   this.synonyms = []
  //   this.trailer = ''
  //   this.startDate = new Date()
  //   this.endDate = new Date()
  //   this.popularity = 0
  //   this.timeTilAiring = new Date()
  //   // this.characters = []
  //   // this.staff = []
  //   // this.prequel = null
  //   // this.sequel = null
  //   this.relations = []
  // }
}

export type Relation = {
  id: number
  idMal: number
  format: string
  name: string
  status: string
  episodes: number
  chapters: number
  cover: string
  startDate: Date
  type: string
  relation: string
  meanScore: number
}
