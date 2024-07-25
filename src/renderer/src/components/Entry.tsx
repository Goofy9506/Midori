import { A } from '@solidjs/router'
import { RiMediaPlayFill } from 'solid-icons/ri'
import { Show, type Component } from 'solid-js'

interface Props {
  media: any
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

// eslint-disable-next-line solid/no-destructure
const Entry: Component<Props> = ({ media }) => {
  return (
    <>
      <Show when={media}>
        {media.media ? (
          <A href={`/info/${media?.media?.id}`}>
            <div class={`entry ${media ? '' : 'skeleton'}`}>
              <div class="cover" style={{ 'background-color': 'transparent' }}>
                <RiMediaPlayFill class="play-icon" />
                <div class="transition-cover" />
                <img src={media?.media?.coverImage?.large} alt="cover" />
                <div class={`status ${media?.media?.status}`}>
                  {statusToTest(media?.media?.status)}
                </div>
              </div>
              <div class="content">
                <h2 class="title">{media?.media?.title?.english || media?.media?.title?.romaji}</h2>
                <div class="other-info">
                  {media && media?.media?.type === 'ANIME' ? (
                    <div class="episodes">
                      {media && `${media.progress || '~'} | ${media.media.episodes || '~'}`}
                    </div>
                  ) : (
                    <div class="episodes">
                      {media && `${media?.progress || '~'} | ${media?.media?.chapters || '~'}`}
                    </div>
                  )}
                  <div class="rating">
                    {media && media?.media?.meanScore === 0
                      ? `0 / 10`
                      : `${(media.media.meanScore as number) / 10} / 10`}
                  </div>
                </div>
              </div>
            </div>
          </A>
        ) : (
          <A href={`/info/${media?.id}`}>
            <div class={`entry ${media ? '' : 'skeleton'}`}>
              <div class="cover" style={{ 'background-color': 'transparent' }}>
                <RiMediaPlayFill class="play-icon" />
                <div class="transition-cover" />
                <img src={media?.coverImage?.large} alt="cover" />
                <div class={`status ${media?.status}`}>{statusToTest(media?.status)}</div>
              </div>
              <div class="content">
                <h2 class="title">{media?.title?.english || media?.title?.romaji}</h2>
                <div class="other-info">
                  {media && media?.type === 'ANIME' ? (
                    <div class="episodes">
                      {media && `${media.progress || '~'} | ${media.episodes || '~'}`}
                    </div>
                  ) : (
                    <div class="episodes">
                      {media && `${media?.progress || '~'} | ${media?.chapters || '~'}`}
                    </div>
                  )}
                  <div class="rating">
                    {media && media?.meanScore === 0
                      ? `0 / 10`
                      : `${(media?.meanScore as number) / 10} / 10`}
                  </div>
                </div>
              </div>
            </div>
          </A>
        )}
      </Show>
    </>
  )
}

export default Entry
