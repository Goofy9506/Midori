// import axios from 'axios'
// import { load } from 'cheerio'

// export default class Filemoon {
//   private UserAgent: string =
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
//   private ServerName: string = 'Filemoon'
//   private Sources: any[] = []

//   public videosFromUrl = async (url: URL) => {
//     // const options = {
//     //   headers: {
//     //     Referer: url.href,
//     //     'Content-Type': 'application/x-www-form-urlencoded',
//     //     'User-Agent': this.UserAgent,
//     //     'X-Requested-With': 'XMLHttpRequest'
//     //   }
//     // }

//     const response = (await axios.get(url.href)).data
//     const s = response.substring(response.indexOf('eval(function') + 5, response.lastIndexOf(')))'))
//     try {
//       const newScript = 'function run(' + s.split('function(')[1] + '))'
//     } catch (err) {}
//     return this.Sources
//   }
// }
