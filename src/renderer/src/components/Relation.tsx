import { A } from '@solidjs/router'
import { ipcRenderer } from 'electron'
import { RiMediaPlayFill } from 'solid-icons/ri'
import { Show, type Component } from 'solid-js'

interface Props {
  media: any
}

// eslint-disable-next-line solid/no-destructure
const Relation: Component<Props> = ({ media }) => {
  return (
    <>
      <Show when={media}>
        <A
          href={`/info/${media?.id}`}
          onClick={() => {
            setTimeout(() => {
              ipcRenderer.send('reload')
            }, 400)
          }}
        >
          <div class={`entry ${media ? '' : 'skeleton'}`}>
            <div class="cover" style={{ 'background-color': 'transparent' }}>
              <RiMediaPlayFill class="play-icon" />
              <div class="transition-cover" />
              <img src={media?.coverImage?.large} alt="cover" />
            </div>
            <div class="content">
              <h2 class="title">
                {media?.title?.english ? media?.title?.english : media?.title?.romaji}
              </h2>
              <div class="other-info">
                {media && media?.type === 'ANIME' ? (
                  <div class="episodes">
                    {media && `${media.progress || '~'} | ${media.episodes || '~'}`}
                  </div>
                ) : (
                  <div class="episodes">
                    {media && `${media.progress || '~'} | ${media.chapters || '~'}`}
                  </div>
                )}
                <div class="format">{media?.format}</div>
              </div>
            </div>
          </div>
        </A>
      </Show>
    </>
  )
}

export default Relation
