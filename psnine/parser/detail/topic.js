import parser from 'cheerio-without-node-native'

export default function (html) {
  const $ = parser.load(html, {
    decodeEntities: false
  })

  const all = $('.main .box')
  const titleArr = all.children().first().text().split('\n').map(item => item.replace(/\t/g, '').replace(/\&nbsp;/igm, '').trim()).filter(item => item)
  const titleText =  all.find('.pd10').first().children().first().html().replace(/\<br\>/igm, '\n')
  const titleInfo = {
    title: titleText,
    psnid: titleArr[1],
    date: titleArr[2].replace('编辑', ''),
    reply: titleArr[3],
    node: titleArr.slice(5)
  }

  const body = all.children().filter(function(i, el) {
    return $(this).attr('class') === 'content pd10';
  })
  const contentInfo = {
    html: `<div>${body.html()}</div>`
  }
  
  const commentList = []
  all.last().find('.post').each(function(i, elem) {
    const $this = $(this)
    const id = $this.attr('id')
    if (!id) {
      commentList.push({
        isGettingMoreComment: true
      })
      return
    }
    const img = $this.find('img').attr('src')
    const psnid = $this.find('.meta a').text().replace('顶回复', '')
    let content = $this.find('.content').length ? 
        $this.find('.content').html().replace(/\<br\>/igm, '\n').replace('\n', '').replace(/\t/igm, '') : 'not found'
    const date = $this.find('.meta').text().split('\n').map(item => item.replace(/\t/g, '')).filter(item => item.trim()).pop()
    commentList.push({
      id,
      img,
      psnid,
      content,
      date,
      isGettingMoreComment: false
    })
  })

  return {
    titleInfo,
    contentInfo,
    commentList: commentList
  }
}