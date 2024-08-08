export const Search = `
  query ($type: MediaType, $search: String, $sort: [MediaSort], $genres: [String], $tags: [String], $status: MediaStatus, $format: MediaFormat, $countryOfOrigin: CountryCode, $excludeGenres: [String], $excludeTags: [String], $startYear: FuzzyDateInt, $seasonYear: Int, $season: MediaSeason, $id: Int) {
    Page(page: 1, perPage: 50) {
      media(id: $id, type: $type, search: $search, sort: $sort, status: $status, format: $format, countryOfOrigin: $countryOfOrigin, genre_in: $genres, genre_not_in: $excludeGenres, tag_in: $tags, tag_not_in: $excludeTags, startDate: $startYear, seasonYear: $seasonYear, season: $season) {
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
