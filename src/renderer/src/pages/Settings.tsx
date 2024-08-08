import { STORAGE } from '@renderer/utils/Storage'
import { createSignal, onMount, type Component } from 'solid-js'

import '../styles/Settings.scss'
import Notify from '@renderer/components/Notify'

const Settings: Component = () => {
  const [settings, setSettings] = createSignal<string>('player')

  const [preferredAudioLanguage, setPreferredAudioLanguage] = createSignal<string>('ja')
  const [preferredSubtitleLanguage, setPreferredSubtitleLanguage] = createSignal<string>('en')
  const [preferredPlaybackSpeed, setPreferredPlaybackSpeed] = createSignal<string>('1')
  const [loadTimeStamps, setLoadTimeStamps] = createSignal<boolean>(false)
  const [autoSkipOpEd, setAutoSkipOpEd] = createSignal<boolean>(false)
  const [autoComplete, setAutoComplete] = createSignal<boolean>(false)
  const [autoPlay, setAutoPlay] = createSignal<boolean>(true)
  const [logged, setLogged] = createSignal<boolean>(false)

  const dataSetup = async () => {
    setPreferredAudioLanguage(await STORAGE.getAudioLanguage())
    setLoadTimeStamps(await STORAGE.getLoadTimeStamps())
    setAutoSkipOpEd(await STORAGE.getSkipOPED())
    setAutoComplete(await STORAGE.getAutoUpdate())
    setAutoPlay(await STORAGE.getAutoPlay())
    setLogged(await STORAGE.getLogged())
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
              <div
                class="clear-progress"
                onClick={() => {
                  STORAGE.set('EpisodeProgress', [])
                  new Notify().Alert('The episode progress data has been cleared!')
                }}
              >
                Clear Watch Progress
              </div>
              <div
                class="log-out"
                onClick={() => {
                  STORAGE.set('Logged', false)
                  STORAGE.set('AnilistToken', '')
                  new Notify().Alert('You have successfully logged out!')
                }}
              >
                Logout
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
                      <select
                        value={loadTimeStamps() ? 'enabled' : 'disabled'}
                        onChange={(e) => {
                          setLoadTimeStamps(e.target.value === 'enabled')
                          STORAGE.set('LoadTimeStamps', e.target.value === 'enabled')
                          autoSkipOpEd()
                            ? (setAutoSkipOpEd(false), STORAGE.set('SkipOPED', false))
                            : undefined
                        }}
                      >
                        <option value="enabled" selected>
                          Enabled
                        </option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                    <div class="settings-item">
                      <div class="settings-item-title">Auto Play</div>
                      <select
                        value={autoPlay() ? 'enabled' : 'disabled'}
                        onChange={(e) => {
                          setAutoPlay(e.target.value === 'enabled')
                          STORAGE.set('AutoPlay', e.target.value === 'enabled')
                        }}
                      >
                        <option value="enabled" selected>
                          Enabled
                        </option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                    <div class="settings-item">
                      <div class="settings-item-title">
                        Auto Skip OP / ED <p> (Requires Load Time Stamps to be enabled)</p>
                      </div>
                      <select
                        value={autoSkipOpEd() ? 'enabled' : 'disabled'}
                        onChange={(e) => {
                          setAutoSkipOpEd(e.target.value === 'enabled')
                          STORAGE.set('SkipOPED', e.target.value === 'enabled')
                        }}
                      >
                        <option value="enabled" selected>
                          Enabled
                        </option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                    <div class="settings-item">
                      <div class="settings-item-title">
                        Auto Complete Episodes <p> (Requires Anilist Login)</p>
                      </div>
                      <select
                        value={autoComplete() ? 'enabled' : 'disabled'}
                        onChange={(e) => {
                          if (logged()) {
                            setAutoComplete(e.target.value === 'enabled')
                            STORAGE.set('AutoUpdate', e.target.value === 'enabled')
                          }
                        }}
                      >
                        <option value="enabled" selected>
                          Enabled
                        </option>
                        <option value="disabled">Disabled</option>
                      </select>
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
