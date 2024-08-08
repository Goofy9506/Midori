export const getColorTheme = (theme: string) => {
  document.querySelector('#app')?.classList.remove('green')
  document.querySelector('#app')?.classList.remove('blue')
  document.querySelector('#app')?.classList.remove('purple')
  document.querySelector('#app')?.classList.remove('pink')
  document.querySelector('#app')?.classList.remove('red')
  document.querySelector('#app')?.classList.add(theme)
}
