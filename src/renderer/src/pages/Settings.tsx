import { STORAGE } from '@renderer/utils/Storage'
import { createSignal, onMount, type Component } from 'solid-js'

import '../styles/Settings.scss'

const Settings: Component = () => {
  const [settings, setSettings] = createSignal<string>('player')

  const [preferredAudioLanguage, setPreferredAudioLanguage] = createSignal<string>('ja')
  const [preferredSubtitleLanguage, setPreferredSubtitleLanguage] = createSignal<string>('en')
  const [preferredPlaybackSpeed, setPreferredPlaybackSpeed] = createSignal<string>('1')
  const [loadTimeStamps, setLoadTimeStamps] = createSignal<boolean>(false)
  const [autoSkipOpEd, setAutoSkipOpEd] = createSignal<boolean>(false)

  const dataSetup = async () => {
    setPreferredAudioLanguage(await STORAGE.getAudioLanguage())
    setLoadTimeStamps(await STORAGE.getLoadTimeStamps())
    setAutoSkipOpEd(await STORAGE.getSkipOPED())
  }

  onMount(dataSetup)

  return (
    <>
      <div class="body">
        <div class="main">
          <div class="settings">
            <div class="left">
              <div
                class={`sections ${settings() === 'player' ? 'active' : ''}`}
                onClick={() => setSettings('player')}
              >
                Player
              </div>
              <div
                class={`sections ${settings() === 'interface' ? 'active' : ''}`}
                onClick={() => setSettings('interface')}
              >
                Interface
              </div>
            </div>
            <div class="right">
              {settings() === 'player' && (
                <>
                  <div class="settings-content">
                    <div class="settings-header">Language Settings</div>
                    <div class="settings-item">
                      <div class="settings-item-title">Preferred Audio Language</div>
                      <select
                        value={preferredAudioLanguage()}
                        onChange={(e) => {
                          setPreferredAudioLanguage(e.target.value)
                          STORAGE.set('AudioLanguage', e.target.value)
                        }}
                      >
                        <option value="en">English</option>
                        <option value="ja" selected>
                          Japanese
                        </option>
                      </select>
                    </div>
                    <div class="settings-item">
                      <div class="settings-item-title">Preferred Subtitle Language</div>
                      <select
                        value={preferredSubtitleLanguage()}
                        onChange={(e) => setPreferredSubtitleLanguage(e.target.value)}
                      >
                        <option value="en" selected>
                          English
                        </option>
                        <option value="ja">Japanese</option>
                      </select>
                    </div>
                  </div>
                  <div class="settings-content">
                    <div class="settings-header">Playback Settings</div>
                    <div class="settings-item">
                      <div class="settings-item-title">Playback Speed</div>
                      <select
                        value={preferredPlaybackSpeed()}
                        onChange={(e) => setPreferredPlaybackSpeed(e.target.value)}
                      >
                        <option value="0.25">0.25x</option>
                        <option value="0.33">0.33x</option>
                        <option value="0.50">0.5x</option>
                        <option value="0.66">0.66x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1" selected>
                          1.0x
                        </option>
                        <option value="1.25">1.25x</option>
                        <option value="1.33">1.33x</option>
                        <option value="1.50">1.5x</option>
                        <option value="1.66">1.66x</option>
                        <option value="1.75">1.75x</option>
                        <option value="2">2.0x</option>
                      </select>
                    </div>
                    <div class="settings-item">
                      <div class="settings-item-title">Load Time Stamps</div>
                      <div class="select">
                        <div
                          class={`select-button ${loadTimeStamps() ? 'active' : ''}`}
                          onClick={() => {
                            setLoadTimeStamps(true)
                            STORAGE.set('LoadTimeStamps', true)
                          }}
                        >
                          Yes
                        </div>
                        <div
                          class={`select-button ${!loadTimeStamps() ? 'active' : ''}`}
                          onClick={() => {
                            setLoadTimeStamps(false)
                            STORAGE.set('LoadTimeStamps', false)
                            if (autoSkipOpEd()) {
                              setAutoSkipOpEd(false)
                              STORAGE.set('SkipOPED', false)
                            }
                          }}
                        >
                          No
                        </div>
                      </div>
                    </div>
                    <div class="settings-item">
                      <div class="settings-item-title">
                        Auto Skip OP / ED <p> (Requires Load Time Stamps to be enabled)</p>
                      </div>
                      <div class="select">
                        <div
                          class={`select-button ${autoSkipOpEd() ? 'active' : ''}`}
                          onClick={() => {
                            if (loadTimeStamps()) {
                              setAutoSkipOpEd(true)
                              STORAGE.set('SkipOPED', true)
                            }
                          }}
                        >
                          Yes
                        </div>
                        <div
                          class={`select-button ${!autoSkipOpEd() ? 'active' : ''}`}
                          onClick={() => {
                            setAutoSkipOpEd(false)
                            STORAGE.set('SkipOPED', false)
                          }}
                        >
                          No
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Settings
