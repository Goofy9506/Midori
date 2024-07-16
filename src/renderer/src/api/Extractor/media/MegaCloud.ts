import axios from 'axios'
import crypto from 'crypto'

export default class MegaCloud {
  UserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'

  public videosFromUrl = async (url: URL) => {
    const result: {
      sources: any[]
      subtitles: any[]
      intro?: any[]
      outro?: any[]
    } = {
      sources: [],
      subtitles: []
    }

    const videoId = url?.href?.split('/')?.pop()?.split('?')[0]
    if (!videoId) {
      throw new Error('Invalid or missing video ID')
    }

    try {
      const { data: srcsData } = await axios.get<any>(
        'https://megacloud.tv/embed-2/ajax/e-1/getSources?id='.concat(videoId),
        {
          headers: {
            Accept: '*/*',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      )
      if (!srcsData) {
        throw new Error('Url may have an invalid video id')
      }

      const encryptedString = srcsData.sources
      if (!srcsData.encrypted && Array.isArray(encryptedString)) {
        result.intro = srcsData.intro
        result.outro = srcsData.outro
        result.subtitles = srcsData.tracks.map((s: any) => ({
          url: s.file,
          lang: s.label ? s.label : 'Thumbnails'
        }))
        result.sources = encryptedString.map((s) => ({
          url: s.file,
          type: s.type,
          isM3U8: s.file.includes('.m3u8')
        }))
        return result
      }

      const { data } = await axios.get(
        'https://megacloud.tv/js/player/a/prod/e1-player.min.js?v='.concat(Date.now().toString())
      )

      const text = data
      if (!text) throw new Error("Couldn't fetch script to decrypt resource")

      const vars = this.extractVariables(text)
      const { secret, encryptedSource } = this.getSecret(encryptedString as string, vars)
      const decrypted = this.decrypt(encryptedSource, secret)
      try {
        const sources = JSON.parse(decrypted)
        result.intro = srcsData.intro
        result.outro = srcsData.outro
        result.subtitles = srcsData.tracks.map((s: any) => ({
          url: s.file,
          lang: s.label ? s.label : 'Thumbnails'
        }))
        result.sources = sources.map((s: any) => ({
          url: s.file,
          type: s.type,
          isM3U8: s.file.includes('.m3u8')
        }))

        return result
      } catch (error) {
        throw new Error('Failed to decrypt resource')
      }
    } catch (error) {
      throw new Error('Failed to fetch video sources')
    }
  }

  private extractVariables(text: string) {
    if (!text || typeof text !== 'string') {
      throw new Error('Input text must be a non-empty string')
    }

    const regex = /case\s*0x[0-9a-f]+:(?![^;]*=partKey)\s*\w+\s*=\s*(\w+)\s*,\s*\w+\s*=\s*(\w+);/g
    const matches = Array.from(text.matchAll(regex))
    let extractedVariables: any[] = []
    try {
      extractedVariables = matches
        .map((match) => {
          const matchKey1 = this.matchingKey(match[1], text)
          const matchKey2 = this.matchingKey(match[2], text)
          return [parseInt(matchKey1, 16), parseInt(matchKey2, 16)]
        })
        .filter((pair) => pair.length > 0)
    } catch (e) {
      throw new Error('Failed to extract variables from the input text')
    }

    return extractedVariables
  }

  private getSecret(encryptedString: string, values: number[][]) {
    if (
      typeof encryptedString !== 'string' ||
      !Array.isArray(values) ||
      values.some((pair) => pair.length !== 2)
    ) {
      throw new Error('Invalid input format for encryptedString or values')
    }

    let encryptedSource = '',
      currentIndex = 0,
      secret = ''
    const encryptedSourceArray = encryptedString.split('')

    const extractedSecret = values.map(([start, length]) =>
      encryptedString.slice(start + currentIndex, start + currentIndex + length)
    )
    secret = extractedSecret.join('')
    currentIndex += values.reduce((acc, [, length]) => acc + length, 0)
    encryptedSource = encryptedSourceArray.join('')

    return { secret, encryptedSource }
  }

  private decrypt(encrypted: string, keyOrSecret: string, maybe_iv?: string) {
    let key: Buffer | string
    let iv: Buffer | string
    let contents: any
    if (maybe_iv) {
      key = keyOrSecret
      iv = maybe_iv
      contents = encrypted
    } else {
      const cypher = Buffer.from(encrypted, 'base64')
      const salt = cypher.subarray(8, 16)
      const password = Buffer.concat([Buffer.from(keyOrSecret, 'utf-8'), salt])
      const sha256Hashes: any[] = this.generateSha256Hashes(password)
      key = Buffer.concat([sha256Hashes[0], sha256Hashes[1]])
      iv = sha256Hashes[2]
      contents = cypher.subarray(16)
    }

    try {
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
      const decrypted =
        decipher.update(
          contents as any,
          typeof contents === 'string' ? 'base64' : undefined,
          'utf8'
        ) + decipher.final()

      return decrypted
    } catch (error) {
      throw new Error('Failed to decrypt the content')
    }
  }

  private generateSha256Hashes(password: Buffer) {
    const sha256Hashes: any[] = []
    let digest = password
    for (let i = 0; i < 3; i++) {
      sha256Hashes[i] = crypto.createHash('sha256').update(digest).digest()
      digest = Buffer.concat([sha256Hashes[i], password])
    }
    return sha256Hashes
  }

  private matchingKey(value: string, script: string): string {
    const regex = new RegExp(`^,${value}=((?:0x)?([0-9a-fA-F]+))$`)
    const match = script.match(regex)
    if (match) {
      return match[1].startsWith('0x') ? match[1].substring(2) : match[1]
    } else {
      throw new Error(`Failed to match the key for value: ${value}`)
    }
  }
}
