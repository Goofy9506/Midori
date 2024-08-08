export const AiringMedia = `
  query ($date: Int) {
    Page(page: 1, perPage: 25) {
      pageInfo {
        hasNextPage
        total
      }
      airingSchedules(airingAt_greater: 0, airingAt_lesser: $date, sort: TIME_DESC) {
        episode
        airingAt
        media {
          id
          idMal
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
  }
`
