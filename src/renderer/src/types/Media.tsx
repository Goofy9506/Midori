export type Episode = {
  number: string
  link?: string | null
  title?: string | null
  desc?: string | null
  thumb?: string | null
  filler: boolean | null
  maxLength?: number | null
}

export type Studio = {
  id: string
  name: string
}

type Author = {
  id: number
  name: string
  image: string
  role: string
}

export type Anime = {
  totalEpisodes?: number
  episodeDuration?: number
  season?: string
  seasonYear?: string

  op?: string[]
  ed?: string[]

  mainStudio?: Studio
  author?: Author

  youtube?: string
  nextAiringEpisode?: number
  nextAiringEpisodeTime?: string

  selectedEpisode?: string
  episodes?: Episode[]
  kitsuEpisodes?: Episode[]
  fillerEpisodes?: Episode[]

  // constructor(
  //   totalEpisodes?: number,
  //   episodeDuration?: number,
  //   season?: string,
  //   seasonYear?: string,
  //   op?: string[],
  //   ed?: string[],
  //   mainStudio?: Studio,
  //   author?: Author,
  //   youtube?: string,
  //   nextAiringEpisode?: number,
  //   nextAiringEpisodeTime?: string,
  //   selectedEpisode?: string,
  //   episodes?: Episode[],
  //   kitsuEpisodes?: Episode[],
  //   fillerEpisodes?: Episode[]
  // ) {
  //   this.totalEpisodes = totalEpisodes
  //   this.episodeDuration = episodeDuration
  //   this.season = season
  //   this.seasonYear = seasonYear
  //   this.op = op
  //   this.ed = ed
  //   this.mainStudio = mainStudio
  //   this.author = author
  //   this.youtube = youtube
  //   this.nextAiringEpisode = nextAiringEpisode
  //   this.nextAiringEpisodeTime = nextAiringEpisodeTime
  //   this.selectedEpisode = selectedEpisode
  //   this.episodes = episodes
  //   this.kitsuEpisodes = kitsuEpisodes
  //   this.fillerEpisodes = fillerEpisodes
  // }
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
  relations: Media[]

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
