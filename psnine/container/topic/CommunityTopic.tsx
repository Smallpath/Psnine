import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableNativeFeedback,
  InteractionManager,
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Linking,
  Alert
} from 'react-native'

import { updown, fav, close } from '../../dao/sync'

import Ionicons from 'react-native-vector-icons/Ionicons'
import colorConfig, {
  standardColor, idColor, accentColor,
  getLevelColorFromProgress
} from '../../constant/colorConfig'

import {
  getTopicAPI,
  getTopicContentAPI,
  getTopicCommentSnapshotAPI,
  getBattleAPI
} from '../../dao'
import SimpleComment from '../../component/SimpleComment'
import { getGameUrl } from '../../dao'

let screen = Dimensions.get('window')
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = screen

declare var global

/* tslint:disable */
let toolbarActions = [
  {
    title: '回复', iconName: 'md-create', iconSize: 22, show: 'always', onPress: function () {
      const { params } = this.props.navigation.state
      if (this.isReplyShowing === true) return
      const cb = () => {
        this.props.navigation.navigate('Reply', {
          type: params.type,
          id: params.rowData ? params.rowData.id : this.state.data && this.state.data.titleInfo && this.state.data.titleInfo.psnid,
          callback: this._refreshComment,
          shouldSeeBackground: true
        })
      }
      if (this.state.openVal._value === 1) {
        this._animateToolbar(0, cb)
      } else if (this.state.openVal._value === 0) {
        cb()
      }
    }
  },
  {
    title: '刷新', iconName: 'md-refresh', show: 'never', onPress: function () {
      this._refreshComment()
    }
  },
  {
    title: '在浏览器中打开', iconName: 'md-refresh', show: 'never', onPress: function () {
      const { params = {} } = this.props.navigation.state
      Linking.openURL(params.URL).catch(err => global.toast(err.toString()))
    }
  },
  {
    title: '收藏', iconName: 'md-star-half', show: 'never', onPress: function () {
      const { params } = this.props.navigation.state
      // console.log(params.type)
      fav({
        type: params.type === 'community' ? 'topic' : params.type,
        param: params.rowData && params.rowData.id
      }).then(res => res.text()).then(text => {
        if (text) return global.toast(text)
        global.toast('操作成功')
      }).catch(err => {
        const msg = `操作失败: ${err.toString()}`
        global.toast(msg)
      })
    }
  },
  {
    title: '顶', iconName: 'md-star-half', show: 'never', onPress: function () {
      const { params } = this.props.navigation.state
      updown({
        type: params.type === 'community' ? 'topic' : params.type,
        param: params.rowData && params.rowData.id,
        updown: 'up'
      }).then(res => res.text()).then(text => {
        if (text) return global.toast(text)
        global.toast('操作成功')
      }).catch(err => {
        const msg = `操作失败: ${err.toString()}`
        global.toast(msg)
      })
    }
  },
  {
    title: '分享', iconName: 'md-share-alt', show: 'never', onPress: function () {
      try {
        const { params } = this.props.navigation.state
        let title = this.state.data.titleInfo.title || ''
        if (title.length > 50) {
          title = title.slice(0, 50) + '... '
        }
        global.Share.open({
          url: params.URL,
          message: '[PSNINE] ' + title.replace(/<.*?>/igm, ''),
          title: 'PSNINE'
        }).catch((err) => { err && console.log(err) })
      } catch (err) { }
    }
  },
  {
    title: '出处', iconName: 'md-share-alt', show: 'never', onPress: function () {
      try {
        const url = this.state.data.titleInfo.shareInfo.source
        url && Linking.openURL(url).catch(err => global.toast(err.toString())) || global.toast('暂无出处')
      } catch (err) { }
    }
  }
]
/* tslint:enable */

let toolbarHeight = 56
let config = { tension: 30, friction: 7, ease: Easing.in(Easing.ease(1, 0, 1, 1)), duration: 200 }

const ApiMapper = {
  'community': getTopicAPI,
  'gene': getTopicAPI,
  'battle': getBattleAPI
}

class CommunityTopic extends Component<any, any> {

  static navigationOptions({ navigation }) {
    return {
      title: navigation.state.params.title || '讨论'
    }
  }

  constructor(props) {
    super(props)
    // console.log(this.props.navigation.state.params)
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

  _refreshComment = () => {
    const { params } = this.props.navigation.state
    if (['community', 'gene'].includes(params.type) === false) {
      return
    }
    if (this.isReplyShowing === true) {
      this.isReplyShowing = false
    }
    if (this.state.isLoading === true) {
      return
    }
    this.setState({
      isLoading: true
    })
    getTopicCommentSnapshotAPI(params.URL).then(data => {
      this.hasComment = data.commentList.length !== 0
      this.setState({
        isLoading: false,
        commentList: data.commentList
      })
    })
  }

  componentWillMount() {
    const { params } = this.props.navigation.state
    InteractionManager.runAfterInteractions(() => {
      const API = ApiMapper[params.type] || getTopicAPI
      API(params.URL).then(data => {

        const content = data.contentInfo.html
        const html = params.type !== 'gene' ? content : content.replace('<div>', '<div align="center">')
        const emptyHTML = params.type !== 'gene' ? '<div></div>' : '<div align="center"></div>'
        this.hasContent = html !== emptyHTML
        this.hasGameTable = data.contentInfo.gameTable.length !== 0
        this.hasComment = data.commentList.length !== 0
        this.hasReadMore = this.hasComment ? data.commentList[0].isGettingMoreComment === true ? true : false : false
        this.hasPage = data.contentInfo.page.length !== 0
        this.hasShare = data.contentInfo.external.length !== 0
        this.setState({
          data,
          mainContent: html,
          commentList: data.commentList,
          isLoading: false,
          page: data.contentInfo.page
        })
      })
    })
  }

  handleImageOnclick = (url) => this.props.navigation.navigate('ImageViewer', {
    images: [
      { url }
    ]
  })

  hasShare = false
  renderShare = (page) => {
    const { modeInfo } = this.props.screenProps
    const list: any[] = []
    for (const item of page) {
      const thisJSX = (
        <TouchableNativeFeedback key={item.url} onPress={() => {
          this.props.navigation.navigate('CommunityTopic', {
            title: item.text,
            URL: item.url
          })
        }}>
          <View style={{ flex: -1, padding: 2 }}>
            <Text style={{ color: idColor }}>{item.text}</Text>
          </View>
        </TouchableNativeFeedback>
      )
      list.push(thisJSX)
    }
    return (
      <View style={{ elevation: 2, margin: 5, marginVertical: 0, backgroundColor: modeInfo.backgroundColor }}>
        <View style={{
          elevation: 2,
          margin: 5,
          backgroundColor: modeInfo.backgroundColor,
          padding: 5
        }}>
          {list}
        </View>
      </View>
    )
  }

  renderHeader = (titleInfo) => {
    const { modeInfo } = this.props.screenProps
    const { params } = this.props.navigation.state
    const textStyle: any = { flex: -1, color: modeInfo.standardTextColor, textAlign: 'center', textAlignVertical: 'center' }
    const isNotGene = params.type !== 'gene'
    let shouldRenderAvatar = isNotGene && !!(params.rowData && params.rowData.avatar)
    let avatar = ''
    if (shouldRenderAvatar) {
      avatar = params.rowData.avatar.replace('@50w.png', '@75w.png')
    } else {
      if (isNotGene && titleInfo.avatar) avatar = titleInfo.avatar
    }
    return ['battle'].includes(params.type) ? undefined : (
      <View key={'header'} style={{
        flex: 1,
        backgroundColor: modeInfo.backgroundColor,
        elevation: 1,
        margin: 5,
        marginBottom: 0,
        marginTop: 0
      }}>
        <TouchableNativeFeedback
          useForeground={true}

          background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
        >
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 5 }}>
            {avatar && <Image
              source={{ uri: avatar }}
              style={{ width: 75, height: 75 }}
            /> || undefined
            }

            <View style={{ flex: 1, flexDirection: 'column', padding: 5 }}>
              <global.HTMLView
                value={titleInfo.title}
                modeInfo={modeInfo}
                stylesheet={styles}
                shouldForceInline={true}
                onImageLongPress={this.handleImageOnclick}
                imagePaddingOffset={shouldRenderAvatar ? 30 + 75 + 10 : 30}
              />

              <View style={{ flex: 1.1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text selectable={false} style={{ flex: -1,
                  color: modeInfo.standardColor, textAlign: 'center', textAlignVertical: 'center' }} onPress={
                  () => {
                    this.props.navigation.navigate('Home', {
                      title: titleInfo.psnid,
                      id: titleInfo.psnid,
                      URL: `https://psnine.com/psnid/${titleInfo.psnid}`
                    })
                  }
                }>{titleInfo.psnid}</Text>
                <Text selectable={false} style={textStyle}>{titleInfo.date}</Text>
                <Text selectable={false} style={textStyle}>{titleInfo.reply}</Text>
                {isNotGene === false && <Text selectable={false} style={{
                    flex: -1, color: modeInfo.standardColor, textAlign: 'center', textAlignVertical: 'center' }} onPress={
                  () => {
                    this.props.navigation.navigate('Circle', {
                      URL: `https://psnine.com/gene?ele=${(titleInfo.node || []).join('')}`,
                      title: (titleInfo.node || []).join('')
                    })
                  }
                }>{(titleInfo.node || []).join('')}</Text>}
              </View>
            </View>

          </View>
        </TouchableNativeFeedback>
      </View>
    )
  }

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
          key={modeInfo.themeName}
          onImageLongPress={this.handleImageOnclick}
        />
      </View>
    )
  }

  hasGameTable = false
  renderGameTable = (gameTable) => {
    const { modeInfo } = this.props.screenProps
    const list: any[] = []
    for (const rowData of gameTable) {
      list.push(
        <View key={rowData.id} style={{
          backgroundColor: modeInfo.backgroundColor
        }}>
          <TouchableNativeFeedback
            onPress={() => {
              const { navigation } = this.props
              const URL = getGameUrl(rowData.id)
              navigation.navigate('GamePage', {
                // URL: 'https://psnine.com/psngame/5424?psnid=Smallpath',
                URL,
                title: rowData.title,
                rowData,
                type: 'game'
              })
            }}
            useForeground={true}

            background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
          >
            <View pointerEvents='box-only' style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', padding: 12 }}>
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
                  <Text selectable={false} style={{
                      fontSize: 12, flex: -1,
                      color: modeInfo.standardTextColor, textAlign: 'center', textAlignVertical: 'center' }}>{rowData.region}</Text>
                </Text>

                <View style={{ flex: 1.1, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text selectable={false} style={{ fontSize: 12,
                  flex: -1, color: modeInfo.standardColor, textAlign: 'center', textAlignVertical: 'center' }}>{rowData.platform}</Text>
                  {rowData.alert && <Text selectable={false} style={{
                    fontSize: 12, flex: -1,
                    color: getLevelColorFromProgress(rowData.allPercent), textAlign: 'center', textAlignVertical: 'center'
                  }}>{
                      rowData.alert + ' '
                    }<Text style={{ fontSize: 12, flex: -1, color: modeInfo.standardTextColor,
                    textAlign: 'center', textAlignVertical: 'center' }}>{rowData.allPercent}</Text></Text> || undefined}
                  <Text selectable={false} style={{ fontSize: 12, flex: -1,
                    color: modeInfo.standardTextColor, textAlign: 'center', textAlignVertical: 'center' }}>{
                    [rowData.platium, rowData.gold, rowData.selver, rowData.bronze].map((item, index) => {
                      return (
                        <Text key={index} style={{ color: colorConfig['trophyColor' + (index + 1)] }}>
                          {item}
                        </Text>
                      )
                    })
                  }</Text>
                </View>

                {rowData.blockquote && <View style={{ flex: -1 }}>
                  <global.HTMLView
                    value={rowData.blockquote}
                    modeInfo={modeInfo}
                    shouldShowLoadingIndicator={true}
                    stylesheet={styles}
                    imagePaddingOffset={144}
                    key={modeInfo.themeName}
                    onImageLongPress={this.handleImageOnclick}
                  />
                </View> || undefined}

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
    const list: JSX.Element[] = []
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
            callback: this._refreshComment,
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
    const shouldMarginTop = !this.hasContent && !this.hasGameTable && !this.hasPage
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
    const cb = () => {
      this.props.navigation.navigate('Reply', {
        type: params.type,
        id: params.rowData.id,
        at: rowData.psnid,
        callback: this._refreshComment,
        shouldSeeBackground: true
      })
    }
    if (this.state.openVal._value === 1) {
      this._animateToolbar(0, cb)
    } else if (this.state.openVal._value === 0) {
      cb()
    }
  }

  _readMore = (URL) => {
    this.props.navigation.navigate('CommentList', {
      URL
    })
  }

  hasPage = false
  renderPage = (page) => {
    const { modeInfo } = this.props.screenProps
    const list: any[] = []
    for (const item of page) {
      const thisJSX: JSX.Element = (
        <View style={{margin: 2}} key={item.url + item.isCurrent}>
          <TouchableNativeFeedback key={item.url}
            useForeground={true}
            background={TouchableNativeFeedback.SelectableBackgroundBorderless()} onPress={() => {
            if (this.state.isLoading === true) {
              return
            }
            this.setState({
              isLoading: true
            })
            getTopicContentAPI(item.url).then(data => {
              this.setState({
                mainContent: data.contentInfo.html,
                isLoading: false,
                page: this.state.page.map(inner => {
                  if (inner.url === item.url) {
                    return {
                      ...inner,
                      isCurrent: true
                    }
                  }
                  return {
                    ...inner,
                    isCurrent: false
                  }
                })
              })
            })
          }}>
            <View style={{ flex: -1, padding: 4, paddingHorizontal: 6,
              backgroundColor: item.isCurrent ? modeInfo.accentColor : modeInfo.standardColor, borderRadius: 2 }}>
              <Text style={{ color: modeInfo.backgroundColor }}>{item.text}</Text>
            </View>
          </TouchableNativeFeedback>
        </View>
      )
      list.push(thisJSX)
    }
    return (
      <View style={{ elevation: 0, margin: 5, marginVertical: 0, backgroundColor: modeInfo.backgroundColor }}>
        <View style={{
          elevation: 0,
          margin: 5,
          backgroundColor: modeInfo.backgroundColor,
          padding: 5,
          flexDirection: 'row',
          flexWrap: 'wrap'
        }}>
          {list}
        </View>
      </View>
    )
  }
  viewTopIndex = 0
  viewBottomIndex = 0
  render() {
    const { params } = this.props.navigation.state
    // console.log('CommunityTopic.js rendered');
    const { modeInfo } = this.props.screenProps
    const { data: source } = this.state
    const data: any = []
    const renderFuncArr: any = []
    const shouldPushData = !this.state.isLoading
    if (shouldPushData) {
      data.push(source.titleInfo)
      renderFuncArr.push(this.renderHeader)
    }
    if (shouldPushData && this.hasShare) {
      data.push(source.contentInfo.external)
      renderFuncArr.push(this.renderShare)
    }
    if (shouldPushData && this.hasPage) {
      data.push(this.state.page)
      renderFuncArr.push(this.renderPage)
    }

    if (shouldPushData && this.hasContent) {
      data.push(this.state.mainContent)
      renderFuncArr.push(this.renderContent)
    }
    if (shouldPushData && this.hasGameTable) {
      data.push(source.contentInfo.gameTable)
      renderFuncArr.push(this.renderGameTable)
    }
    if (shouldPushData && this.hasComment) {
      data.push(this.state.commentList)
      renderFuncArr.push(this.renderComment)
    }

    this.viewBottomIndex = Math.max(data.length - 1, 0)
    const targetActions = toolbarActions.slice()

    if (shouldPushData && this.state.data && this.state.data.titleInfo && this.state.data.titleInfo.shareInfo) {
      const shareInfo = this.state.data.titleInfo && this.state.data.titleInfo.shareInfo
      const link = shareInfo.linkGameUrl
      if (link) {
        const name = shareInfo.linkGame
        targetActions.unshift({
          title: name, iconName: 'md-game-controller-b', iconSize: 22, show: 'always',
          onPress: function () {
            const { params } = this.props.navigation.state
            this.props.navigation.navigate('NewGame', {
              URL: link + '?page=1',
              title: shareInfo.linkGame
            })
          }
        })
      }
      try {
        if (!shareInfo.source) {
          targetActions.pop()
        }
      } catch (err) { }
      if (shareInfo.edit) {
        targetActions.push({
          title: '编辑', iconName: 'md-create', iconSize: 22, show: 'never',
          onPress: function () {
            const { navigation } = this.props
            const target = params.type === 'gene' ? 'NewGene' : 'NewTopic'
            navigation.navigate(target, {
              URL: params.type !== 'gene' ? shareInfo.edit : params.URL
            })
          }
        })
        params.type === 'gene' && targetActions.push({
          title: '关闭', iconName: 'md-create', iconSize: 22, show: 'never',
          onPress: function () {
            const onPress = () => close({
              type: 'gene',
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
          onActionSelected={(index) => {
            targetActions[index].onPress.bind(this)()
          }}
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
        {/*{params.type === 'community' && !this.state.isLoading && this.renderToolbar()}*/}
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

  renderToolbarItem = (props, index, maxLength) => {
    const { modeInfo } = this.props.screenProps
    return (
      <Animated.View
        ref={float => this[`float${index}`] = float}
        collapsable={false}
        key={index}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: modeInfo.accentColor,
          position: 'absolute',
          bottom: props.openVal.interpolate({ inputRange: [0, 1], outputRange: [24, 56 + 10 + 16 * 2 + index * 50] }),
          right: 24,
          elevation: 1,
          zIndex: 1,
          opacity: 1
        }}>
        <TouchableNativeFeedback
          onPress={() => this.pressToolbar(maxLength - index - 1)}
          background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
          onPressIn={() => {
            this.float1.setNativeProps({
              style: {
                elevation: 12
              }
            })
          }}
          onPressOut={() => {
            this.float1.setNativeProps({
              style: {
                elevation: 6
              }
            })
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            flex: 1,
            zIndex: 1,
            backgroundColor: accentColor
          }}>
          <View style={{ borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name={props.iconName} size={20} color='#fff' />
          </View>
        </TouchableNativeFeedback>
      </Animated.View>
    )
  }

  renderToolbar = () => {
    const { modeInfo } = this.props.screenProps
    const { openVal } = this.state
    const tipHeight = toolbarHeight * 0.8
    const list: any[] = []
    const iconNameArr = ['md-arrow-down', 'md-arrow-up']
    for (let i = 0; i < iconNameArr.length; i++) {
      list.push(
        this.renderToolbarItem({
          iconName: iconNameArr[i],
          openVal: openVal
        }, i, iconNameArr.length)
      )
    }
    return (
      <View style={{ position: 'absolute', left: 0, top: 0, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - toolbarHeight / 2 }}>
        {list}
        <Animated.View
          ref={float => this.float = float}
          collapsable={false}
          style={{
            width: 56,
            height: 56,
            borderRadius: 30,
            backgroundColor: accentColor,
            position: 'absolute',
            bottom: 16,
            right: 16,
            elevation: 6,
            zIndex: 1,
            opacity: this.state.opacity,
            transform: [{
              rotateZ: this.state.rotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              })
            }]
          }}>
          <TouchableNativeFeedback
            onPress={this.pressNew}
            background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
            onPressIn={() => {
              this.float.setNativeProps({
                style: {
                  elevation: 12
                }
              })
            }}
            onPressOut={() => {
              this.float.setNativeProps({
                style: {
                  elevation: 6
                }
              })
            }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 30,
              flex: 1,
              zIndex: 1,
              backgroundColor: accentColor
            }}>
            <View style={{ borderRadius: 30, width: 56, height: 56, flex: -1, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name='ios-add' size={40} color='#fff' />
            </View>
          </TouchableNativeFeedback>
        </Animated.View>
      </View>
    )
  }

  index = 0

  pressToolbar = index => {
    const target = index === 0 ? this.viewTopIndex : this.viewBottomIndex
    this.flatlist && this.flatlist.scrollToIndex({ animated: true, viewPosition: 0, index: target })
  }

  _animateToolbar = (value, cb) => {
    const ratationPreValue = this.state.rotation._value

    const rotationValue = value === 0 ? 0 : ratationPreValue + 3 / 8
    const scaleAnimation = Animated.timing(this.state.rotation, { toValue: rotationValue, ...config })
    const moveAnimation = Animated.timing(this.state.openVal, { toValue: value, ...config })
    const target = [
      moveAnimation
    ]
    if (value !== 0 || value !== 1) target.unshift(scaleAnimation)

    const type = value === 1 ? 'sequence' : 'parallel'
    Animated[type](target).start()
    setTimeout(() => {
      typeof cb === 'function' && cb()
    }, 200)
  }

  pressNew = (cb) => {
    if (this.state.openVal._value === 0) {
      this._animateToolbar(1, cb)
    } else {
      this._animateToolbar(0, cb)
    }
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