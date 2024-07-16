import { STORAGE } from '@renderer/utils/Storage'
import axios from 'axios'

const store = await STORAGE.getStore()

const METHOD: string = 'POST'
const GRAPH_QL_URL: string = 'https://graphql.anilist.co'
const KITSU_QL_URL: string = 'https://kitsu.io/api/graphql'
const TOKEN = store.AnilistToken

export const makeRequest = async (
  method: 'GET' | 'POST' | string,
  url: string,
  headers: any = {},
  options: any = {}
) => {
  const response = await axios({
    method: method,
    url: url,
    headers: headers,
    data: options
  })

  return response.data
}

export const getOptions = (query: any = {}, variables: any = {}) => {
  return JSON.stringify({
    query: query,
    variables: variables
  })
}

const MEDIA_DATA: string = `
    id
    title {
      romaji
      english
      native
      userPreferred
    }
    format
    status
    description
    volumes
    chapters
    type
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    season
    seasonYear
    episodes
    duration
    relations {
      edges {
        relationType
        node {
          id
          format
          title {
            english
            romaji
         }
          status
          episodes
          chapters
          coverImage {
            large
            extraLarge
            color
          }
          startDate {
            year
            month
            day
          }
          type
          meanScore
        }
      }
    }
    coverImage {
      large
      extraLarge
      color
    }
    bannerImage
    genres
    synonyms
    averageScore
    meanScore
    popularity
    favourites
    isAdult
    countryOfOrigin
    nextAiringEpisode {
      id
      timeUntilAiring
      episode
    }
    mediaListEntry {
      id
      mediaId
      status
      score(format: POINT_10)
      progress
    }
    siteUrl
    trailer {
      id
      site
      thumbnail
    }
    `

export const getUserId = async () => {
  const headers = {
    Authorization: 'Bearer ' + TOKEN,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }

  const query = `
  query ViewerId {
    Viewer {
      id
    }
  }
`

  const options = getOptions(query)
  const response = await makeRequest(METHOD, GRAPH_QL_URL, headers, options)

  return response.data.Viewer.id
}

export const getUserAvatar = async () => {
  const headers = {
    Authorization: 'Bearer ' + TOKEN,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }

  const query = `
  query ViewerId {
    Viewer {
      avatar {
        large
        medium
      }
    }
  }
`

  const options = getOptions(query)
  const response = await makeRequest(METHOD, GRAPH_QL_URL, headers, options)

  return response.data.Viewer.avatar.large
}

export const getUserLists = async (viewerId: number, typeId: string) => {
  const headers = {
    Authorization: 'Bearer ' + TOKEN,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }

  const query = `
query ($userId: Int, $status: MediaListStatus ,$type: MediaType) {
    MediaListCollection(userId: $userId, type: $type, status: $status, sort: UPDATED_TIME_DESC) {
      user {
        id
        name
        about (asHtml: true)
        createdAt
        avatar {
            large
        }
        statistics {
          anime {
              count
              episodesWatched
              meanScore
              minutesWatched
          }
          manga {
              count
              meanScore
              chaptersRead
              volumesRead
          }
        }
        bannerImage
        mediaListOptions {
          animeList {
              sectionOrder
          }
          mangaList {
              sectionOrder
          }
        }
      }
      lists {
        status
        name
        entries {
          id
          mediaId
          status
          progress
          score
          media {
            ${MEDIA_DATA}
          }
        }
      }
    }
  }
`

  const variables = {
    userId: viewerId,
    type: typeId
  }

  const options = getOptions(query, variables)
  const response = await makeRequest(METHOD, GRAPH_QL_URL, headers, options)

  return response.data.MediaListCollection
}

export const getAnime = async (animeId: any) => {
  const headers = {
    Authorization: 'Bearer ' + TOKEN,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }

  const query = `
          query($id: Int) {
              Media(id: $id, type: ANIME) {
                  ${MEDIA_DATA}
              }
          }
`

  const variables = {
    id: animeId
  }

  const options = getOptions(query, variables)
  const response = await makeRequest(METHOD, GRAPH_QL_URL, headers, options)

  return response.data.Media
}

export const getEpisodes = async (animeId: any) => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }

  const query = `
          query ($id: Int) {
              findAnimeById(id: $id) {
                  episodeCount
                  episodes(first: $first) {
                    nodes {
                      number
                      titles {
                        canonical
                      }
                      thumbnail {
                        original {
                          url
                        }
                      }
                    }
                  }
              }
          }
`

  const variables = {
    id: animeId
  }

  const options = getOptions(query, variables)
  const response = await makeRequest(METHOD, KITSU_QL_URL, headers, options)

  return response.data
}

export const setAnimeProgress = async (animeId: any, progress: number) => {
  const headers = {
    Authorization: 'Bearer ' + TOKEN,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }

  const query = `
  mutation($mediaId: Int, $progress: Int) {
      SaveMediaListEntry(mediaId: $mediaId, progress: $progress) {
          id
          progress
      }
  }
`

  const variables = {
    mediaId: animeId,
    progress: progress
  }

  const options = getOptions(query, variables)
  await makeRequest(METHOD, GRAPH_QL_URL, headers, options)
}

export const setAnimeStatus = async (
  animeId: any,
  status: string,
  progress: number,
  rawScore?: number
) => {
  const headers = {
    Authorization: 'Bearer ' + TOKEN,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }

  const query = `
  mutation($mediaId: Int${progress ? ', $progress: Int' : ''}${rawScore ? ', $scoreRaw: Int' : ''}${status ? ', $status: MediaListStatus' : ''}) {
      SaveMediaListEntry(mediaId: $mediaId${progress ? ', progress: $progress' : ''}${rawScore ? ', scoreRaw: $scoreRaw' : ''}${status ? ', status: $status' : ''}) {
          id
      }
  }
`
  const variables = {
    mediaId: animeId,
    status: status,
    progress: progress,
    rawScore: rawScore
  }

  const options = getOptions(query, variables)
  await makeRequest(METHOD, GRAPH_QL_URL, headers, options)
}

//type: string
export const getTrending = async (type: string, season: string, year: number) => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }

  const query = `
  {
      Page(page: 1, perPage: 20) {
          pageInfo {
              total
              currentPage
              hasNextPage
          }
          media(sort: TRENDING_DESC, type: ${type}, season: ${season}, seasonYear: ${year}) {
              ${MEDIA_DATA}
          }
      }
  }
  `

  const options = getOptions(query)
  const response = await makeRequest(METHOD, GRAPH_QL_URL, headers, options)
  return response.data.Page
}

export const getUpdatedAnime = async () => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }

  const query = `
  {
  Page(page: 1, perPage: 50) {
    pageInfo {
      hasNextPage
      total
    }
    airingSchedules(airingAt_greater: 0, airingAt_lesser: ${Math.floor(Date.now() / 1000 - 10000)} sort: TIME_DESC) {
      episode
      airingAt
      media {
        ${MEDIA_DATA}
      }
    }
  }
}
`

  const options = getOptions(query)
  const response = await makeRequest(METHOD, GRAPH_QL_URL, headers, options)
  return response.data.Page.airingSchedules
}
