import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableNativeFeedback
} from 'react-native'

import { FlatlistItemProp, FlatlistItemState, ModalList } from '../interface'

interface ExtendedProp extends FlatlistItemProp {
  modalList?: ModalList[]
}

declare var global

export default class TradeItem extends React.PureComponent<ExtendedProp, FlatlistItemState> {
  constructor(props) {
    super(props)

    this.state = {
      modalVisible: false
    }
  }

  showDialog = () => {
    const { rowData, modalList = [] } = this.props
    const options = {
      items: modalList.map(item => item.text),
      itemsCallback: (id) => this.setState({
        modalVisible: false
      }, () => modalList[id].onPress(rowData))
    }
    const dialog = new global.DialogAndroid()
    dialog.set(options)
    dialog.show()
  }

  _onRowPressed = (rowData) => {
    const { navigation } = this.props
    // const URL = getBattleURL(rowData.id);
    navigation.navigate('TradeTopic', {
      URL: rowData.href,
      title: rowData.title,
      rowData,
      type: 'trade',
      shouldBeSawBackground: true
    })
  }

  render() {
    const { modeInfo, rowData, modalList = [] } = this.props

    let imageArr = rowData.thumbs

    const imageItems = imageArr.map((value, index) => (<Image key={rowData.id + '' + index} source={{ uri: value }} style={styles.geneImage} />))
    const { numColumns = 1 } = modeInfo
    return (
      <View style={{
        marginVertical: 3.5,
        marginHorizontal: numColumns === 1 ? 0 : 3.5,
        backgroundColor: modeInfo.backgroundColor,
        flex: numColumns === 1 ? -1 : 1,
        elevation: 1
      }}>
        <TouchableNativeFeedback
          onPress={() => { this._onRowPressed(rowData) }}
          onLongPress={modalList.length ? () => {
            if (global.isIOS) {
              this.setState({
                modalVisible: true
              })
            } else {
              this.showDialog()
            }
          } : undefined}
          background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
        >
          <View style={{ flex: 1, flexDirection: 'row', padding: 12 }}>
            <Image
              source={{ uri: rowData.avatar }}
              style={styles.avatar}
            />
            {
              this.state.modalVisible && modalList.length && (
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
                  {
                    modalList.map((item, index) => (
                      <TouchableNativeFeedback key={index + item.text} onPress={() => {
                          this.setState({
                            modalVisible: false
                          }, () => {
                            item.onPress(rowData)
                          })
                        }}>
                        <View style={{
                          height: 50, paddingVertical: 10, paddingLeft: 20 , alignSelf: 'stretch',
                          alignContent: 'stretch', justifyContent: 'center'
                        }}>
                          <Text style={{textAlignVertical: 'center', fontSize: 18, color: modeInfo.standardTextColor}}>{item.text}</Text>
                        </View>
                      </TouchableNativeFeedback>
                    ))
                  }
                  </View>
                )} />
              )
            }
            <View style={{ marginLeft: 10, flex: 1, flexDirection: 'column' }}>

              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 2 }}>
                <Text
                  ellipsizeMode={'tail'}
                  numberOfLines={2}
                  style={{ flex: -1, color: modeInfo.titleTextColor }}>
                  {rowData.title}
                </Text>
                <Text style={{
                  fontSize: 12, flex: -1, color: modeInfo.standardTextColor, alignSelf: 'flex-end', textAlign: 'center', textAlignVertical: 'center'
                }}>{rowData.price}</Text>
              </View>

              <Text
                style={{ flex: -1, color: modeInfo.standardTextColor, fontSize: 12 }}>
                {rowData.content}
              </Text>
              <View style={{ flex: -1, flexDirection: 'row', flexWrap: 'wrap', marginTop: 5, marginBottom: 5 }}>
                {imageItems}
              </View>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, flex: -1, color: modeInfo.standardColor, textAlign: 'center', textAlignVertical: 'center' }} onPress={
                  () => {
                    this.props.navigation.navigate('Home', {
                      title: rowData.psnid,
                      id: rowData.psnid,
                      URL: `https://psnine.com/psnid/${rowData.psnid}`
                    })
                  }
                }>{rowData.psnid}</Text>
                <Text style={{
                  fontSize: 12, flex: -1, color: modeInfo.standardTextColor, textAlign: 'center', textAlignVertical: 'center'
                }}>{rowData.date}</Text>
                <Text style={{
                  fontSize: 12, flex: -1, color: modeInfo.standardTextColor, textAlign: 'center', textAlignVertical: 'center'
                }}>{rowData.count}</Text>
                <Text style={{
                  fontSize: 12, flex: -1, color: modeInfo.standardTextColor, textAlign: 'center', textAlignVertical: 'center'
                }}>{rowData.circle}</Text>
              </View>

            </View>

          </View>
        </TouchableNativeFeedback>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  avatar: {
    width: 50,
    height: 50
  }
})
