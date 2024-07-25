export default class Notify {
  private options: any
  private container: HTMLDivElement = document.createElement('div')

  constructor(options = {}) {
    this.options = options
    this.container.id = 'notification'
  }
  public Alert(message: string) {
    this.container.className = 'notification alert'
    document.getElementById('app')?.append(this.container)
    const titleDiv = document.createElement('h1')
    const messageDiv = document.createElement('div')
    titleDiv.innerHTML = 'Alert'
    messageDiv.innerHTML = message
    this.container.append(titleDiv)
    this.container.append(messageDiv)

    setTimeout(() => {
      this.container.style.right = '0px'
      setTimeout(() => {
        this.container.style.right = '-100%'
        setTimeout(() => {
          this.container.remove()
        }, 1000)
      }, this.options.duration ?? 4000)
    }, 1000)
  }
}
