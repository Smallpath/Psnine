import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableNativeFeedback,
  InteractionManager,
  ActivityIndicator,
  Animated,
  FlatList,
  Linking,
  Alert
} from 'react-native'

import Ionicons from 'react-native-vector-icons/Ionicons'
import { standardColor, idColor, accentColor } from '../../constant/colorConfig'
import SimpleComment from '../../component/SimpleComment'
import {
  getBattleAPI
} from '../../dao'
import {
  close
} from '../../dao/sync'

declare var global

/* tslint:disable */
let toolbarActions = [
  {
    title: '回复', iconName: 'md-create', show: 'always', iconSize: 22, onPress: function () {
      const { params } = this.props.navigation.state
      if (this.isReplyShowing === true) return
      this.props.navigation.navigate('Reply', {
        type: params.type,
        id: params.rowData.id,
        callback: this.preFetch,
        shouldSeeBackground: true
      })
      return
    }
  },
  {
    title: '刷新', iconName: 'md-refresh', show: 'never', onPress: function () {
      this.preFetch()
    }
  },
  {
    title: '在浏览器中打开', iconName: 'md-refresh', show: 'never', onPress: function () {
      const { params = {} } = this.props.navigation.state
      Linking.openURL(params.URL).catch(err => global.toast(err.toString()))
    }
  },
  {
    title: '分享', iconName: 'md-share-alt', show: 'never', onPress: function () {
      try {
        const { params } = this.props.navigation.state
        global.Share.open({
          url: params.URL,
          message: '[PSNINE] ' + this.state.data.titleInfo.title,
          title: 'PSNINE'
        }).catch((err) => { err && console.log(err) })
      } catch (err) { }
    }
  }
]
/* tslint:enable */

class CommunityTopic extends Component<any, any> {

  static navigationOptions({ navigation }) {
    return {
      title: navigation.state.params.title || '约战'
    }
  }
  constructor(props) {
    super(props)
    this.state = {
      data: false,
      isLoading: true,
      mainContent: false,
      rotation: new Animated.Value(1),
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
      openVal: new Animated.Value(0),
      modalVisible: false,
      modalOpenVal: new Animated.Value(0),
      topicMarginTop: new Animated.Value(0)
    }
  }

  componentWillMount() {
    this.preFetch()
  }

  preFetch = () => {
    const { params } = this.props.navigation.state
    this.setState({
      isLoading: true
    })
    InteractionManager.runAfterInteractions(() => {
      getBattleAPI(params.URL).then(data => {

        const html = data.contentInfo.html
        const emptyHTML = '<div></div>'
        this.hasContent = html !== emptyHTML
        this.hasTrophyTable = data.contentInfo.trophyTable.length !== 0
        this.hasComment = data.commentList.length !== 0
        this.hasReadMore = this.hasComment ? data.commentList[0].isGettingMoreComment === true ? true : false : false
        this.setState({
          data,
          mainContent: html,
          commentList: data.commentList,
          isLoading: false
        })
      })
    })
  }

  handleImageOnclick = (url) => this.props.navigation.navigate('ImageViewer', {
    images: [
      { url }
    ]
  })

  hasContent = false
  renderContent = (html) => {
    const { modeInfo } = this.props.screenProps
    return (
      <View key={'content'} style={{
        elevation: 1,
        margin: 5,
        marginTop: 0,
        backgroundColor: modeInfo.backgroundColor,
        padding: 10
      }}>
        <global.HTMLView
          value={html}
          modeInfo={modeInfo}
          shouldShowLoadingIndicator={true}
          stylesheet={styles}
          imagePaddingOffset={30}
          onImageLongPress={this.handleImageOnclick}
        />
      </View>
    )
  }

  renderGame = (rowData) => {
    const { modeInfo } = this.props.screenProps

    return (
      <View style={{ elevation: 1, margin: 5, marginTop: 0, backgroundColor: modeInfo.backgroundColor }}>
        <View style={{
          backgroundColor: modeInfo.backgroundColor
        }}>
          <TouchableNativeFeedback
            onPress={() => {
              this.props.navigation.navigate('GamePage', {
                URL: rowData.url,
                title: rowData.title,
                rowData,
                type: 'game'
              })
            }}
            useForeground={true}
            background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
          >
            <View style={{ flex: 1, flexDirection: 'row', padding: 12 }}>
              <Image
                source={{ uri: rowData.avatar }}
                style={[styles.avatar, { width: 91 }]}
              />

              <View style={{ marginLeft: 10, flex: 1, flexDirection: 'column' }}>
                <Text
                  ellipsizeMode={'tail'}
                  numberOfLines={3}
                  style={{ flex: 2.5, color: modeInfo.titleTextColor }}>
                  {rowData.title}
                </Text>

                <View style={{ flex: 1.1, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text selectable={false} style={{ flex: -1,
                    color: modeInfo.standardColor, textAlign: 'center', textAlignVertical: 'center' }} onPress={
                    () => {
                      this.props.navigation.navigate('Home', {
                        title: rowData.psnid,
                        id: rowData.psnid,
                        URL: `https://psnine.com/psnid/${rowData.psnid}`
                      })
                    }
                  }>{rowData.psnid}</Text>
                  <Text selectable={false} style={{ flex: -1,
                    color: modeInfo.standardTextColor, textAlign: 'center', textAlignVertical: 'center' }}>{rowData.date}</Text>
                </View>

              </View>

            </View>
          </TouchableNativeFeedback>
        </View>
      </View>
    )
  }

  hasTrophyTable = false
  renderTrophyTable = (trophyTable) => {
    const { modeInfo } = this.props.screenProps
    const list: any[] = []
    for (const rowData of trophyTable) {
      list.push(
        <View key={rowData.id || (list.length - 1)} style={{
          backgroundColor: modeInfo.backgroundColor
        }}>
          <TouchableNativeFeedback
            onPress={() => {
              this.props.navigation.navigate('Trophy', {
                URL: rowData.href,
                title: '@' + rowData.title,
                rowData,
                type: 'trophy'
              })
            }}
            useForeground={true}

            background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
          >
            <View pointerEvents='box-only' style={{ flex: 1, flexDirection: 'row', padding: 12 }}>
              <Image
                source={{ uri: rowData.avatar }}
                style={[styles.avatar, { width: 91 }]}
              />

              <View style={{ marginLeft: 10, flex: 1, flexDirection: 'column', alignContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text
                    ellipsizeMode={'tail'}
                    style={{ flex: -1, color: modeInfo.titleTextColor }}>
                    {rowData.title}
                  </Text>
                  <Text selectable={false} style={{
                    flex: -1,
                    marginLeft: 5,
                    color: idColor,
                    textAlign: 'center',
                    textAlignVertical: 'center'
                  }}>{rowData.tip}</Text>
                </View>

                <View style={{ flex: 1.1, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text selectable={false} style={{
                    flex: -1,
                    color: modeInfo.standardTextColor,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    fontSize: 10
                  }}>{rowData.text}</Text>
                  <Text selectable={false} style={{
                    flex: 1,
                    color: modeInfo.standardTextColor,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    fontSize: 10
                  }}>{rowData.rare}</Text>
                </View>

              </View>

            </View>
          </TouchableNativeFeedback>
        </View>
      )
    }
    return (
      <View style={{ elevation: 1, margin: 5, marginTop: 0, backgroundColor: modeInfo.backgroundColor }}>
        {list}
      </View>
    )
  }

  hasComment = false
  hasReadMore = false
  renderComment = (commentList) => {
    const { modeInfo } = this.props.screenProps
    const { navigation } = this.props
    const list: any[] = []
    let readMore: any = null
    for (const rowData of commentList) {
      if (rowData.isGettingMoreComment === false) {
        list.push(
          <SimpleComment key={rowData.id || list.length}  {...{
            navigation,
            rowData,
            modeInfo,
            onLongPress: () => {
              this.onCommentLongPress(rowData)
            },
            index: list.length
          }} />
        )
      } else {
        readMore = (
          <View key={'readmore'} style={{
            backgroundColor: modeInfo.backgroundColor,
            elevation: 1
          }}>
            <TouchableNativeFeedback
              onPress={() => {
                this._readMore(`${this.props.navigation.state.params.URL}/comment?page=1`)
              }}
              useForeground={true}
              background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
            >
              <View pointerEvents='box-only' style={{ flex: 1, flexDirection: 'row', padding: 12 }}>

                <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ flex: 2.5, color: accentColor }}>{'阅读更多评论'}</Text>

                </View>

              </View>
            </TouchableNativeFeedback>
          </View>
        )
      }
    }
    const shouldMarginTop = !this.hasContent && !this.hasTrophyTable
    return (
      <View style={{ marginTop: shouldMarginTop ? 5 : 0 }}>
        {readMore && <View style={{ elevation: 1,
          margin: 5, marginTop: 0, marginBottom: 5, backgroundColor: modeInfo.backgroundColor }}>{readMore}</View>}
        <View style={{ elevation: 1, margin: 5, marginTop: 0, backgroundColor: modeInfo.backgroundColor }}>
          {list}
        </View>
        {readMore && <View style={{ elevation: 1,
          margin: 5, marginTop: 0, marginBottom: 5, backgroundColor: modeInfo.backgroundColor }}>{readMore}</View>}
      </View>
    )
  }

  isReplyShowing = false
  onCommentLongPress = (rowData) => {
    if (this.isReplyShowing === true) return
    const { params } = this.props.navigation.state
    this.props.navigation.navigate('Reply', {
      type: params.type,
      id: params.rowData.id,
      at: rowData.psnid,
      shouldSeeBackground: true
    })
  }

  _readMore = (URL) => {
    this.props.navigation.navigate('CommentList', {
      URL
    })
  }

  render() {
    const { params } = this.props.navigation.state
    // console.log('CommunityTopic.js rendered');
    const { modeInfo } = this.props.screenProps
    const { data: source } = this.state
    const data: any[] = []
    const renderFuncArr: any[] = []
    const shouldPushData = !this.state.isLoading
    if (shouldPushData) {
      data.push(source.contentInfo.game)
      renderFuncArr.push(this.renderGame)
    }
    if (shouldPushData && this.hasTrophyTable) {
      data.push(source.contentInfo.trophyTable)
      renderFuncArr.push(this.renderTrophyTable)
    }
    if (shouldPushData && this.hasContent) {
      data.push(this.state.mainContent)
      renderFuncArr.push(this.renderContent)
    }
    if (shouldPushData && this.hasComment) {
      data.push(this.state.commentList)
      renderFuncArr.push(this.renderComment)
    }
    const targetActions: any = toolbarActions.slice()
    if (shouldPushData && source.contentInfo.game && source.contentInfo.game.edit) {
      targetActions.push(
        {
          title: '编辑', iconName: 'md-create', show: 'never', iconSize: 22, onPress: function () {
            const { navigation } = this.props
            navigation.navigate('NewBattle', {
              URL: source.contentInfo.game.edit
            })
          }
        }
      )
      targetActions.push({
        title: '关闭', iconName: 'md-create', iconSize: 22, show: 'never',
        onPress: function () {
          const onPress = () => close({
            type: 'battle',
            id: params.URL.split('/').pop()
          }).then(res => res.text()).then(html => html ? global.toast('关闭失败: ' + html) : global.toast('关闭成功'))
          Alert.alert('提示', '关闭后，只有管理员和发布者可以看到本帖', [
            {
              text: '取消'
            },
            {
              text: '继续关闭',
              onPress: () => onPress()
            }
          ])
        }
      })
    }

    return (
      <View
        style={{ flex: 1, backgroundColor: modeInfo.backgroundColor }}
        onStartShouldSetResponder={() => false}
        onMoveShouldSetResponder={() => false}
      >
        <Ionicons.ToolbarAndroid
          navIconName='md-arrow-back'
          overflowIconName='md-more'
          iconColor={modeInfo.isNightMode ? '#000' : '#fff'}
          title={params.title ? params.title : `No.${params.rowData.id}`}
          titleColor={modeInfo.isNightMode ? '#000' : '#fff'}
          style={[styles.toolbar, { backgroundColor: modeInfo.standardColor }]}
          actions={targetActions}
          onIconClicked={() => {
            this.props.navigation.goBack()
          }}
          onActionSelected={(index) => targetActions[index].onPress.bind(this)()}
        />
        {this.state.isLoading && (
          <ActivityIndicator
            animating={this.state.isLoading}
            style={{
              flex: 999,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            color={modeInfo.accentColor}
            size={50}
          />
        )}
        {!this.state.isLoading && <FlatList style={{
          flex: -1,
          backgroundColor: modeInfo.standardColor
        }}
          ref={flatlist => this.flatlist = flatlist}
          data={data}
          keyExtractor={(item, index) => item.id || index}
          renderItem={({ item, index }) => {
            return renderFuncArr[index](item)
          }}
          extraData={this.state}
          windowSize={999}
          disableVirtualization={true}
          viewabilityConfig={{
            minimumViewTime: 3000,
            viewAreaCoveragePercentThreshold: 100,
            waitForInteraction: true
          }}
        >
        </FlatList>
        }
      </View>
    )
  }

  flatlist: any = false
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
  selectedTitle: {
    // backgroundColor: '#00ffff'
    // fontSize: 20
  },
  avatar: {
    width: 50,
    height: 50
  },
  a: {
    fontWeight: '300',
    color: idColor // make links coloured pink
  }
})

export default CommunityTopic