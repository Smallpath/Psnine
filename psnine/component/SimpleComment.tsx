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
import { FlatlistItemProp, FlatlistItemState } from '../interface'
import { updown } from '../dao/sync'

interface ExtendedProp extends FlatlistItemProp {
  index?: any
  onLongPress?: (...args) => any
  callback?: (...arsg) => any
}

interface ModalItems {
  text: string
  onPress: () => any
}
declare var global

export default class extends React.PureComponent<ExtendedProp, FlatlistItemState> {

  constructor(props) {
    super(props)

    this.state = {
      modalVisible: false
    }

    this.initModal()
  }

  modalItems: any
  initModal = () => {
    const { rowData, modeInfo, onLongPress, callback = () => {} } = this.props
    const modalItems: ModalItems[] = []

    modalItems.push({
      text: '回复',
      onPress: () => {
        this.setState({
          modalVisible: false
        }, () => {
          requestAnimationFrame(() => {
            onLongPress && onLongPress()
          })
        })
      }
    })

    modalItems.push({
      text: '点赞',
      onPress: () => {
        this.setState({
          modalVisible: false
        }, () => {
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
        })
      }
    })

    modalItems.push({
      text: '复制',
      onPress: () => {
        this.setState({
          modalVisible: false
        }, () => {
          requestAnimationFrame(() => {
            Clipboard.setString(entities.decodeHTML(rowData.content).replace(/<.*?>/igm, ''))
            global.toast('评论文字已复制到剪贴板')
          })
        })
      }
    })

    if (rowData.psnid === modeInfo.settingInfo.psnid) {
      modalItems.push({
        text: '编辑',
        onPress: () => {
          this.setState({
            modalVisible: false
          }, () => {
            requestAnimationFrame(() => {
              this.props.navigation.navigate('Reply', {
                type: 'comment',
                id: (rowData.id.match(/\d+/) || [0])[0],
                content: rowData.editcomment,
                shouldSeeBackground: true,
                callback
              })
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

  render() {
    const { modeInfo, rowData, index, onLongPress } = this.props
    return (
      <View key={rowData.id || index} style={{
        borderBottomWidth: StyleSheet.hairlineWidth,
        backgroundColor: modeInfo.backgroundColor,
        borderBottomColor: modeInfo.hairColor
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
              source={{ uri: rowData.img }}
              style={styles.avatar}
            />

            <View style={{ marginLeft: 10, flex: 1, flexDirection: 'column' }}>
              <global.HTMLView
                value={rowData.content}
                modeInfo={modeInfo}
                stylesheet={styles}
                onImageLongPress={(url) => this.props.navigation.navigate('ImageViewer', {
                  images: [
                    { url }
                  ]
                })}
                imagePaddingOffset={30 + 50 + 10}
              />

              <View style={{ flex: 1.1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text selectable={false} style={{
                  flex: -1, color: modeInfo.standardColor, textAlign: 'center', textAlignVertical: 'center'
                }} onPress={
                  () => {
                    this.props.navigation.navigate('Home', {
                      title: rowData.psnid,
                      id: rowData.psnid,
                      URL: `https://psnine.com/psnid/${rowData.psnid}`
                    })
                  }
                }>{rowData.psnid}</Text>
                <Text selectable={false} style={{
                  flex: -1, color: modeInfo.standardTextColor, textAlign: 'center', textAlignVertical: 'center'
                }}>
                {!!rowData.count && isNaN(rowData.count) === false && <Text style={{
                  flex: -1, color: modeInfo.accentColor }}>+{rowData.count}   </Text>}
                  {rowData.date}
                </Text>
              </View>

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