export const Media = `
  query ($sort: [MediaSort], $type: MediaType, $format: MediaFormat, $season: MediaSeason, $seasonYear: Int) {
    Page(page: 1, perPage: 25) {
      pageInfo {
        hasNextPage
        total
      }
      media(sort: $sort, type: $type, format: $format, season: $season, seasonYear: $seasonYear) {
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
      }
    }
  }
`
