import { useStorageContext } from '@renderer/hooks/Storage'
import type { Component } from 'solid-js'

const AuthCallback: Component = () => {
  const pathName = window.location.hash.replace('#access_token=', '')?.replace(/&.*/, '')
  const { setStore } = useStorageContext()

  setStore('AnilistToken', pathName)
  setStore('Logged', true)

  window.open('/', '_self')

  return <></>
}

export default AuthCallback
