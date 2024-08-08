import { MediaList } from '@renderer/types/Anilist'
import { A } from '@solidjs/router'
import { RiMediaPlayFill } from 'solid-icons/ri'
import { type Component } from 'solid-js'

interface Props {
  media: MediaList
}

const statusToTest = (status: string) => {
  switch (status) {
    case 'RELEASING':
      return 'Releasing'
    case 'NOT_YET_RELEASED':
      return 'Not Yet Released'
    case 'FINISHED':
      return 'Finished'
    case 'CANCELLED':
      return 'Cancelled'
    case 'HIATUS':
      return 'Hiatus'
    default:
      return 'Unknown'
  }
}

const Entry: Component<Props> = (props) => {
  const renderMediaInfo = (media: any) => {
    const { id, cover, status, name, nameRomaji, type, totalEpisodes, chapters, meanScore, idMal } =
      media
    const progress = media.userProgress || '~'
    return (
      <>
        <A href={`/info/${id}?malId=${idMal}`}>
          <div class={`entry ${media ? '' : 'skeleton'}`}>
            <div class="cover" style={{ 'background-color': 'transparent' }}>
              <RiMediaPlayFill class="play-icon" />
              <div class="transition-cover" />
              <img src={cover} alt="cover" />
              <div class={`status ${status}`}>{statusToTest(status)}</div>
            </div>
            <div class="content">
              <h2 class="title">{name ?? nameRomaji}</h2>
              <div class="other-info">
                <div class="episodes">
                  {type === 'ANIME'
                    ? `${progress} | ${totalEpisodes ?? '~'}`
                    : `${progress} | ${chapters ?? '~'}`}
                </div>
                <div class="rating">{meanScore === 0 ? `0 / 10` : `${meanScore / 10} / 10`}</div>
              </div>
            </div>
          </div>
        </A>
      </>
    )
  }

  return (
    <>
      {props.media ? (
        renderMediaInfo(props.media)
      ) : (
        <div class="skeleton">
          <div class="skeleton-cover" style={{ 'background-color': 'transparent' }} />
        </div>
      )}
    </>
  )
}

export default Entry
