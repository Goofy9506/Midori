import { RiArrowsArrowLeftFill, RiArrowsArrowRightFill } from 'solid-icons/ri'
import { For, createSignal, type Component } from 'solid-js'
import Entry from './Entry'

import '../styles/Entry.scss'

interface Props {
  list: any
  title: string
}

const EntryWrapper: Component<Props> = (props: { list; title }) => {
  let listWrapperRef: HTMLDivElement | undefined
  let listRef: HTMLDivElement | undefined
  const [showButtons, setShowButtons] = createSignal(false)

  const scrollLeft = () => {
    if (listWrapperRef) {
      listWrapperRef.scrollLeft -= 232 * 4
    }
  }
  const scrollRight = () => {
    if (listWrapperRef) {
      listWrapperRef.scrollLeft += 232 * 4
    }
  }

  const mouseEnter = () => {
    setShowButtons(true)
  }

  const mouseLeave = () => {
    setShowButtons(false)
  }

  return (
    <>
      <section onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}>
        <h1>{props.title}</h1>
        <div class={`scroll-buttons ${showButtons() ? 'show' : 'hidden'}`}>
          <button onClick={scrollLeft}>
            <RiArrowsArrowLeftFill />
          </button>
          <button onClick={scrollRight}>
            <RiArrowsArrowRightFill />
          </button>
        </div>
        <div class="list-wrapper" ref={listWrapperRef}>
          <div class="list" ref={listRef}>
            {props.list?.length > 0 && (
              <>
                {
                  <For each={props.list}>
                    {(entryData: any) => (
                      <Entry media={entryData.data ? entryData.data : entryData} />
                    )}
                  </For>
                }
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default EntryWrapper
