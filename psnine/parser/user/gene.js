import parser from 'cheerio-without-node-native'

export default function (html) {
  const $ = parser.load(html, {
    decodeEntities: true
  })

  const list = []

  $('div.box ul.list li').each(function (i, elem) {
    const $this = $(this)
    const img = $this.find('img').attr('src')
    const thumbs = Array.from($this.find('img').map(function (i, elem) {
      return $(this).attr('src')
    }).filter(index => !!index))

    const text = $this.text()
    const arr = text.split('\n').map(item => item.replace(/\t/g, '').trim()).filter(item => item)

    const matched = $this.find('.content')[0].parent.attribs.href.match(/\d+/)
    const id = matched ? matched[0] : arr[1] + arr[2]
    const nextArr = arr.slice(-3)
    let circle = $this.find('a.node').text() || ''
    let base = 1
    if (!circle) base = 0
    const mock = {
      circle,
      content: arr.slice(base, -3).join('\n'),
      psnid: nextArr[0],
      date: nextArr[1],
      avatar: img,
      id,
      thumbs,
      count: nextArr[2],
      type: nextArr[2],
      circleHref: $this.find('a.node').attr('href')
    }
    // if (i === 0)
    //   console.log(mock.circleHref)
    list.push(mock)
  })
  // console.log(list.length)
  const page = []
  
  $('.page li a').each(function (i, elem) {
    const $this = $(this)
    const url = 'https://psnine.com' + $this.attr('href')
    const text = $this.text()
    page.push({
      url,
      text,
      type: $this.attr('href').includes('javascript:') ? 'disable' : 'enable'
    })
  })
  return {
    list,
    page,
    numberPerPage: 30,
    numPages: page.length >= 2 ? parseInt(page[page.length - 2].text) : 1,
    len: parseInt($('.page li').find('.disabled a').last().html())
  }
}