let numStr = '<b style="color:red;">'
let dayStr = '<b style="color:green;">'

const signonURL = 'https://psnine.com/set/qidao/ajax'

export const fetchSignOn = function () {

  return new Promise((resolve) => {
    fetch(signonURL, {
      method: 'POST',
      headers: {
        'Accept': '*/*'
      }
    }).then((response) => {
      return response.text()
    }).then(html => {
      if (html === '今天已经签过了') {
        return resolve('今天已经签过了')
      }
      let num = parseSignOn(html, numStr)
      let day = parseDays(html, dayStr)
      resolve(num + '\r\n' + day)
    })
  })
}

const parseSignOn = (source, pattern) => {
  let index = source.indexOf(pattern)
  let str = ''
  if (index !== -1) {
    index += pattern.length
    while (source[index] !== '<') {
      str += source[index]
      index++
    }
  }
  return '本次祈祷得到 ' + str + ' 铜币'
}

const parseDays = (source, pattern) => {
  let index = source.indexOf(pattern)
  let str = ''
  if (index !== -1) {
    index += pattern.length
    while (source[index] !== '<') {
      str += source[index]
      index++
    }
  }
  return '恭喜你已签到 ' + str + ' 天了'
}

export const safeSignOn = async function (psnid) {
  if (typeof psnid === 'undefined') return

  let data = await fetchSignOn()

  return data
}