/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route } from '@solidjs/router'

import App from './App'
import Home from './pages/Home'
import AuthCallback from './pages/Callback'
import Info from './pages/Info'
import Anime from './pages/Anime'
import Settings from './pages/Settings'

const root = document.getElementById('app')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
  )
}

render(
  () => (
    <Router root={App} preload>
      <Route path="/" component={Home} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/info/:id" component={Info} />
      <Route path="/anime" component={Anime} />
      <Route path="/settings" component={Settings} />
    </Router>
  ),
  root!
)
