import { useStorageContext } from '@renderer/hooks/Storage'
import { Show, type Component } from 'solid-js'

import '../styles/Home.scss'
import { RiMediaNotificationFill, RiMediaNotificationLine } from 'solid-icons/ri'
import EntryWrapper from '@renderer/components/EntryWrapper'
import { animeInfo, mangaInfo } from '@renderer/App'

const Home: Component = () => {
  const { Logged } = useStorageContext()

  const notifications = 0

  return (
    <>
      <div class="body">
        <div class="main">
          <Show when={animeInfo()}>
            {Logged() ? (
              <div class="user-info">
                {Logged() ? (
                  <>
                    <div class="left">
                      <h1 class="username">{animeInfo()?.user?.name}</h1>
                      <h2 class="episodes-watched">
                        <div>Episodes Watched</div>
                        <p>{animeInfo()?.user?.statistics?.anime?.episodesWatched}</p>
                      </h2>
                      <h2 class="chapters-read">
                        <div>Chapters Read</div>
                        <p>{animeInfo()?.user?.statistics?.manga?.chaptersRead}</p>
                      </h2>
                    </div>
                    <div class="right">
                      <div class="notifications">
                        {notifications > 0 ? (
                          <RiMediaNotificationFill />
                        ) : (
                          <RiMediaNotificationLine />
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div class="left">
                    <h1 class="username">Guest</h1>
                  </div>
                )}
              </div>
            ) : null}
            {Logged() ? (
              <div class="wraps">
                <EntryWrapper
                  list={animeInfo()?.lists?.filter((m: any) => m.status === 'CURRENT')[0]?.entries}
                  title="Continue Watching"
                />
                <EntryWrapper
                  list={mangaInfo()?.lists?.filter((m: any) => m.status === 'CURRENT')[0]?.entries}
                  title="Continue Reading"
                />
              </div>
            ) : null}
          </Show>
        </div>
      </div>
    </>
  )
}

export default Home
