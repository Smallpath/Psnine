import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableNativeFeedback,
  Clipboard
} from 'react-native'

import { standardColor, idColor } from '../constant/colorConfig'
import entities from 'entities'

import {
  postReply
} from '../dao/post'
import {
  updown
} from '../dao/sync'

import { FlatlistItemProp, FlatlistItemState, ModalList } from '../interface'

declare var global

interface ExtendedProp extends FlatlistItemProp {
  modalList?: ModalList[]
  ITEM_HEIGHT?: number
  onLongPress?: (...args) => any
  preFetch?: (...args) => any
  index?: number
}

interface ExtendedState extends FlatlistItemState {
  modalIndex: number
}

export default class ComplexComment extends React.PureComponent<ExtendedProp, ExtendedState> {

  constructor(props) {
    super(props)

    this.state = {
      modalVisible: false,
      modalIndex: -1
    }

    this.initModal()
  }

  modalItems: any
  initModal = () => {
    const { modeInfo, rowData } = this.props
    const modalItems: any = []

    modalItems.push({
      text: '回复',
      onPress: () => {
        requestAnimationFrame(() => {
          this.onCommentLongPress(rowData)
        })
      }
    })
    modalItems.push({
      text: '点赞',
      onPress: () => {
        requestAnimationFrame(() => {
          updown({
            type: 'comment',
            param: rowData.id,
            updown: 'up'
          }).then(res => res.text()).then(html => {
            if (html) {
              return global.toast(`点赞失败: ${html}`)
            }
            global.toast('点赞成功')
          })
        })
      }
    })
    modalItems.push({
      text: '复制',
      onPress: () => {
        requestAnimationFrame(() => {
          Clipboard.setString(entities.decodeHTML(rowData.text).replace(/<.*?>/igm, ''))
          global.toast('评论文字已复制到剪贴板')
        })
      }
    })

    if (rowData.caina && rowData.isAccepted === false) {
      modalItems.push({
        text: '采纳',
        onPress: () => {
          requestAnimationFrame(() => {
            postReply({
              qid: rowData.qid,
              psnid: rowData.psnid
            }, 'caina').then(res => { return res.text() }).then(() => {
              return global.toast('采纳成功')
            }).catch(err => global.toast(err.toString()))
          })
        }
      })
    }
    if (rowData.psnid === modeInfo.settingInfo.psnid) {
      modalItems.push({
        text: '编辑',
        onPress: () => {
          requestAnimationFrame(() => {
            this.props.navigation.navigate('Reply', {
              type: 'comment',
              id: (rowData.id.match(/\d+/) || [0])[0],
              content: rowData.editcomment,
              shouldSeeBackground: true
            })
          })
        }
      })
    }

    this.modalItems = modalItems
  }

  showDialog = () => {
    const options = {
      items: this.modalItems.map(item => item.text),
      itemsCallback: (id) => this.setState({
        modalVisible: false
      }, () => this.modalItems[id].onPress())
    }
    const dialog = new global.DialogAndroid()
    dialog.set(options)
    dialog.show()
  }

  renderSonComment = (list, parentRowData) => {
    const { modeInfo, onLongPress } = this.props

    const result = list.map((rowData, index) => {
      const modalItems: any = [{
        text: '回复',
        onPress: () => {
          requestAnimationFrame(() => {
            this.onCommentLongPress(parentRowData, rowData.psnid)
          })
        }
      }, {
        text: '复制',
        onPress: () => {
          requestAnimationFrame(() => {
            Clipboard.setString(entities.decodeHTML(rowData.text).replace(/<.*?>/igm, ''))
            global.toast('评论文字已复制到剪贴板')
          })
        }
      }]

      return (
        <View key={rowData.id || index} style={{
            backgroundColor: modeInfo.brighterLevelOne,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderBottomColor: modeInfo.hairColor,
            borderTopColor: modeInfo.hairColor,
            padding: 5
        }}>
          {
            this.state.modalIndex !== -1 && onLongPress && (
              <global.MyDialog modeInfo={modeInfo}
                modalVisible={this.state.modalIndex === index}
                onDismiss={() => { this.setState({ modalIndex: -1 }) }}
                onRequestClose={() => { this.setState({ modalIndex: -1 }) }}
                renderContent={() => (
                  <View style={{
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    backgroundColor: modeInfo.backgroundColor,
                    position: 'absolute',
                    left: 30,
                    right: 30,
                    paddingVertical: 15,
                    elevation: 4,
                    opacity: 1,
                    borderRadius: 2
                  }}>
                    {this.modalItems.map((item, index) => (
                      <TouchableNativeFeedback key={index} onPress={item.onPress}>
                        <View style={{
                          height: 50, paddingVertical: 10, paddingLeft: 20 , alignSelf: 'stretch', alignContent: 'stretch', justifyContent: 'center'
                        }}>
                          <Text style={{textAlignVertical: 'center', fontSize: 18, color: modeInfo.standardTextColor}}>{item.text}</Text>
                        </View>
                      </TouchableNativeFeedback>
                    ))}
                  </View>
                )} />
            )
          }
          <Text
            onLongPress={() => {
              if (global.isIOS) {
                return this.setState({
                  modalIndex: index
                })
              }
              const options = {
                items: modalItems.map(item => item.text),
                itemsCallback: (id) => this.setState({
                  modalIndex: -1
                }, () => modalItems[id].onPress())
              }
              const dialog = new global.DialogAndroid()
              dialog.set(options)
              dialog.show()
            }}
          >
            <global.HTMLView
              value={rowData.text}
              modeInfo={modeInfo}
              stylesheet={styles}
              imagePaddingOffset={30 + 50 + 10}
              shouldForceInline={true}
            />
          </Text>
        </View>
      )
    })
    return result
  }

  onCommentLongPress = (rowData, name = '') => {
    // if (this.isReplyShowing === true) return
    const { preFetch } = this.props

    const cb = () => {
      this.props.navigation.navigate('Reply', {
        type: 'comson',
        id: rowData.id.replace('comment-', ''),
        at: name ? name : rowData.psnid,
        callback: () => {
          fetch(`https://psnine.com/get/comson?id=${rowData.id.replace('comment-', '')}`).then(() => {
            preFetch && preFetch()
          })
        },
        shouldSeeBackground: true
      })
    }
    cb()
  }

  render() {
    const { modeInfo, rowData, onLongPress, index } = this.props
    return (
      <View key={rowData.id || index} style={{
        backgroundColor: rowData.isAccepted ? modeInfo.tintColor : modeInfo.backgroundColor,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: modeInfo.brighterLevelOne
      }}>
        <TouchableNativeFeedback
          onLongPress={!onLongPress ? undefined : () => {
            global.isIOS ? this.setState({
              modalVisible: true
            }) : this.showDialog()
          }}
          useForeground={true}
          background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
        >
          <View style={{ flex: 1, flexDirection: 'row', padding: 12 }}>
            {
              this.state.modalVisible && onLongPress && (
                <global.MyDialog modeInfo={modeInfo}
                  modalVisible={this.state.modalVisible}
                  onDismiss={() => { this.setState({ modalVisible: false }) }}
                  onRequestClose={() => { this.setState({ modalVisible: false }) }}
                  renderContent={() => (
                    <View style={{
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      backgroundColor: modeInfo.backgroundColor,
                      position: 'absolute',
                      left: 30,
                      right: 30,
                      paddingVertical: 15,
                      elevation: 4,
                      opacity: 1,
                      borderRadius: 2
                    }}>
                      {this.modalItems.map((item, index) => (
                        <TouchableNativeFeedback key={index} onPress={item.onPress}>
                          <View style={{
                            height: 50, paddingVertical: 10, paddingLeft: 20 , alignSelf: 'stretch', alignContent: 'stretch', justifyContent: 'center'
                          }}>
                            <Text style={{textAlignVertical: 'center', fontSize: 18, color: modeInfo.standardTextColor}}>{item.text}</Text>
                          </View>
                        </TouchableNativeFeedback>
                      ))}
                    </View>
                  )} />
              )
            }
            <Image
              source={{ uri: rowData.avatar }}
              style={styles.avatar}
            />

            <View style={{ marginLeft: 10, flex: 1, flexDirection: 'column' }}>
              <global.HTMLView
                value={rowData.text}
                modeInfo={modeInfo}
                stylesheet={styles}
                imagePaddingOffset={30 + 50 + 10}
                shouldForceInline={true}
              />

              <View style={{ flex: 1.1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ flex: -1, color: modeInfo.standardColor, textAlign: 'center', textAlignVertical: 'center' }} onPress={
                  () => {
                    this.props.navigation.navigate('Home', {
                      title: rowData.psnid,
                      id: rowData.psnid,
                      URL: `https://psnine.com/psnid/${rowData.psnid}`
                    })
                  }
                }>{rowData.psnid}</Text>
                <Text style={{ flex: -1, color: modeInfo.standardTextColor, textAlign: 'center', textAlignVertical: 'center' }}>
                  {!!rowData.count && isNaN(rowData.count) === false && <Text
                    style={{ flex: -1, color: modeInfo.accentColor }}>+{rowData.count}   </Text>}
                  {rowData.date}
                </Text>
              </View>

              { rowData.commentList.length !== 0 && (<View style={{ backgroundColor: modeInfo.brighterLevelOne}}>
                {this.renderSonComment(rowData.commentList, rowData)}
              </View>)}
            </View>

          </View>
        </TouchableNativeFeedback>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5FCFF'
  },
  toolbar: {
    backgroundColor: standardColor,
    height: 56,
    elevation: 4
  },
  selectedTitle: {},
  avatar: {
    width: 50,
    height: 50
  },
  a: {
    fontWeight: '300',
    color: idColor // make links coloured pink
  }
})