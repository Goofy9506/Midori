export const AnimeProgress = `
  mutation ($mediaId: Int, $progress: Int) {
      SaveMediaListEntry(mediaId: $mediaId, progress: $progress) {
          id
          progress
      }
  }
`
