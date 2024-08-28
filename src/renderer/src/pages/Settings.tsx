import { createSignal, onMount, type Component } from 'solid-js'

import '../styles/Settings.scss'
import Notify from '@renderer/components/Notify'
import { getColorTheme } from '@renderer/utils/UI'
import { useStorageContext } from '@renderer/hooks/Storage'

const Settings: Component = () => {
  const [settings, setSettings] = createSignal<string>('player')
  const {
    AudioLanguage,
    ColorTheme,
    Logged,
    LoadTimeStamps,
    AutoPlay,
    AutoUpdate,
    SkipOPED,
    setStore
  } = useStorageContext()

  const [preferredAudioLanguage, setPreferredAudioLanguage] = createSignal<string>('ja')
  const [preferredSubtitleLanguage, setPreferredSubtitleLanguage] = createSignal<string>('en')
  const [preferredPlaybackSpeed, setPreferredPlaybackSpeed] = createSignal<string>('1')
  const [loadTimeStamps, setLoadTimeStamps] = createSignal<boolean>(false)
  const [autoSkipOpEd, setAutoSkipOpEd] = createSignal<boolean>(false)
  const [autoComplete, setAutoComplete] = createSignal<boolean>(false)
  const [autoPlay, setAutoPlay] = createSignal<boolean>(true)
  const [logged, setLogged] = createSignal<boolean>(false)

  // Interface
  const [colorTheme, setColorTheme] = createSignal<string>('green')

  const dataSetup = async () => {
    setPreferredAudioLanguage(AudioLanguage())
    setLoadTimeStamps(LoadTimeStamps())
    setAutoSkipOpEd(SkipOPED())
    setAutoComplete(AutoUpdate())
    setAutoPlay(AutoPlay())
    setLogged(Logged())

    // Interface
    setColorTheme(ColorTheme())
  }

  onMount(dataSetup)

  return (
    <>
      <div class="body">
        <div class="main">
          <div class="settings">
            <div class="left">
              <div class="group">
                <h1 class="group-title">General</h1>
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
              <div
                class="clear-progress"
                onClick={() => {
                  setStore('EpisodeProgress', [])
                  new Notify().Alert('The episode progress data has been cleared!')
                }}
              >
                Clear Watch Progress
              </div>
              {logged() ? (
                <div
                  class="log-out"
                  onClick={() => {
                    setStore('Logged', false)
                    setStore('AnilistToken', '')
                    new Notify().Alert('You have successfully logged out!')
                  }}
                >
                  Logout
                </div>
              ) : undefined}
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
                          setStore('AudioLanguage', e.target.value)
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
                          setStore('LoadTimeStamps', e.target.value === 'enabled')
                          autoSkipOpEd()
                            ? (setAutoSkipOpEd(false), setStore('SkipOPED', false))
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
                          setStore('AutoPlay', e.target.value === 'enabled')
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
                          setStore('SkipOPED', e.target.value === 'enabled')
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
                            setStore('AutoUpdate', e.target.value === 'enabled')
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
              {settings() === 'interface' && (
                <>
                  <div class="settings-content">
                    <div class="settings-header">Interface Settings</div>
                    <div class="settings-item">
                      <div class="settings-item-title">Theme</div>
                      <select
                        value={colorTheme()}
                        onChange={(e) => {
                          if (logged()) {
                            setColorTheme(e.target.value)
                            setStore('ColorTheme', e.target.value)
                            getColorTheme(e.target.value)
                          }
                        }}
                      >
                        <option value="green" selected>
                          Midori Green
                        </option>
                        <option value="blue">Midori Blue</option>
                        <option value="purple">Midori Purple</option>
                        <option value="pink">Midori Pink</option>
                        <option value="red">Midori Red</option>
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
