export const DetailedMedia = `
  query ($id: Int, $type: MediaType) {
    Media(id: $id, type: $type) {
      id
      type
      idMal
      season
      status
      genres
      source
      isAdult
      volumes
      episodes
      duration
      chapters
      synonyms
      meanScore
      seasonYear
      description
      bannerImage
      averageScore
      countryOfOrigin
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
      title {
        romaji
        english
        native
      }
      coverImage {
        large
        extraLarge
        color
      }
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
    }
  }
`
