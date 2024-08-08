export const ViewerList = `
query ($userId: Int, $status: MediaListStatus ,$type: MediaType) {
    MediaListCollection(userId: $userId, type: $type, status: $status, sort: UPDATED_TIME_DESC) {
      user {
        name
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
            id
            idMal
            type
            title {
              romaji
              english
              native
              userPreferred
            }
            format
            status
            volumes
            chapters
            episodes
            duration
            coverImage {
              large
              extraLarge
              color
            }
            bannerImage
            averageScore
            meanScore
            isAdult
            countryOfOrigin
            mediaListEntry {
              id
              mediaId
              status
              score(format: POINT_10)
              progress
            }
          }
        }
      }
    }
  }
`
