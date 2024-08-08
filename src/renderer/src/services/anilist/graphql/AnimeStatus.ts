export const AnimeStatus = `
mutation($mediaId: Int, $progress: Int, $scoreRaw: Int, $status: MediaListStatus) {
    SaveMediaListEntry(mediaId: $mediaId, progress: $progress, scoreRaw: $scoreRaw, status: $status) {
        id
    }
}
`
