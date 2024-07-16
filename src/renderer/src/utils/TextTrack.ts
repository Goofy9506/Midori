import { parseResponse } from 'media-captions'

export class TextTrack {
  readonly src?: any
  readonly encoding?: string

  private _Regions: any[] = []
  private _Cues: any[] = []
  private _Metadata: any = {}
  private _ActiveCues: any[] = []

  constructor(src: string, encoding?: string) {
    this.src = src
    this.encoding = encoding
  }

  private async _load() {
    try {
      const response = fetch(this.src)

      const { errors, metadata, regions, cues } = await parseResponse(response, {
        type: 'vtt',
        encoding: this.encoding
      })

      if (errors[0]?.code === 0) {
        throw errors[0]
      } else {
        this._Metadata = metadata
        this._Regions = regions
        this._Cues = cues
      }
    } catch (error: any) {
      throw new Error(`Failed to load text track: ${error.message}`)
    }
  }
}
