import { STORAGE } from '@renderer/utils/Storage'
import type { Component } from 'solid-js'

const AuthCallback: Component = () => {
  const pathName = window.location.hash.replace('#access_token=', '')?.replace(/&.*/, '')

  STORAGE.set('AnilistToken', pathName)
  STORAGE.set('Logged', true)

  window.open('/', '_self')

  return <></>
}

export default AuthCallback
