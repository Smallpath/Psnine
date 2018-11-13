import React, { Component } from 'react'
import {
  AsyncStorage,
  ListView,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  Alert,
  StatusBar
} from 'react-native'

import {
  getHomeURL
} from '../dao'

import {
  standardColor
} from '../constant/colorConfig'

import Icon from 'react-native-vector-icons/Ionicons'

import { safeLogout } from '../dao/logout'
import { safeSignOn } from '../dao/signon'
import { fetchUser } from '../dao'

declare var global

/* tslint:disable */
const ListItems = [
  {
    text: '我收藏的',
    iconName: 'md-star',
    onPress: function () {
      const { navigation, closeDrawer } = this.props
      closeDrawer()

      let URL = 'https://psnine.com/my/fav?page=1'

      navigation.navigate('Favorite', {
        URL,
        title: '收藏'
      })
    }
  },
  {
    text: '我发布的',
    iconName: 'md-bookmarks',
    onPress: function () {
      const { navigation, closeDrawer } = this.props
      closeDrawer()

      let URL = 'https://psnine.com/my/issue?page=1'

      navigation.navigate('Issue', {
        URL,
        title: '发布'
      })
    }
  },
  {
    text: '我屏蔽的',
    iconName: 'md-eye-off',
    onPress: function () {
      const { navigation, closeDrawer } = this.props
      closeDrawer()

      let URL = 'https://psnine.com/my/block'

      navigation.navigate('UserBlock', {
        URL,
        title: '屏蔽'
      })
    }
  },
  // {
  //   text: '元素',
  //   iconName: 'md-snow',
  //   onPress: function () {
  //     const { navigation, closeDrawer } = this.props
  //     closeDrawer()

  //     let URL = 'https://psnine.com/my/element'

  //     navigation.navigate('UserElement', {
  //       URL,
  //       title: '元素'
  //     })
  //   }
  // },
  {
    text: '图床',
    iconName: 'md-image',
    onPress: function () {
      const { navigation, closeDrawer } = this.props
      closeDrawer()

      let URL = 'https://psnine.com/my/photo?page=1'

      navigation.navigate('UserPhoto', {
        URL,
        title: '图床'
      })
    }
  },
  {
    text: '明细',
    iconName: 'md-podium',
    onPress: function () {
      const { navigation, closeDrawer } = this.props
      closeDrawer()

      let URL = 'https://psnine.com/my/account'

      navigation.navigate('UserDetail', {
        URL,
        title: '明细'
      })
    }
  },
  {
    text: '个性设定',
    iconName: 'md-brush',
    onPress: function () {
      const { navigation, closeDrawer } = this.props
      closeDrawer()

      let URL = 'https://psnine.com/my/setting'

      navigation.navigate('UserCustom', {
        URL,
        title: '个性设定'
      })
    }
  },
  {
    text: '系统选项',
    iconName: 'md-home'
  },
  {
    text: '主题',
    iconName: 'md-color-palette',
    onPress: function() {
      const { navigation, closeDrawer } = this.props
      closeDrawer()
      navigation.navigate('Theme')
    }
  },
  {
    text: '设置',
    iconName: 'md-options',
    onPress: function () {
      const { navigation, closeDrawer } = this.props
      closeDrawer()
      navigation.navigate('Setting')
    }
  }
  // {
  //   text: '关于',
  //   iconName: 'md-help-circle',
  //   onPress: function () {
  //     const { navigation, closeDrawer } = this.props;
  //     closeDrawer()
  //     navigation.navigate('About');
  //   }
  // }
]
/* tslint:enable */

export default class NavigationDrawer extends Component<any, any> {
  constructor(props) {
    super(props)
    let dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2
    })
    const { modeInfo } = this.props

    this.state = {
      psnid: modeInfo.settingInfo.psnid,
      userInfo: modeInfo.settingInfo.userInfo,
      hasMessage: false,
      dataSource: dataSource.cloneWithRows(ListItems)
    }
  }

  componentWillMount() {
    const { modeInfo } = this.props
    this.setState({
      psnid: modeInfo.settingInfo.psnid,
      userInfo: modeInfo.settingInfo.userInfo
    }, () => {
      this.checkLoginState()
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.psnid !== nextProps.modeInfo.settingInfo.psnid && nextProps.modeInfo.settingInfo.psnid !== '') {
      // console.log(this.state.psnid, nextProps.modeInfo.settingInfo.psnid)
      this.setState({
        psnid: nextProps.modeInfo.settingInfo.psnid,
        userInfo: nextProps.modeInfo.settingInfo.userInfo
      }, () => {
        this.checkLoginState()
      })
    }
  }

  checkLoginState = async () => {
    const psnid = this.state.psnid
    if (!psnid)
      return

    const userInfo = await fetchUser(psnid)
    await AsyncStorage.setItem('@userInfo', JSON.stringify(userInfo))
    this.setState({
      psnid,
      userInfo,
      hasMessage: userInfo.hasMessage
    }, () => {
      if (this.state.psnid !== '') {
        if (this.state.userInfo.isSigned === false) {
          this.pressSign()
        }
      }
    })

  }

  pressLogin = () => {
    const { navigation, closeDrawer } = this.props
    const { psnid } = this.state
    closeDrawer()
    if (!psnid) {
      navigation.navigate('Login', {
        setLogin: this.setLogin
      })
    } else {
      let URL = getHomeURL(this.state.psnid)
      navigation.navigate('Home', {
        URL,
        title: this.state.psnid
      })
    }
  }

  pressLogout = async () => {
    const { closeDrawer } = this.props
    closeDrawer()
    await safeLogout(this.state.psnid)
    const backupInfo = {
      psnid: '',
      userInfo: {
        avatar: require('../../art/avatar.jpg'),
        platinum: '白',
        gold: '金',
        silver: '银',
        bronze: '铜',
        exp: ''
      },
      hasMessage: false
    }
    await this.setState(backupInfo)
    Promise.all([
      AsyncStorage.setItem('@userInfo', JSON.stringify(backupInfo.userInfo)),
      AsyncStorage.setItem('@psnid', backupInfo.psnid)
    ]).then(() => {
      const { modeInfo } = this.props
      modeInfo.reloadSetting && modeInfo.reloadSetting()
    }).catch(err => global.toast(err.toString())).then(() => {
      global.toast && global.toast('登出成功', 2000)
    })

  }

  setLogin = () => {
    const { modeInfo } = this.props
    modeInfo.reloadSetting && modeInfo.reloadSetting()
  }

  pressSign = async () => {
    const { closeDrawer } = this.props
    closeDrawer()
    let data = await safeSignOn(this.state.psnid)
    this.setState({
      userInfo: Object.assign({}, this.state.userInfo, { isSigned: true })
    })

    global.toast && global.toast(data, 2000)
  }

  onMessageClick = () => {
    const { navigation, closeDrawer } = this.props
    closeDrawer()
    if (this.state.psnid === '') {
      global.toast && global.toast('未登录', 2000)
      return
    }

    let URL = getHomeURL(this.state.psnid)
    // alert(this.state.userInfo.nums)
    navigation.navigate('Message', {
      URL,
      title: this.state.psnid,
      nums: this.state.userInfo.nums
    })
  }

  switch = () => {
    const { closeDrawer, switchModeOnRoot } = this.props
    closeDrawer()
    switchModeOnRoot()
  }

  goToStatistics = () => {
    const { navigation, closeDrawer } = this.props
    closeDrawer()
    if (this.state.psnid === '') {
      global.toast && global.toast('未登录', 2000)
      return
    }

    const { psnid } = this.state
    let URL = getHomeURL(psnid)
    // alert(this.state.userInfo.nums)
    navigation.navigate('Stats', {
      URL,
      psnid: this.state.psnid,
      title: `${this.state.psnid} 奖杯统计`
    })
  }

  onUserLongPress = () => {
    if (this.state.psnid === '') return
    Alert.alert(
      '提示',
      '请选择操作',
      [
        { text: '修改密码', onPress: () => {
          const { navigation, closeDrawer } = this.props
          closeDrawer()

          let URL = 'https://psnine.com/my/pass'

          navigation.navigate('Pass', {
            URL,
            title: '改密码'
          })
        }},
        {
          text: '退出', onPress: () => {
            this.pressLogout()
          }
        }
      ]
    )
  }

  renderHeader = () => {
    const { modeInfo } = this.props
    const { psnid, userInfo } = this.state
    let toolActions: JSX.Element[] = []
    const iconStyle = {
      borderColor: '#fff',
      borderWidth: 0,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      height: 30,
      width: 30,
      flex: 0,
      marginLeft: 16
    }

    const color = '#fff'
    const size = 24
    const borderRadius = 12

    if (psnid) {
      let dot: any = undefined
      if (this.state.hasMessage) {
        dot = (
          <View style={{ borderRadius: 4, position: 'absolute', top: 3, right: 3, backgroundColor: modeInfo.accentColor, height: 8, width: 8}} />
        )
      }
      toolActions.push(
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
          key={'sign'}
          onPress={() => {
            if (dot) {
              this.setState({
                hasMessage: false
              }, () => {
                this.onMessageClick()
              })
              return
            }
            this.onMessageClick()
          }}
        >
          <View borderRadius={borderRadius} style={iconStyle}>
            <Icon name='md-notifications' size={size} color={color} />
            {dot}
          </View>
        </TouchableNativeFeedback>
      )
    }

    toolActions.push(
      <TouchableNativeFeedback
        background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
        key={'changeStyle'}
        onPress={this.switch}
      >
        <View borderRadius={borderRadius} style={iconStyle}>
          {this.props.modeInfo.isNightMode &&
            <Icon name='md-sunny' size={size} color={color} /> ||
            <Icon name='md-moon' size={size} color={color} />}
        </View>
      </TouchableNativeFeedback>
    )

    return (
      <View style={[{
        flex: 1,
        padding: 20,
        backgroundColor: this.props.modeInfo.standardColor
      }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'column',
            alignItems: 'flex-start', justifyContent: 'space-between', alignSelf: 'flex-start', alignContent: 'flex-start' }}>
            <TouchableWithoutFeedback onPress={this.pressLogin} onLongPress={this.onUserLongPress}>
              <View borderRadius={35} style={{ flexDirection: 'column', alignItems: 'center', backgroundColor: modeInfo.backgroundColor }}>
                <Image
                  borderRadius={35}
                  source={userInfo.avatar}
                  style={{ width: 70, height: 70 }} />
              </View>
            </TouchableWithoutFeedback>
            <Text style={[styles.menuText, { paddingTop: 5,
              textAlign: 'center', alignSelf: psnid === '' ? 'center' : 'flex-start' }]}>{psnid === '' ? '请登录' : psnid}</Text>
            {psnid && (
              <View style={{flex: 1, width: 100}}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1  }}>
                    <Text style={{ color: color, fontSize: 12 }}>
                      {userInfo.exp.split('经验')[0] + ' '}
                    <Text style={{ flex: -1, color: color, fontSize: 12 }}>{userInfo.exp.split('经验')[1]}</Text></Text>
                </View>
                <View style={{ flex: 0, width: 200 }}>
                  <Text style={{ }}>
                    <Text style={{ flex: -1, color: color, textAlign: 'center', fontSize: 12 }}>{userInfo.platinum + ' '}</Text>
                    <Text style={{ flex: -1, color: color, textAlign: 'center', fontSize: 12 }}>{userInfo.gold + ' '}</Text>
                    <Text style={{ flex: -1, color: color, textAlign: 'center', fontSize: 12 }}>{userInfo.silver + ' '}</Text>
                    <Text style={{ flex: -1, color: color, textAlign: 'center', fontSize: 12 }}>{userInfo.bronze + ' '}</Text>
                  </Text>
                </View>
              </View>) || undefined}
          </View>
          <View style={{
            paddingRight: toolActions.length === 4 ? 20 : 0, flex: 1,
            flexDirection: 'row', alignSelf: 'flex-start', alignContent: 'flex-end', justifyContent: 'center', alignItems: 'flex-end' }}>
            { psnid && <TouchableNativeFeedback
              background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
              key={'changeStyle'}
              onPress={this.goToStatistics}
            >
              <View borderRadius={borderRadius} style={iconStyle}>
                <Icon name='md-trophy' size={size} color={color} />
              </View>
            </TouchableNativeFeedback> || undefined }
            {toolActions}
          </View>
        </View>
      </View>
    )
  }

  renderRow = (rowData, _, rowID) => {
    const shouldSlice = this.state.psnid === ''
    const targetListItems = shouldSlice ? ListItems.slice(-2) : ListItems
    const item: any = targetListItems[rowID]
    let iconName = item.iconName

    const icon = <Icon name={iconName} size={25} style={{ marginLeft: 6 }} color={this.props.modeInfo.standardColor} />
    if (rowData.text === '系统选项') {
      return (
        <View style={{ marginTop: 6 }}>
          <View
            style={{ backgroundColor: 'rgba(0,0,0,0.1)', height: rowID === '0' ? 0 : 1 }}
          />
        </View>
      )
    }

    return (
      <View>
        <TouchableNativeFeedback
          onPress={() => item.onPress.bind(this)(rowData)}

        >
          <View pointerEvents={'box-only'} style={[styles.themeItem]}>
            <View style={{width: 30, alignItems: 'center', justifyContent: 'center'}}>
              {icon}
            </View>
            <Text style={[styles.themeName, { color: this.props.modeInfo.titleTextColor }]}>
              {rowData.text}
            </Text>
          </View>
        </TouchableNativeFeedback>
      </View>
    )
  }

  render() {
    // console.log('navigationDrawer.js rendered');
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#FAFAFA',
        paddingTop: StatusBar.currentHeight || 24,
        backgroundColor: this.props.modeInfo.standardColor}} {...this.props}>
        <ListView
          ref='themeslistview'
          dataSource={this.state.psnid !== '' ? this.state.dataSource : this.state.dataSource.cloneWithRows(ListItems.slice(-2))}
          renderRow={this.renderRow}
          key={this.props.modeInfo.themeName}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps='always'
          renderHeader={this.renderHeader}
          enableEmptySections={true}
          style={{ flex: 2, backgroundColor: this.props.modeInfo.backgroundColor }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA'
  },
  header: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: standardColor,
    height: 180
  },
  userInfo: {
    flex: 4
  },
  trophyRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginLeft: 5,
    marginTop: -60
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    // marginLeft: 8,
    paddingTop: -10
  },
  menuContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingLeft: 2,
    paddingRight: 0
  },
  menuText: {
    fontSize: 14,
    color: 'white'
  },
  homeTheme: {
    fontSize: 16,
    marginLeft: 16,
    color: standardColor
  },
  themeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12
  },
  themeName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16
  },
  themeIndicate: {
    marginLeft: 16,
    width: 20,
    height: 20
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee'
  },
  rowSeparator: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    height: 1,
    marginLeft: 4
  },
  rowSeparatorHide: {
    opacity: 0.0
  },
  platinum: {
    color: '#fff'
  },
  gold: {
    color: '#fff'
  },
  silver: {
    color: '#fff'
  },
  bronze: {
    color: '#fff'
  }
})
