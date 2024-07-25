import axios from 'axios'

export default class MP4Upload {
  private ServerName: string = 'mp4upload'
  private ServerUrl: string = 'https://mp4upload.com/'
  private Sources: any[] = []

  public videosFromUrl = async (url: URL) => {
    const response = (await axios.get(url.href)).data.catch(() => {
      throw new Error('Cannot extract video from this url')
    })

    const script = response.match(
      /(?<=player\.src\()\s*{\s*type:\s*"[^"]+",\s*src:\s*"([^"]+)"\s*}\s*(?=\);)/s
    )
    const videoUrl = script[1]
    if (!videoUrl) throw new Error('Cannot extract video from this url')

    this.Sources.push({
      quality: 'auto',
      url: videoUrl,
      isM3U8: videoUrl.includes('.m3u8')
    })

    return this.Sources
  }
}
