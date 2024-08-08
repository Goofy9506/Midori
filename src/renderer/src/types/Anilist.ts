export type MediaCountry = 'JP' | 'KR'
export type MediaType = 'ANIME' | 'MANGA'
export type MediaListStatus = 'CURRENT' | 'PLANNING' | 'COMPLETED' | 'DROPPED' | 'PAUSED'
export type MediaStatus =
  | 'FINISHED'
  | 'RELEASING'
  | 'NOT_YET_RELEASED'
  | 'CANCELLED'
  | 'HIATUS'
  | ''
export type MediaFormat =
  | 'TV'
  | 'TV_SHORT'
  | 'MOVIE'
  | 'SPECIAL'
  | 'OVA'
  | 'ONA'
  | 'MUSIC'
  | 'MANGA'
  | 'NOVEL'
  | 'ONE_SHOT'
  | ''
export type MediaRelation =
  | 'ADAPTATION'
  | 'PREQUEL'
  | 'SEQUEL'
  | 'PARENT'
  | 'SIDE_STORY'
  | 'CHARACTER'
  | 'SUMMARY'
  | 'ALTERNATIVE'
  | 'SOURCE'
export type MediaCoverImage = {
  extraLarge: string
  large: string
  medium: string
  color: string
}
export type MediaConnections = {
  edges: MediaEdge[]
  nodes: Media[]
  pageInfo: PageInfo
}
export type PageInfo = {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  hasNextPage: boolean
}
export type MediaEdge = {
  id: number
  relationType: MediaRelation
  isMainStudio: boolean
}
export type MediaTitle = {
  romaji: string
  english: string
}
export type AiringScheduleConnection = {
  edges: AiringScheduleEdge[]
  nodes: AiringSchedule[]
  pageInfo: PageInfo
}
export type AiringScheduleEdge = {
  id: number
  node: AiringSchedule
}
export type AiringSchedule = {
  id: number
  airingAt: number
  timeUntilAiring: number
  episode: number
  mediaId: number
  media: Media
}
export type MediaList = {
  id: number
  status: MediaListStatus
  score: number
  progress: number
  progressVolumes: number
  repeat: number
  priority: number
  private: boolean
  hiddenFromStatusLists: boolean
  media: Media
  advancedScores: number[]
}
export type Media = {
  id: number
  idMal: number
  title: MediaTitle
  type: MediaType
  format: MediaFormat
  status: MediaStatus
  description: string
  seasonYear: number
  episodes: number
  duration: number
  chapters: number
  volumes: number
  countryOfOrigin: MediaCountry
  coverImage: MediaCoverImage
  bannerImage: string
  genres: string[]
  synonyms: string[]
  averageScore: number
  meanScore: number
  relations: MediaConnections
  isAdult: boolean
  airingSchedules: AiringScheduleConnection
  nextAiringEpisode: AiringSchedule
  mediaListEntry: MediaList
  progress: string
}
export type ViewerID = {
  id: number
}
