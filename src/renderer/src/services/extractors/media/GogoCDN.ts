import axios from 'axios'
import { CheerioAPI, load } from 'cheerio'
import CryptoJS from 'crypto-js'

export default class GogoCDN {
  private Sources: any[] = []
  private readonly keys = {
    key: CryptoJS.enc.Utf8.parse('37911490979715163134003223491201'),
    secondKey: CryptoJS.enc.Utf8.parse('54674138327930866480207815084989'),
    iv: CryptoJS.enc.Utf8.parse('3134003223491201')
  }

  /**
   * Fetches video sources from a given server URL.
   * @param serverUrl - The server URL containing the video ID.
   * @returns An array of video source objects with URL, isM3U8, and quality properties.
   */
  public videosFromUrl = async (serverUrl: URL): Promise<any[]> => {
    try {
      const response = await axios.get(serverUrl.href)
      const $ = load(response.data)

      const encyptedParams = await this.generateEncryptedAjaxParams(
        $,
        serverUrl.searchParams.get('id') ?? ''
      )

      const encryptedData = await axios.get(
        `${serverUrl.protocol}//${serverUrl.hostname}/encrypt-ajax.php?${encyptedParams}`,
        {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/json, text/javascript, */*; q=0.01'
          }
        }
      )

      const decryptedData = await this.decryptAjaxData(encryptedData.data.data)
      if (!decryptedData.source) {
        throw new Error('No source found. Try a different server.')
      }

      decryptedData.source.forEach(async (source: any) => {
        const isM3U8 = source.file.includes('.m3u8')
        let quality = 'default'
        if (isM3U8) {
          const resResult = await axios.get(source.file)
          const resolutions = resResult.data.match(/(RESOLUTION=)(.*)(\s*?)(\s*.*)/g)
          resolutions?.forEach((res: string) => {
            const index = source.file.lastIndexOf('/')
            quality = res.split('\n')[0].split('x')[1].split(',')[0] + 'p'
            const url = source.file.slice(0, index)
            this.Sources.push({
              url: url + '/' + res.split('\n')[1],
              isM3U8: (url + res.split('\n')[1]).includes('.m3u8'),
              quality
            })
          })
        } else {
          quality = isM3U8 ? 'default' : source.label.split(' ')[0] + 'p'
          this.Sources.push({
            url: source.file,
            isM3U8,
            quality
          })
        }
      })

      decryptedData.source_bk.forEach((source: any) => {
        this.Sources.push({
          url: source.file,
          isM3U8: source.file.includes('.m3u8'),
          quality: 'backup'
        })
      })

      return this.Sources
    } catch (error) {
      throw new Error('An error occurred while fetching video sources.')
    }
  }

  /**
   * Generates encrypted parameters required for an AJAX request.
   * @param $ - A CheerioAPI instance used to parse HTML.
   * @param id - A string representing the ID to be encrypted.
   * @returns A string formatted as a query string containing the encrypted ID, original ID, and decrypted token.
   */
  private generateEncryptedAjaxParams = async ($: CheerioAPI, id: string): Promise<string> => {
    const encryptedKey = CryptoJS.AES.encrypt(id, this.keys.key, { iv: this.keys.iv })
    const scriptValue = $("script[data-name='episode']").attr('data-value') as string
    const decryptedToken = CryptoJS.AES.decrypt(scriptValue, this.keys.key, {
      iv: this.keys.iv
    }).toString(CryptoJS.enc.Utf8)
    return `id=${encryptedKey}&alias=${id}&${decryptedToken}`
  }

  /**
   * Decrypts an encrypted string using AES decryption with a predefined key and initialization vector (IV),
   * then parses the decrypted string into a JSON object.
   * @param encryptedData The encrypted data to be decrypted.
   * @returns A JSON object representing the decrypted data.
   */
  private decryptAjaxData = async (encryptedData: string): Promise<any> => {
    // Decrypt the encrypted data using AES decryption
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, this.keys.secondKey, {
      iv: this.keys.iv
    })

    // Convert the decrypted bytes to a UTF-8 string
    const decryptedData = CryptoJS.enc.Utf8.stringify(decryptedBytes)

    // Parse the UTF-8 string into a JSON object
    return JSON.parse(decryptedData)
  }
}
