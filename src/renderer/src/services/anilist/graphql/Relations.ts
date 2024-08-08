export const Relations = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      relations {
        edges {
          relationType
          node {
            id
            idMal
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
            type
            meanScore
          }
        }
      }
    }
  }
`
