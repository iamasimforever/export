import { timeParse } from "d3-time-format"
import { color, hsl } from "d3-color"
import { flatten } from "./utils"
// import rawData from "./../data/data.json"

// export const data = rawData

export const parseDate = timeParse("%-m/%-d/%Y")
export const dateAccessor = d => parseDate(d[""] || d["date"])

export const titleAccessor = (d={}, doStripFormatting=true) => (
  doStripFormatting
  ? (d["title"] || "").replace(/\*/g, "")
  : d["title"] || ""
)

const sourceKeywords = {
  Facebook: [
    "facbeook",
    "fb",
    "ＦＢ",
  ],
  Twitter: [
    "tweet",
    "tweets",
    "twttr",
  ],
  WhatsApp: [],
  Instagram: [
    "ig",
  ],
  Youtube: [],
  Weibo: [],
  TikTok: [],
  Medium: [
    "medium.com"
  ],
  "The news": [
    "news",
  ],
  Reddit: [],
  Blogs: [
    "blog",
    "blogs",
    "bloggers",
  ],
  Radio: [],
  TV: [],
  // video: [],
}
export const sourceColors = {
  Facebook: "#4267B2",
  Twitter: "#1DA1F2",
  WhatsApp: "#4AC959",
  Instagram: "#833AB4",
  Youtube: "#FF0000",
  Weibo: "#df2029",
  TikTok: "#69C9D0",
  Medium: "#292828",
  "The news": "#778beb",
  Reddit: "#FF4500",
  Blogs: "#FDA7DF",
  Radio: "#e77f67",
  TV: "#0fb9b1",
  // video: [],
}

export const sources = Object.keys(sourceKeywords)

export const categories = ["Authorities", "Causes", "Conspiracy theory", "Cures", "Spread", "Symptoms", "Other"]
// const colors = ["#58B19F", "#778beb", "#e77f67", "#FDA7DF", "#cf6a87", "#A3CB38", "#786fa6", "#4b7bec", "#778ca3", "#0fb9b1"]
// const colors = ["#1AC29A", "#778beb", "#E58F29", "#FDA7DF", "#cf6a87", "#AED027", "#786fa6", "#778ca3"]
// const colors = ["#E58F29", "#E1538F", "#358DDE", "#6F57B0", "#91BF0D", "#20C29B", "#CD424A", "#778ca3"]
// const colors = ["#57a039", "#5ecd31", "#8cf761", "#bfff95", "#e4ffd0"]
// const colors = ["#AE6DED", "#ED423E", "#57A13A", "#4DA3A2", "#A38345"]
const colors = ["#4B3566", "#da574d", "#58A13A", "#53AEB0", "#E6BD77"]
let categoryColors = {}
categories.forEach((category, i) => {
  categoryColors[category] = colors[i % (colors.length)]
})
console.log(categoryColors)
categoryColors[""] = "#656275"
export {categoryColors}

export const categoryAccessor = d => d["category"].trim()

export const parseSource = (str="") => {
  const words = (str.toLowerCase().match(/\S+\s*/g) || []).map(d => d.trim())
  const matchingSources = sources.filter(source => (
    [source.toLowerCase(), ...sourceKeywords[source]].filter(keyword => (
      words.includes(keyword)
    )).length > 0
  ))
  return matchingSources
}
export const sourceAccessor = d => {
  if (!d["source"]) return []
  return parseSource(d["source"])
}

function getDomainFromUrl(url) {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
      hostname = url.split('/')[2]
  }
  else {
      hostname = url.split('/')[0]
  }

  //find & remove port number
  hostname = hostname.split(':')[0];
  hostname = hostname.replace("www.", "")
  //find & remove "?"
  hostname = hostname.split('?')[0];

  return hostname;
}
export const languageAccessor = d => d["lang"]

export const urlAccessor = d => d["url"]
// export const domainAccessor = d => {
//   const url = urlAccessor(d)
//   if (
//     !url.startsWith("http")
//     && !url.startsWith("www")
//   ) return null
//   return getDomainFromUrl(url)
// }
const validRatings = {
  False: [
    "false",
    "falso",
    "fake",
    "old policy",
    "inaccurate",
    "incorrect",
    "old policy",
    "unsupported",
    "fake news",
    "wrong",
    "conspiracy theory",
    "not true",
    "false connection",
  ],
  "Intentionally false": [
    "intentionally false",
    "misinformation / conspiracy theory",
    "clickbait / disinformation",
    "manipulation",
    "pseudoscience, fake news, disinformation",
    "misinformation",
    "fake news, conspiracy theory, manipulation of facts, disinformation, clickbait",
  ],
  Misleading: [
    "misleading",
    "misleading title",
    "false headline",
  ],
  Unproven: [
    "unproven",
    "insufficient evidence",
    "unlikely",
    "no evidence",
    "unverified",
    "questionable",
    "unverified",
  ],
  "Very false": [
    "very false",
    "pants on fire!",
  ],
  "Partially false": [
    "partially false",
    "mainly false",
    "mostly false",
    "teilweise falsch",
    "mostly true",
  ],
}

export const ratingPaths = {
  "Partially false": `<path d="M1.69222 1.87198C1.74822 0.679985 2.35222 0.0839844 3.50422 0.0839844C3.94422 0.0839844 4.28422 0.179984 4.52422 0.371984C4.77222 0.563984 4.89622 0.831984 4.89622 1.17598C4.89622 1.52798 4.77222 1.92798 4.52422 2.37598L2.64022 5.73598C2.54422 5.91998 2.44422 6.05198 2.34022 6.13198C2.24422 6.20398 2.12422 6.23998 1.98022 6.23998C1.66822 6.23998 1.52022 6.05198 1.53622 5.67598L1.69222 1.87198ZM1.65622 6.57598C1.97622 6.57598 2.24422 6.68398 2.46022 6.89998C2.68422 7.11598 2.79622 7.37999 2.79622 7.69199C2.79622 7.90799 2.73622 8.11998 2.61622 8.32798C2.50422 8.53598 2.34422 8.70798 2.13622 8.84398C1.93622 8.97198 1.70822 9.03598 1.45222 9.03598C1.14022 9.03598 0.876219 8.92798 0.660219 8.71198C0.444219 8.49598 0.332219 8.23198 0.324219 7.91998C0.324219 7.70398 0.380219 7.49199 0.492219 7.28399C0.604219 7.07599 0.760219 6.90798 0.960219 6.77998C1.16822 6.64398 1.40022 6.57598 1.65622 6.57598Z" />`,
  // "Partially false": `<path fill-rule="evenodd" clip-rule="evenodd" d="M4 8C6.20898 8 8 6.20898 8 4C8 1.79102 6.20898 0 4 0C1.79102 0 0 1.79102 0 4C0 6.20898 1.79102 8 4 8ZM4.58691 1.5C3.83105 1.5 3.43457 1.83301 3.39746 2.49902L3.29492 4.62305C3.28516 4.83301 3.38184 4.93848 3.58691 4.93848C3.68066 4.93848 3.75977 4.91797 3.82324 4.87793C3.89062 4.83301 3.95703 4.75977 4.01953 4.65723L5.25586 2.78027C5.34082 2.64941 5.40332 2.52637 5.44434 2.41016C5.48145 2.30371 5.5 2.2041 5.5 2.11035C5.5 2.00586 5.47559 1.91406 5.42773 1.83398C5.3877 1.76758 5.33008 1.70996 5.25586 1.66113C5.09863 1.55371 4.875 1.5 4.58691 1.5ZM3.62793 5.16016C3.5498 5.1377 3.46484 5.12598 3.37402 5.12598C3.25977 5.12598 3.15332 5.14355 3.05371 5.17871C3.00684 5.19531 2.96094 5.21582 2.91699 5.24023C2.78613 5.31152 2.68359 5.40527 2.61035 5.52148C2.55859 5.60254 2.52539 5.68555 2.50977 5.76953C2.50293 5.80469 2.5 5.84082 2.5 5.87695C2.50488 6.05078 2.5791 6.19824 2.7207 6.31934C2.8623 6.43945 3.03516 6.5 3.24023 6.5C3.34668 6.5 3.44531 6.48535 3.53711 6.45703C3.58984 6.44043 3.64062 6.41895 3.68945 6.39258C3.8252 6.31641 3.93066 6.2207 4.00391 6.10449C4.08301 5.98828 4.12207 5.87012 4.12207 5.74902C4.12207 5.5752 4.04883 5.42773 3.90137 5.30664C3.82129 5.23828 3.72949 5.18945 3.62793 5.16016Z"/>`,
  "False": `<path d="M1.69222 1.87198C1.74822 0.679985 2.35222 0.0839844 3.50422 0.0839844C3.94422 0.0839844 4.28422 0.179984 4.52422 0.371984C4.77222 0.563984 4.89622 0.831984 4.89622 1.17598C4.89622 1.52798 4.77222 1.92798 4.52422 2.37598L2.64022 5.73598C2.54422 5.91998 2.44422 6.05198 2.34022 6.13198C2.24422 6.20398 2.12422 6.23998 1.98022 6.23998C1.66822 6.23998 1.52022 6.05198 1.53622 5.67598L1.69222 1.87198ZM1.65622 6.57598C1.97622 6.57598 2.24422 6.68398 2.46022 6.89998C2.68422 7.11598 2.79622 7.37999 2.79622 7.69199C2.79622 7.90799 2.73622 8.11998 2.61622 8.32798C2.50422 8.53598 2.34422 8.70798 2.13622 8.84398C1.93622 8.97198 1.70822 9.03598 1.45222 9.03598C1.14022 9.03598 0.876219 8.92798 0.660219 8.71198C0.444219 8.49598 0.332219 8.23198 0.324219 7.91998C0.324219 7.70398 0.380219 7.49199 0.492219 7.28399C0.604219 7.07599 0.760219 6.90798 0.960219 6.77998C1.16822 6.64398 1.40022 6.57598 1.65622 6.57598Z" /><path d="M5.368 1.87198C5.424 0.679985 6.028 0.0839844 7.18 0.0839844C7.62 0.0839844 7.96 0.179984 8.2 0.371984C8.448 0.563984 8.572 0.831984 8.572 1.17598C8.572 1.52798 8.448 1.92798 8.2 2.37598L6.316 5.73598C6.22 5.91998 6.12 6.05198 6.016 6.13198C5.92 6.20398 5.8 6.23998 5.656 6.23998C5.344 6.23998 5.196 6.05198 5.212 5.67598L5.368 1.87198ZM5.332 6.57598C5.652 6.57598 5.92 6.68398 6.136 6.89998C6.36 7.11598 6.472 7.37999 6.472 7.69199C6.472 7.90799 6.412 8.11998 6.292 8.32798C6.18 8.53598 6.02 8.70798 5.812 8.84398C5.612 8.97198 5.384 9.03598 5.128 9.03598C4.816 9.03598 4.552 8.92798 4.336 8.71198C4.12 8.49598 4.008 8.23198 4 7.91998C4 7.70398 4.056 7.49199 4.168 7.28399C4.28 7.07599 4.436 6.90798 4.636 6.77998C4.844 6.64398 5.076 6.57598 5.332 6.57598Z" />`,
  // "False": `<path fill-rule="evenodd" clip-rule="evenodd" d="M8.75586 4.03613C8.75586 6.24512 6.96484 8.03613 4.75586 8.03613C2.54688 8.03613 0.755859 6.24512 0.755859 4.03613C0.755859 1.82715 2.54688 0.0361328 4.75586 0.0361328C6.96484 0.0361328 8.75586 1.82715 8.75586 4.03613ZM3.18262 1.94238C3.36719 1.64746 3.71094 1.5 4.21387 1.5C4.37109 1.5 4.50977 1.51562 4.62891 1.54785C4.72656 1.5752 4.81152 1.6123 4.88281 1.66113C4.95801 1.71094 5.01562 1.76953 5.05664 1.83789C5.08594 1.8877 5.10645 1.94238 5.11719 2.00195C5.12402 2.03613 5.12695 2.07227 5.12695 2.11035C5.12695 2.20312 5.10938 2.30176 5.07324 2.40723C5.03223 2.52441 4.96875 2.64844 4.88281 2.78027L3.64648 4.65723C3.58398 4.75977 3.51758 4.83301 3.4502 4.87793C3.38672 4.91797 3.30762 4.93848 3.21387 4.93848C3.00879 4.93848 2.91211 4.83301 2.92188 4.62305L3.02441 2.49902C3.03711 2.27637 3.08984 2.09082 3.18262 1.94238ZM3.00098 5.12598C3.21094 5.12598 3.38672 5.18652 3.52832 5.30664C3.67578 5.42773 3.74902 5.5752 3.74902 5.74902C3.74902 5.87012 3.70996 5.98828 3.63086 6.10449C3.58984 6.16895 3.53906 6.22754 3.47852 6.28027C3.43066 6.32227 3.37598 6.35938 3.31641 6.39258C3.25098 6.42773 3.18164 6.4541 3.10742 6.47168C3.06738 6.48145 3.02539 6.48828 2.98242 6.49316C2.94531 6.49805 2.90625 6.5 2.86719 6.5C2.66211 6.5 2.48926 6.43945 2.34766 6.31934C2.20605 6.19824 2.13184 6.05078 2.12695 5.87695C2.12695 5.84082 2.12988 5.80469 2.13672 5.76953C2.15234 5.68555 2.18555 5.60254 2.2373 5.52148C2.31055 5.40527 2.41309 5.31152 2.54395 5.24023C2.68066 5.16406 2.83301 5.12598 3.00098 5.12598ZM5.5791 1.77441C5.39844 1.94043 5.2998 2.18164 5.28223 2.49902L5.17969 4.62305C5.16992 4.83301 5.2666 4.93848 5.47168 4.93848C5.52832 4.93848 5.58008 4.93066 5.62598 4.91602C5.65625 4.90625 5.68359 4.89355 5.70801 4.87793C5.77539 4.83301 5.8418 4.75977 5.9043 4.65723L7.14062 2.78027C7.30371 2.53027 7.38477 2.30664 7.38477 2.11035C7.38477 1.99902 7.35742 1.90234 7.30371 1.81934C7.26367 1.75879 7.20898 1.70605 7.14062 1.66113C6.9834 1.55371 6.75977 1.5 6.47168 1.5C6.0752 1.5 5.77832 1.5918 5.5791 1.77441ZM5.48438 5.15234C5.41406 5.13477 5.33887 5.12598 5.25879 5.12598C5.14551 5.12598 5.03906 5.14355 4.93945 5.17871C4.8916 5.19531 4.8457 5.21582 4.80176 5.24023C4.6709 5.31152 4.56836 5.40527 4.49512 5.52148C4.4541 5.58691 4.4248 5.65332 4.40625 5.71973C4.3916 5.77148 4.38477 5.82422 4.38477 5.87695C4.38965 6.05078 4.46387 6.19824 4.60547 6.31934C4.74707 6.43945 4.91992 6.5 5.125 6.5C5.20898 6.5 5.28809 6.49121 5.3623 6.47363C5.4375 6.45605 5.50781 6.42871 5.57422 6.39258C5.70996 6.31641 5.81543 6.2207 5.88867 6.10449C5.96777 5.98828 6.00684 5.87012 6.00684 5.74902C6.00684 5.5752 5.93359 5.42773 5.78613 5.30664C5.69824 5.23242 5.59766 5.18066 5.48438 5.15234Z"/>`,
  "Very false": `<path d="M1.69222 1.87198C1.74822 0.679985 2.35222 0.0839844 3.50422 0.0839844C3.94422 0.0839844 4.28422 0.179984 4.52422 0.371984C4.77222 0.563984 4.89622 0.831984 4.89622 1.17598C4.89622 1.52798 4.77222 1.92798 4.52422 2.37598L2.64022 5.73598C2.54422 5.91998 2.44422 6.05198 2.34022 6.13198C2.24422 6.20398 2.12422 6.23998 1.98022 6.23998C1.66822 6.23998 1.52022 6.05198 1.53622 5.67598L1.69222 1.87198ZM1.65622 6.57598C1.97622 6.57598 2.24422 6.68398 2.46022 6.89998C2.68422 7.11598 2.79622 7.37999 2.79622 7.69199C2.79622 7.90799 2.73622 8.11998 2.61622 8.32798C2.50422 8.53598 2.34422 8.70798 2.13622 8.84398C1.93622 8.97198 1.70822 9.03598 1.45222 9.03598C1.14022 9.03598 0.876219 8.92798 0.660219 8.71198C0.444219 8.49598 0.332219 8.23198 0.324219 7.91998C0.324219 7.70398 0.380219 7.49199 0.492219 7.28399C0.604219 7.07599 0.760219 6.90798 0.960219 6.77998C1.16822 6.64398 1.40022 6.57598 1.65622 6.57598Z" /> <path d="M5.368 1.87198C5.424 0.679985 6.028 0.0839844 7.18 0.0839844C7.62 0.0839844 7.96 0.179984 8.2 0.371984C8.448 0.563984 8.572 0.831984 8.572 1.17598C8.572 1.52798 8.448 1.92798 8.2 2.37598L6.316 5.73598C6.22 5.91998 6.12 6.05198 6.016 6.13198C5.92 6.20398 5.8 6.23998 5.656 6.23998C5.344 6.23998 5.196 6.05198 5.212 5.67598L5.368 1.87198ZM5.332 6.57598C5.652 6.57598 5.92 6.68398 6.136 6.89998C6.36 7.11598 6.472 7.37999 6.472 7.69199C6.472 7.90799 6.412 8.11998 6.292 8.32798C6.18 8.53598 6.02 8.70798 5.812 8.84398C5.612 8.97198 5.384 9.03598 5.128 9.03598C4.816 9.03598 4.552 8.92798 4.336 8.71198C4.12 8.49598 4.008 8.23198 4 7.91998C4 7.70398 4.056 7.49199 4.168 7.28399C4.28 7.07599 4.436 6.90798 4.636 6.77998C4.844 6.64398 5.076 6.57598 5.332 6.57598Z" /> <path d="M9.368 1.87198C9.424 0.679985 10.028 0.0839844 11.18 0.0839844C11.62 0.0839844 11.96 0.179984 12.2 0.371984C12.448 0.563984 12.572 0.831984 12.572 1.17598C12.572 1.52798 12.448 1.92798 12.2 2.37598L10.316 5.73598C10.22 5.91998 10.12 6.05198 10.016 6.13198C9.92 6.20398 9.8 6.23998 9.656 6.23998C9.344 6.23998 9.196 6.05198 9.212 5.67598L9.368 1.87198ZM9.332 6.57598C9.652 6.57598 9.92 6.68398 10.136 6.89998C10.36 7.11598 10.472 7.37999 10.472 7.69199C10.472 7.90799 10.412 8.11998 10.292 8.32798C10.18 8.53598 10.02 8.70798 9.812 8.84398C9.612 8.97198 9.384 9.03598 9.128 9.03598C8.816 9.03598 8.552 8.92798 8.336 8.71198C8.12 8.49598 8.008 8.23198 8 7.91998C8 7.70398 8.056 7.49199 8.168 7.28399C8.28 7.07599 8.436 6.90798 8.636 6.77998C8.844 6.64398 9.076 6.57598 9.332 6.57598Z" />`,
  // "Very false": `<path fill-rule="evenodd" clip-rule="evenodd" d="M4.55273 8.03613C6.76172 8.03613 8.55273 6.24512 8.55273 4.03613C8.55273 3.45312 8.42871 2.89941 8.2041 2.40039C8.20117 2.40918 8.19727 2.41895 8.19434 2.42773C8.15332 2.53906 8.09277 2.65625 8.01172 2.78027L6.77539 4.65723C6.71289 4.75977 6.64648 4.83301 6.5791 4.87793C6.51562 4.91797 6.43652 4.93848 6.34277 4.93848C6.1377 4.93848 6.04102 4.83301 6.05078 4.62305L6.15332 2.49902C6.19043 1.83301 6.58691 1.5 7.34277 1.5C7.46289 1.5 7.57129 1.50977 7.66895 1.52832C6.93555 0.618164 5.81152 0.0361328 4.55273 0.0361328C2.34375 0.0361328 0.552734 1.82715 0.552734 4.03613C0.552734 4.6123 0.674805 5.15918 0.893555 5.6543C0.911133 5.60938 0.933594 5.56543 0.960938 5.52148C1.03418 5.40527 1.13672 5.31152 1.26758 5.24023C1.31055 5.21582 1.35547 5.19629 1.40137 5.17969C1.50195 5.14453 1.60938 5.12598 1.72461 5.12598C1.81348 5.12598 1.89551 5.13672 1.97168 5.1582C2.07617 5.1875 2.16992 5.2373 2.25195 5.30664C2.33887 5.37793 2.40039 5.45898 2.43555 5.54883C2.45996 5.61133 2.47266 5.67773 2.47266 5.74902C2.47266 5.87012 2.43359 5.98828 2.35449 6.10449C2.31348 6.16992 2.26172 6.22852 2.2002 6.28125C2.15234 6.32227 2.09863 6.35938 2.04004 6.39258C1.97559 6.42773 1.90625 6.4541 1.83301 6.47168C1.80664 6.47852 1.7793 6.48438 1.75098 6.48828C1.7002 6.49609 1.64648 6.5 1.59082 6.5C1.51758 6.5 1.44922 6.49219 1.38379 6.47656C2.11523 7.4248 3.2627 8.03613 4.55273 8.03613ZM5.13965 1.5C4.38379 1.5 3.9873 1.83301 3.9502 2.49902L3.84766 4.62305C3.83789 4.83301 3.93457 4.93848 4.13965 4.93848C4.19629 4.93848 4.24805 4.93066 4.29395 4.91602C4.32422 4.90625 4.35156 4.89355 4.37598 4.87793C4.44336 4.83301 4.50977 4.75977 4.57227 4.65723L5.80859 2.78027C5.89453 2.64844 5.95801 2.52344 5.99902 2.40625L6.02734 2.31152C6.04492 2.24219 6.05273 2.1748 6.05273 2.11035C6.05273 2.00781 6.0293 1.91699 5.9834 1.83887C5.94336 1.77051 5.88477 1.71094 5.80859 1.66113C5.7373 1.6123 5.65234 1.5752 5.55469 1.54785C5.43555 1.51562 5.29785 1.5 5.13965 1.5ZM4.4541 5.30664C4.3125 5.18652 4.13672 5.12598 3.92676 5.12598C3.8125 5.12598 3.70605 5.14355 3.60547 5.17871C3.55859 5.19531 3.51367 5.21582 3.46973 5.24023C3.33887 5.31152 3.23633 5.40527 3.16309 5.52148C3.11133 5.60254 3.07812 5.68555 3.0625 5.76953C3.05566 5.80469 3.05273 5.84082 3.05273 5.87695C3.05762 6.05078 3.13184 6.19824 3.27344 6.31934C3.41504 6.43945 3.58789 6.5 3.79297 6.5L3.83984 6.49902L3.9082 6.49316C3.95117 6.48828 3.99316 6.48145 4.0332 6.47168C4.10742 6.4541 4.17676 6.42773 4.24219 6.39258C4.37793 6.31641 4.4834 6.2207 4.55664 6.10449C4.63574 5.98828 4.6748 5.87012 4.6748 5.74902C4.6748 5.5752 4.60156 5.42773 4.4541 5.30664ZM2.04883 1.77148C2.24805 1.59082 2.54395 1.5 2.9375 1.5C3.06348 1.5 3.17676 1.50977 3.27734 1.53027C3.4082 1.55664 3.51758 1.60059 3.60645 1.66113C3.69434 1.71875 3.75879 1.78906 3.79883 1.87109C3.83301 1.94141 3.85059 2.02148 3.85059 2.11035C3.85059 2.20898 3.83008 2.31445 3.78906 2.42773C3.74805 2.53906 3.6875 2.65625 3.60645 2.78027L2.37012 4.65723C2.30762 4.75977 2.24121 4.83301 2.17383 4.87793C2.11035 4.91797 2.03125 4.93848 1.9375 4.93848C1.73242 4.93848 1.63574 4.83301 1.64551 4.62305L1.74805 2.49902C1.76562 2.17969 1.86621 1.9375 2.04883 1.77148ZM6.3877 5.16113C6.30859 5.1377 6.22266 5.12598 6.12988 5.12598C5.96191 5.12598 5.80957 5.16406 5.67285 5.24023C5.54199 5.31152 5.43945 5.40527 5.36621 5.52148C5.29297 5.6377 5.25586 5.75586 5.25586 5.87695C5.26074 6.05078 5.33496 6.19824 5.47656 6.31934C5.61816 6.43945 5.79102 6.5 5.99609 6.5C6.08008 6.5 6.15918 6.49121 6.2334 6.47363C6.30859 6.45605 6.37891 6.42871 6.44531 6.39258C6.58105 6.31641 6.68652 6.2207 6.75977 6.10449C6.80566 6.03711 6.83789 5.96973 6.85742 5.90137C6.87109 5.85059 6.87793 5.7998 6.87793 5.74902C6.87793 5.5752 6.80469 5.42773 6.65723 5.30664C6.57812 5.23926 6.48828 5.19043 6.3877 5.16113Z"/>`,
  "Unproven": `<path d="M3.012 5.748C3.092 5.844 3.128 5.92 3.12 5.976C3.096 6.056 3.028 6.124 2.916 6.18C2.804 6.228 2.684 6.252 2.556 6.252C2.18 6.252 1.872 6.16 1.632 5.976C1.4 5.784 1.284 5.54 1.284 5.244C1.284 5.132 1.3 5.028 1.332 4.932C1.404 4.676 1.54 4.468 1.74 4.308C1.948 4.14 2.252 3.94 2.652 3.708C3.084 3.468 3.416 3.248 3.648 3.048C3.88 2.848 4.04 2.588 4.128 2.268C4.152 2.156 4.164 2.052 4.164 1.956C4.164 1.684 4.072 1.476 3.888 1.332C3.704 1.188 3.508 1.116 3.3 1.116C3.076 1.116 2.88 1.148 2.712 1.212C2.8 1.444 2.844 1.688 2.844 1.944C2.844 2.064 2.832 2.172 2.808 2.268C2.72 2.572 2.56 2.808 2.328 2.976C2.096 3.144 1.8 3.228 1.44 3.228C1.008 3.228 0.66 3.112 0.396 2.88C0.132 2.64 0 2.336 0 1.968C0 1.84 0.0159999 1.716 0.0479999 1.596C0.168 1.084 0.524 0.692 1.116 0.42C1.716 0.14 2.472 0 3.384 0C4.16 0 4.84 0.124 5.424 0.372C6.008 0.62 6.456 0.952001 6.768 1.368C7.08 1.776 7.236 2.216 7.236 2.688C7.236 2.832 7.216 2.992 7.176 3.168C7.08 3.56 6.912 3.876 6.672 4.116C6.44 4.348 6.096 4.544 5.64 4.704C5.192 4.856 4.568 5 3.768 5.136C3.464 5.192 3.256 5.244 3.144 5.292C3.032 5.34 2.96 5.404 2.928 5.484L2.916 5.532C2.916 5.58 2.948 5.652 3.012 5.748ZM2.052 6.528C2.372 6.528 2.64 6.62 2.856 6.804C3.072 6.98 3.18 7.2 3.18 7.464C3.188 7.656 3.132 7.844 3.012 8.028C2.9 8.212 2.74 8.364 2.532 8.484C2.324 8.596 2.092 8.652 1.836 8.652C1.508 8.652 1.236 8.56 1.02 8.376C0.812 8.184 0.708 7.952 0.708 7.68C0.708 7.496 0.764 7.316 0.876 7.14C0.996 6.964 1.156 6.82 1.356 6.708C1.564 6.588 1.796 6.528 2.052 6.528Z"/>`,
  // "Unproven": `<path fill-rule="evenodd" clip-rule="evenodd" d="M4.6875 8.32617C6.89648 8.32617 8.6875 6.53516 8.6875 4.32617C8.6875 2.11719 6.89648 0.326172 4.6875 0.326172C2.47852 0.326172 0.6875 2.11719 0.6875 4.32617C0.6875 6.53516 2.47852 8.32617 4.6875 8.32617ZM4.67188 5.2666C4.66113 5.24707 4.64551 5.22559 4.62598 5.20215C4.58691 5.14355 4.56738 5.09863 4.56738 5.06934L4.57422 5.04004C4.58691 5.00781 4.60938 4.98047 4.64258 4.95703C4.66113 4.94434 4.68262 4.93262 4.70801 4.92188C4.77637 4.8916 4.9043 4.86035 5.0918 4.8252C5.58496 4.74219 5.96973 4.65332 6.24512 4.55957C6.4043 4.50391 6.54199 4.44043 6.65625 4.37012C6.74414 4.31641 6.81934 4.25879 6.88086 4.19727C7.0293 4.04883 7.13281 3.85449 7.19141 3.61328C7.2168 3.50488 7.22852 3.40625 7.22852 3.31738C7.22852 3.11719 7.18359 2.92676 7.09277 2.74512C7.05176 2.66211 7.00098 2.58203 6.94043 2.50391C6.74805 2.24805 6.47168 2.04297 6.1123 1.89062C5.75293 1.7373 5.33398 1.66113 4.85547 1.66113C4.29395 1.66113 3.82812 1.74707 3.45801 1.91992C3.20801 2.03516 3.02539 2.18555 2.91211 2.37109C2.86035 2.45508 2.82324 2.5459 2.7998 2.64453L2.78516 2.7168C2.77539 2.76758 2.77051 2.82031 2.77051 2.87402C2.77051 3.10059 2.85156 3.28809 3.01465 3.43555C3.17676 3.57812 3.3916 3.65039 3.6582 3.65039C3.87988 3.65039 4.06152 3.59863 4.20508 3.49512C4.34766 3.3916 4.44629 3.24609 4.50098 3.05859C4.51562 2.99902 4.52246 2.93262 4.52246 2.8584C4.52246 2.70117 4.49609 2.55078 4.44141 2.4082C4.54492 2.36816 4.66602 2.34863 4.80371 2.34863C4.93164 2.34863 5.05273 2.39355 5.16602 2.48145C5.2793 2.57031 5.33594 2.69824 5.33594 2.86621C5.33594 2.92578 5.3291 2.98926 5.31348 3.05859C5.25977 3.25586 5.16113 3.41602 5.01855 3.53906C4.875 3.66211 4.6709 3.79785 4.4043 3.94531C4.1582 4.08887 3.9707 4.21191 3.84277 4.31543C3.71973 4.41406 3.63574 4.54199 3.59082 4.7002C3.57129 4.75879 3.56152 4.82324 3.56152 4.8916C3.56152 5.07422 3.63281 5.22461 3.77637 5.34277C3.92383 5.45605 4.11328 5.5127 4.3457 5.5127C4.42383 5.5127 4.49805 5.49805 4.56738 5.46875C4.63574 5.43457 4.67773 5.39258 4.69238 5.34277C4.69531 5.32227 4.68848 5.29688 4.67188 5.2666ZM4.28027 5.71777C4.20508 5.69531 4.12305 5.68359 4.03516 5.68359C3.87695 5.68359 3.73438 5.71973 3.60645 5.79395C3.48242 5.86328 3.38379 5.95215 3.31055 6.06055C3.24121 6.16895 3.20703 6.2793 3.20703 6.39258C3.20703 6.56055 3.27051 6.70312 3.39941 6.82129C3.53223 6.93555 3.69922 6.99219 3.90137 6.99219C4.05957 6.99219 4.20215 6.95703 4.33008 6.88867C4.40234 6.84766 4.46484 6.7998 4.51758 6.74609C4.55957 6.70312 4.5957 6.65723 4.62598 6.60742C4.7002 6.49414 4.73438 6.37793 4.72949 6.25977C4.72949 6.09766 4.66309 5.96191 4.53027 5.85352C4.45703 5.79102 4.37402 5.74609 4.28027 5.71777Z"/>`,
  "Intentionally false": `<path d="M7.32431 0.152344C7.66031 0.152344 7.93631 0.268344 8.15231 0.500344C8.36831 0.724344 8.47631 1.00434 8.47631 1.34034C8.47631 1.49234 8.45231 1.64834 8.40431 1.80834C8.31631 2.08034 8.18431 2.28434 8.00831 2.42034C7.84031 2.55634 7.64831 2.62434 7.43231 2.62434C7.17631 2.62434 6.92831 2.54034 6.68831 2.37234L6.08831 2.93634C6.28831 3.48034 6.45231 3.88434 6.58031 4.14834C6.70831 4.41234 6.81231 4.58434 6.89231 4.66434C6.97231 4.73634 7.06431 4.77234 7.16831 4.77234C7.22431 4.77234 7.29631 4.75234 7.38431 4.71234C7.47231 4.66434 7.54031 4.64034 7.58831 4.64034C7.63631 4.64034 7.67631 4.66434 7.70831 4.71234C7.74031 4.75234 7.75631 4.80834 7.75631 4.88034C7.75631 4.92034 7.74831 4.98034 7.73231 5.06034C7.66831 5.33234 7.53231 5.58034 7.32431 5.80434C7.11631 6.02834 6.86831 6.20834 6.58031 6.34434C6.29231 6.47234 6.00031 6.53634 5.70431 6.53634C5.40831 6.53634 5.15231 6.50034 4.93631 6.42834C4.72031 6.34834 4.50031 6.17634 4.27631 5.91234C4.05231 5.64834 3.82431 5.25234 3.59231 4.72434L3.29231 5.39634C3.10031 5.82034 2.90431 6.12034 2.70431 6.29634C2.51231 6.46434 2.28431 6.54834 2.02031 6.54834C1.66831 6.54834 1.38031 6.43634 1.15631 6.21234C0.932313 5.98834 0.820312 5.70434 0.820312 5.36034C0.820312 5.20034 0.844312 5.04434 0.892312 4.89234C0.980313 4.62034 1.10831 4.41634 1.27631 4.28034C1.45231 4.14434 1.64831 4.07634 1.86431 4.07634C2.12031 4.07634 2.36831 4.16034 2.60831 4.32834L3.20831 3.76434C3.01631 3.22034 2.86031 2.81634 2.74031 2.55234C2.62031 2.28034 2.51631 2.10834 2.42831 2.03634C2.34831 1.95634 2.25631 1.91634 2.15231 1.91634C2.09631 1.91634 2.02431 1.94034 1.93631 1.98834C1.85631 2.02834 1.79231 2.04834 1.74431 2.04834C1.62431 2.04834 1.56431 1.96434 1.56431 1.79634C1.56431 1.77234 1.57231 1.72034 1.58831 1.64034C1.69231 1.22434 1.94431 0.872344 2.34431 0.584344C2.74431 0.296344 3.17231 0.152344 3.62831 0.152344C3.91631 0.152344 4.16831 0.196344 4.38431 0.284344C4.60831 0.372344 4.82831 0.548344 5.04431 0.812344C5.26831 1.07634 5.49231 1.46034 5.71631 1.96434L6.05231 1.20834C6.22831 0.824344 6.41231 0.552344 6.60431 0.392344C6.79631 0.232344 7.03631 0.152344 7.32431 0.152344Z" />`,
  "Misleading": `<path d="M7.09981 3.62636C7.34781 3.11436 7.57981 2.73036 7.79581 2.47436H0.799805V1.97036H7.79581C7.57981 1.71436 7.34781 1.33036 7.09981 0.818359H7.51981C8.02381 1.40236 8.5518 1.83436 9.1038 2.11436V2.33036C8.5518 2.60236 8.02381 3.03436 7.51981 3.62636H7.09981Z" />`,
}

// ??
// "(org. doesn't apply rating)",
// "Explanatory"
// "unsustainable "
// "Context"
// ""

export const ratings = Object.keys(validRatings)
export const ratingAccessor = d => {
  const rating = d["rating"].toLowerCase()
  const matchingRating = ratings.find(validRating => (
    validRatings[validRating].includes(rating)
  ))
  return matchingRating || rating
}

export const organizationAccessor = d => d["organization"]

export const organizationLogos = {
  "FactCrescendo": "https://i2.wp.com/www.factcrescendo.com/wp-content/uploads/2019/07/Fact-Crescendo-Logo-01-e1569236593436.png?fit=200%2C74&ssl=1",
  "FactCrescendo Srilanka": "https://i2.wp.com/www.factcrescendo.com/wp-content/uploads/2019/07/Fact-Crescendo-Logo-01-e1569236593436.png?fit=200%2C74&ssl=1",
  "Maldita.es": "https://maldita.es/app/uploads/2019/10/maldita_logo_negro_total-60x60-c-default.jpg",
  "Newschecker": "https://cache.epapr.in/applogos/masthead_5c909c1971769.jpg",
  "Poligrafo": "https://poligrafo.sapo.pt/assets/img/poligrafo/logo-07.png",
  "Agência Lupa": "https://piaui.folha.uol.com.br/lupa/wp-content/themes/lupa2018/images/logolupa.png",
  "Demagog": "https://demagog.org.pl/wp-content/uploads/2018/12/cropped-logo_demagog.png",
}

const allTags = {
  Medical: {
    "Medical equipment": [ "respirator", "respirators", "ventilator", "ventilators", "face mask", "masks", ],
    "Medicine": [ "medication", "medicines", "ibuprofen", "tylenol", "nsaid", "nsaids", ],
    "Hospitals": [ "hospital", "doctor", "doctors", "nurse", "nurses", ],
    "Insurance": [],
    "Vaccines": [ "vaccine", ],
  },
  Governments: {
    "Trump Cluster": [ "trump", "fauci", "white house"],
    "Crime": [ "steal", "murder", "murdered", "rob", "robbed", "robbery", "killing", "cannibalism", "cocaine", "scam", "looting", ],
    "Aid": [ "donation", "donations", "donated", "donate", "donating", "giving away", "give you free", "for free", "free internet", ],
    "Laws": [ "law", "arrested", ],
    "Governments": ["government", "goverment", "shortage", "governor", "senator", "cdc", "election", "elections", "military", "suspended", "minister", "ministry", "citizen", "president", "department of health", "police", "officials", ],
    "Lockdown": [ "lock down", "locked down", "stay inside", "suspend operations", "confinement", "quarantine", "quarantined", "gatherings are banned", "must remain in their homes", "gatherings", "curfew",  ],
  },
  
  C: {
    "Prevention": [ "gloves", "prevent", "gargling", "disinfectant", "disinfectants", "protect", "will not kill", "dies at a temperature", "ward off", "prevents", "summer", "degrees", "combatting", "avoid", "social distancing", "santizer", "sanitization", "disinfect", "kill corona", "gargle", "gargling", "preventing", "can kill", "eliminates corona", "contaminated", "weed kills", "on any surface", "kills the virus", "immunity", "can be slowed", "preventative", "preventive", "kills the 2019", "leave your shoes outside", "fight against corona", "kill all the virus", "desinfectants", "sanitizer", "disinfection", "warm climate", "disinfected", "warm places", "kill the virus", "kills the new corona", "contain corona", "contain the corona", "sterilize", "kills corona", "helps against corona", "against the virus", "helps fight against corona", "stop the new corona", "fumigated", "kill the corona", ],
    "Cures": [ "cure", "cured", "remedy", "treat", "treatment", "chloroquine", "onion", "drug", "heal", "healed", "garlic", "treating", "antidote", ],
    "Symptoms": ["runny nose", "cough", ],
    "Detection": [ "detect", "test", "tests", "testing", "antibodies", "diagnose", "diagnosis", "to check if you have corona", "tell you if you have", "check for corona", "holding your breath", "hold your breath", ],
    "Risk factors": ["airborne", "in air", "increases risk", "increases coronavirus risk", "transmitted", "increases your chances of getting", "exposes people to", "prone to get", ],
  },
  D: {
    "Origins": [ "was created", "invented by", "started because", "invented the corona", "came from", "was produced by", "created the virus", "it was lab created", "lab-made corona", "responsible for the pandemic", "caused the corona", "biological warfare", "origin", "was engineered by scientists", "patented the virus", "virus is patented", "is man made", "reason for corona", "covid 19 was invented", ],
    "Conspiracies": ["chinese secret program", "weapon", "permission to kill", "spies", "cover up", "conspiracy", "bioweapon", "political war", "secret invasion", "cov is man made", "train marked with covid", ],
    "Predictions": [ "predicted", "predicts", "foresaw", "caused by", "originated in", "forseen", ],
    "Other diseases": ["the flu", "common cold", "cholera", "hiv", "rabies", "common flu", "a cold", "the cold", "the damn flu", "seasonal flu", "h1n1", ],
    "Spread": [ "tested positive", "positive", "transmit", "transmitted", "appears in", "was infected",  "new case", "confirmed cases", "is a person with", "a case", "spreading", "confirmed case", "have died", "death toll", "is in", "are infected", "cases in", "cases were reported", "are cases in", "first cases", "first case", "first corona", "infected", "fatality rate", "has reached", "died in", "case infects", "numbers", "first", "cases", "case of cov", "corpse", "corpses", "lying in street", "lying on the ground", "lying on the streets", "coffins", ],
    "Individuals": ["in intensive care", "was diagnosed", "has been diagnosed", "employee with covid", "has the corona", "has corona", "has the new corona", "has covid", ],
  },
  Other: {
    "Animals": [ "dog", "dogs", "bat", "bats", "cat", "cats", "chicken", "chickens", "deer", "deers", "lions", "crocodiles", "coyotes", "pig", "pigs", "crab", "orangutan", "whales", "pets", "sheep", "pangolin", "hornets", "fish", "dolphins", ],
    "Food": [ "supermarket", "supermarkets", "grocery", "beer", "meat", "vegetable", "fruit", "market", "markets", "alcohol", "alcoholic", "foods", "ice cream", "cabbage", "herbs", ],
    "Religion": [ "muslim", "muslims", "christians", "religion", "pray for", "islam", "islamic", "ritual", "mecca", "quran", "saint", "pilgrimage", "prayer group", ],
    "Travel": [ "borders", "enter or leave", "airport", "airports", "flights", "flight", "tourist", "tourists", "tourism", ],
    "Videos": ["video", ],
  }
}

export const tags = flatten(Object.values(allTags).map(Object.keys))
export const tagCategories = Object.keys(allTags)

let tagMap = {}
let tagColors = {}
let tagCategoryMap = {}
const tweakColor = (initialColor, numSteps) => {
  let hslColor = hsl(initialColor)
  hslColor.h +=  13 * numSteps
  hslColor.s -=  0.1 * numSteps
  hslColor.l +=  0.1 * numSteps
  return hslColor.formatHex()
}
Object.keys(allTags).forEach((category, i) => {
  let categoryColor = color(colors[i % (colors.length)]).darker(-1).brighter(-1).formatHex()
  Object.keys(allTags[category]).map(tag => {
    tagMap[tag] = allTags[category][tag]
    tagCategoryMap[tag] = category
    // tagColors[tag] = tweakColor(colors[i % (colors.length)], i - 2)
    tagColors[tag] = colors[i % (colors.length)]
  })
})
tagColors[""] = "#656275"
export {tagCategoryMap}
export {tagColors}

export const getMatchingTags = str => {
  const normalizedStr = str.toLowerCase().replace(/-/g, " ").replace(/[^0-9a-z ]/gi, '')
  const words = (normalizedStr.match(/\S+\s*/g) || []).map(d => d.trim())
  const matchingTags = tags.filter(tag => (
      [tag.toLowerCase(), ...tagMap[tag]].filter(keyword => (
        keyword.split(" ").length > 1
          ? normalizedStr.includes(keyword)
          : words.includes(keyword)
      )).length > 0
  ))

  return matchingTags
}
export const tagsAccessor = d => d["tags"] || []
//   const str = titleAccessor(d).toLowerCase()
//   return getMatchingTags(str)
// }

export const tagAccessor = d => tagsAccessor(d)[0] || ""


export const countryNameMap = {
  USA: "United States of America",
  "United States": "United States of America",
  UK: "United Kingdom",
  BiH: "Bosnia and Herzegovina",
  "South africa": "South Africa",
  Spasin: "Spain",
  Mayanmar: "Myanmar",
  "India/Srilanka": "Sri Lanka",
  Kaxakhstan: "Kazakhstan",
  Korea: "South Korea",
  // "Hong Kong":
  México: "Mexico",
  "North Macedonia": "Macedonia",
  "DR Congo": "Democratic Republic of the Congo",
}
export const countryAccessor = d => countryNameMap[d["countries"][0]] || d["countries"][0]
export const countriesAccessor = d => d["countries"].map(d => countryNameMap[d] || d)
