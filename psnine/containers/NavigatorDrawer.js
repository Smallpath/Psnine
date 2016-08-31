import React, { Component } from 'react';
import {
  AsyncStorage,
  Platform,
  ListView,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  TouchableHighlight,
  ToastAndroid,
} from 'react-native';

import { getDealURL, getHappyPlusOneURL, getStoreURL } from '../dao/dao';
import { standardColor } from '../config/config';

import CommunityTopic from '../components/CommunityTopic';
import Deal from '../components/Deal';
import GeneTopic from '../components/GeneTopic';
import HappyPlusOne from '../components/HappyPlusOne';
import Store from '../components/Store';

import Login from './authPagers/Login';
import { safeLogout } from '../dao/logout';

let settingIcon = require('image!ic_setting_blue');

let signIcon = require('image!ic_assignment_blue');

let imageArr = [
  require('image!ic_game_blue'),
  require('image!ic_message_blue'),
  require('image!ic_plus_blue'),
  require('image!ic_store_blue'),
  require('image!ic_business_blue'),
];

class NavigatorDrawer extends Component {
  constructor(props){
      super(props);
      let dataSource = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      });
      this.state = {
          isLoading: false,
          dataSource:dataSource.cloneWithRows([
              "我的游戏","我的消息","游惠","Store","闲游",
          ]),
      }
  }
 renderSeparator(sectionID: number, rowID: number, adjacentRowHighlighted: bool) { 
   return ( 
     <View 
      key={`${sectionID}-${rowID}`} 
      style={{ height: adjacentRowHighlighted ? 4 : 1, backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#CCCCCC', }} 
      /> 
      ); 
    }

  pressLogin = () =>{
    const { navigator, closeDrawer} = this.props;
    closeDrawer();
    navigator.push({
      component: Login,
      params: {

      },
      withoutAnimation: true,
    })
  }

  pressLogout = async () =>{
    const { navigator, closeDrawer} = this.props;
    console.log('here1');
    await safeLogout();
        console.log('here2');
    ToastAndroid.show('登出成功', 2000);
        console.log('here3');
  }

  renderHeader = () => {
      return (
      <View style={styles.header}>

        <View style={styles.userInfo}>
            <View style={{flexDirection: 'row',  alignItems: 'center',}}>
                <View style={{flexDirection: 'column',  alignItems: 'center', }}>
                  <TouchableNativeFeedback onPress={this.pressLogin}>
                    <View style={{flexDirection: 'column',  alignItems: 'center', }}>
                      <Image
                        source={require('image!comment_avatar')}
                        style={{width: 70, height: 70, marginRight: 8}} />
                      <Text style={[styles.menuText,{marginTop: 5}]}>
                        请登录
                      </Text>
                    </View>
                  </TouchableNativeFeedback>
                </View>
                <View style={{ flexDirection: 'row', marginLeft: 0, marginTop: 0 }}>
                  <TouchableNativeFeedback
                    // onPress={() => this.props.onSelectItem(theme)}
                    // onShowUnderlay={highlightRowFunc}
                    // onHideUnderlay={highlightRowFunc}
                    >
                    <View style={{flexDirection: 'column',  justifyContent: 'center',marginLeft: 20}}>
                      <Image source={require('image!ic_assignment_white')}            
                              style={{width: 20, height: 20}} />
                      <Text style={[styles.menuText,{marginTop:5}]}>
                        签到
                      </Text>
                    </View>
                  </TouchableNativeFeedback>
                  <TouchableNativeFeedback
                    // onPress={() => this.props.onSelectItem(theme)}
                    // onShowUnderlay={highlightRowFunc}
                    // onHideUnderlay={highlightRowFunc}
                    >
                    <View style={{flexDirection: 'column',  justifyContent: 'center',marginLeft: 20}}>
                      <Image source={require('image!ic_assignment_white')}            
                              style={{width: 20, height: 20}} />
                      <Text style={[styles.menuText,{marginTop:5}]}>
                        夜间
                      </Text>
                    </View>
                  </TouchableNativeFeedback>
                  <TouchableNativeFeedback
                     onPress={this.pressLogout}
                    // onShowUnderlay={highlightRowFunc}
                    // onHideUnderlay={highlightRowFunc}
                    >
                    <View style={{flexDirection: 'column',  justifyContent: 'center',marginLeft: 20}}>
                      <Image source={require('image!ic_assignment_white')}            
                              style={{width: 20, height: 20}} />
                      <Text style={[styles.menuText,{marginTop:5}]}>
                        退出
                      </Text>
                    </View>
                  </TouchableNativeFeedback>
                </View>
            </View>
        </View>

        <View style={styles.trophyRow}>
          <TouchableNativeFeedback>
            <View style={styles.menuContainer}>
            {/*<Image
                source={require('image!ic_favorites_white')}
                style={{width: 30, height: 30}} />*/}
              <Text style={styles.menuText}>
                白
              </Text>
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <View style={styles.menuContainer}>
            {/*<Image
              source={require('image!ic_download_white')}
              style={{width: 30, height: 30}} /> */}
              <Text style={styles.menuText}>
                金
              </Text>
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <View style={styles.menuContainer}>
            {/*<Image
              source={require('image!ic_download_white')}
              style={{width: 30, height: 30}} />*/}
              <Text style={styles.menuText}>
                银
              </Text>
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <View style={styles.menuContainer}>
            {/*<Image
              source={require('image!ic_download_white')}
              style={{width: 30, height: 30}} />*/}
              <Text style={styles.menuText}>
                铜
              </Text>
            </View>
          </TouchableNativeFeedback>
        </View>

        <View style={styles.row}>
          <TouchableNativeFeedback>
            <View style={styles.menuContainer}>
              <Image
                source={require('image!ic_favorites_white')}
                style={{width: 30, height: 30}} />
              <Text style={styles.menuText}>
                帖子
              </Text>
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <View style={styles.menuContainer}>
            <Image
              source={require('image!ic_download_white')}
              style={{width: 30, height: 30}} />
              <Text style={styles.menuText}>
                关注
              </Text>
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <View style={styles.menuContainer}>
            <Image
              source={require('image!ic_download_white')}
              style={{width: 30, height: 30}} />
              <Text style={styles.menuText}>
                收藏
              </Text>
            </View>
          </TouchableNativeFeedback>
        </View>
        
      </View>
      );
  }  

  onSelectItem = (sectionID,rowID)=>{
    const { navigator, closeDrawer} = this.props;
    closeDrawer();
    let URL;
    if(sectionID == 's1'){
      switch (parseInt(rowID)) {
        case 0:

            break;
        case 1:

            break;
        case 2:
            URL = getHappyPlusOneURL();

            navigator.push({
              component: HappyPlusOne,
              params: {
                URL,
                title: '游惠',
              }
            });
            break;
        case 3:
            URL = getStoreURL();
            navigator.push({
              component: Store,
              params: {
                URL,
                title: 'Store',
              }
            });
            break;
        case 4:
            URL = getDealURL();
            navigator.push({
              component: Deal,
              params: {
                URL,
                title: '闲游',
              }
            });
            break;
      }

    }
  }

  renderRow = (rowData, sectionID, rowID, highlightRow) => {
    let icon = imageArr[rowID];
    return (
      <View>
        <TouchableNativeFeedback
           onPress={()=>this.onSelectItem(sectionID,rowID)}
           delayPressIn={0}
          // onShowUnderlay={highlightRowFunc}
          // onHideUnderlay={highlightRowFunc}
          >
          <View style={styles.themeItem}>
            <Image source={icon} style={styles.themeIndicate}/>
            <Text style={styles.themeName}>
              {rowData}
            </Text>
          </View>
        </TouchableNativeFeedback>
      </View>
    );
  }

  renderFooter = () =>{
    rowData = "设置";
    icon = settingIcon;
    return (
      <View >
        <TouchableNativeFeedback>
          <View style={styles.themeItem}>
            <Image source={icon} style={styles.themeIndicate}/>
            <Text style={styles.themeName}>
              {rowData}
            </Text>
          </View>
        </TouchableNativeFeedback>
      </View>
    )
  }

  render = () => {
    // console.log('NavigatorDrawer.js rendered');
    return (
      <View style={styles.container} {...this.props}>
        <ListView
          ref="themeslistview"
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps={true}
          renderHeader={this.renderHeader}
          renderFooter={this.renderFooter}
          // renderSeparator={this.renderSeparator}
          style={{flex:1, backgroundColor: 'white'}}
        />
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: standardColor,
    height: 180,
  },
  userInfo: {
    flex: 4,
    margin: 20,
  },
  trophyRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 25,
    marginTop: -20,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 0,
    marginLeft: 12,
  },
  menuContainer: {
    flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  menuText: {
    fontSize: 14,
    color: 'white',
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
    padding: 10,
  },
  themeName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  themeIndicate: {
    marginLeft: 16,
    width: 30,
    height: 30,
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  rowSeparator: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    height: 1,
    marginLeft: 4,
  },
  rowSeparatorHide: {
    opacity: 0.0,
  },
});


module.exports = NavigatorDrawer