import { ipcRenderer } from 'electron'
import {
  RiMediaFullscreenExitLine,
  RiMediaFullscreenLine,
  RiSystemSubtractFill
} from 'solid-icons/ri'
import { FaSolidXmark } from 'solid-icons/fa'
import { createSignal, type Component } from 'solid-js'

import '../styles/TitleBar.scss'

const Titlebar: Component = () => {
  const renderClickEvent = (action: string) => {
    ipcRenderer.send(action)
  }

  const [maximize, setMaximize] = createSignal(false)

  return (
    <>
      <div class="title-bar">
        <div class="drag-region" />
        <div class="actions">
          <div
            onClick={() => {
              renderClickEvent('minimize')
            }}
            class="action"
          >
            <RiSystemSubtractFill />
          </div>
          <div
            onClick={() => {
              renderClickEvent('maximize')
              setMaximize(!maximize())
            }}
            class="action"
          >
            {!maximize() ? <RiMediaFullscreenLine /> : <RiMediaFullscreenExitLine />}
          </div>
          <div
            onClick={() => {
              renderClickEvent('exit')
            }}
            class="action"
            id="exit"
          >
            <FaSolidXmark />
          </div>
        </div>
      </div>
    </>
  )
}

export default Titlebar
