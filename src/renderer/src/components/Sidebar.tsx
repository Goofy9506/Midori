import { createEffect, createSignal, type Component } from 'solid-js'
import { RiBuildingsHome2Fill, RiMediaClapperboardFill, RiUserFacesUser3Fill } from 'solid-icons/ri'

import { A, useLocation } from '@solidjs/router'
import { useStorageContext } from '@renderer/hooks/Storage'

import '../styles/Sidebar.scss'

interface SidebarProps {
  avatar: string
}

const Sidebar: Component<SidebarProps> = (props) => {
  createEffect(() => {
    setAvatar(props.avatar)
  })

  const href = useLocation().pathname

  const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=18880&response_type=token`
  const [active, setActive] = createSignal<number>(1)
  const [avatar, setAvatar] = createSignal<string>('')
  const { Logged } = useStorageContext()

  if (href === '/home') setActive(1)
  if (href === '/anime') setActive(2)

  return (
    <div class="sidebar">
      <div class="top">
        <A
          href="/home"
          class={active() === 1 ? 'sidebar-link active' : 'sidebar-link'}
          onClick={() => setActive(1)}
        >
          <RiBuildingsHome2Fill />
        </A>
        <A
          href="/anime"
          class={active() === 2 ? 'sidebar-link active' : 'sidebar-link'}
          onClick={() => setActive(2)}
        >
          <RiMediaClapperboardFill />
        </A>
      </div>
      <div class="bottom">
        {Logged() ? (
          <A href="/settings" class="sidebar-link" onClick={() => setActive(3)}>
            <img src={avatar()} alt="avatar" />
          </A>
        ) : (
          <div
            class="not-logged-in"
            onClick={() => {
              window.open(`${authUrl}`, `_self`)
            }}
          >
            <RiUserFacesUser3Fill />
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
