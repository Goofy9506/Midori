import { Relation as RelationType } from '@renderer/types/Media'
import { A } from '@solidjs/router'
import { ipcRenderer } from 'electron'
import { RiMediaPlayFill } from 'solid-icons/ri'
import { type Component } from 'solid-js'

interface Props {
  media: RelationType
}

const Relation: Component<Props> = (props) => {
  const renderMediaInfo = (media: any) => {
    const { id, cover, name, type, episodes, chapters, idMal, relation } = media
    const progress = media.progress || '~'
    return (
      <>
        <A
          href={`/info/${id}?malId=${idMal}`}
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
              <img src={cover} alt="cover" />
            </div>
            <div class="content">
              <h2 class="title">{name}</h2>
              <div class="other-info">
                <div class="episodes">
                  {type === 'ANIME'
                    ? `${progress} | ${episodes || '~'}`
                    : `${progress} | ${chapters || '~'}`}
                </div>
                <div class="format">{relation}</div>
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

export default Relation
