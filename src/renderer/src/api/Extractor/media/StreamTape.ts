import axios from 'axios'
import { load } from 'cheerio'

export default class StreamTape {
  private ServerName: string = 'StreamTape'
  private Sources: any[] = []

  public videosFromUrl = async (url: URL) => {
    let _a: any
    try {
      const response = await axios.get(url.href).catch(() => {
        throw new Error('Cannot extract video from this url')
      })

      const $ = load(response.data)
      let [fh, sh] =
        (_a = $.html()) === null || _a === void 0
          ? void 0
          : _a.match(/robotlink'\).innerHTML = (.*)'/)[1].split("+ ('")
      sh = sh.substring(3)
      fh = fh.replace(/'/g, '')
      const videoUrl = `https:${fh}${sh}`
      this.Sources.push({
        url: videoUrl,
        isM3U8: videoUrl.includes('.m3u8')
      })
      return this.Sources
    } catch (err: any) {
      throw new Error(err.message)
    }
  }
}
