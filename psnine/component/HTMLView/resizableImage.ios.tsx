import React, { Component } from 'react'
import {
  Image,
  Dimensions,
  ActivityIndicator,
  View,
  Text,
  TouchableNativeFeedback
} from 'react-native'
import { IProps, State } from './inlineImage'

const { width } = Dimensions.get('window')

const baseStyle = {
  backgroundColor: 'transparent'
}

// 外联图片组件, 支持Loading动画
export default props => {
  const width = Number(props.attribs.width) || Number(props.attribs['data-width']) || 0
  const height = Number(props.attribs.height) || Number(props.attribs['data-height']) || 0

  const imgStyle = {
    width,
    height
  }
  let src = props.attribs.src
  if (/^(.*?):\/\//.exec(src)) {} else {
    src = 'https://psnine.com' + src
  }

  const source = {
    uri: src,
    width,
    height,
    imagePaddingOffset: props.imagePaddingOffset
  }

  return (
    <ResizableImage
      source={source}
      style={imgStyle}
      isLoading={props.isLoading}
      alignCenter={props.alignCenter}
      modeInfo={props.modeInfo}
      linkPressHandler={props.linkPressHandler} />
  )
}

interface IState extends State {
  isLoading: boolean
  hasError: boolean
  shouldLoad: boolean
}

class ResizableImage extends Component<IProps, IState> {
  maxWidth: number = width
  mounted: boolean = false
  constructor(props) {
    super(props)
    const { width: SCREEN_WIDTH } = Dimensions.get('window')
    const maxWidth = SCREEN_WIDTH - this.props.source.imagePaddingOffset
    this.maxWidth = maxWidth
    this.state = {
      width: this.props.style.width || maxWidth,
      height: this.props.style.height || (maxWidth / 16 * 9),
      isLoading: this.props.isLoading || true,
      alignCenter: this.props.alignCenter || false,
      hasError: false,
      shouldLoad: global.netInfo.toUpperCase() === 'WIFI' || global.loadImageWithoutWifi
    }
  }

  componentWillUnmount() {
    this.mounted = false
  }

  componentDidMount() {
    this.mounted = true
    this.loadImage()
  }

  loadImage = () => {
    if (this.props.style.width !== 0 && this.props.style.height !== 0) {
      this.setState({
        isLoading: false
      })
      return
    }
    return this.state.shouldLoad && Image.getSize(this.props.source.uri, (w, h) => {
      if (this.mounted !== false) {
        this.setState({
          width: w,
          height: h,
          isLoading: false,
          hasError: false
        })
      }
    }, (err) => {
      this.setState({
        isLoading: false,
        hasError: err.toString() || '加载失败'
      })
    })
  }

  render() {
    const finalSize: any = {}
    const { width } = Dimensions.get('window')
    const maxWidth = width - this.props.source.imagePaddingOffset
    if (this.state.width > maxWidth) {
      finalSize.width = maxWidth
      let ratio = maxWidth / this.state.width
      finalSize.height = this.state.height * ratio
    }
    let source: any = {
      alignSelf: 'center'
    }
    if (!finalSize.width || !finalSize.height) {
      source = Object.assign(source, this.props.source, this.state)
    } else {
      source = Object.assign(source, this.props.source, finalSize)
    }

    const { modeInfo } = this.props
    const alignSelf = this.state.alignCenter ? { alignContent: 'center' } : {}
    let loadImageWithoutWifi = global.loadImageWithoutWifi
    // console.log(global.netInfo, global.loadImageWithoutWifi)
    let onPress = loadImageWithoutWifi ? () => {} : () => {
      this.setState({
        shouldLoad: true
      }, () => {
        this.loadImage()
      })
    }

    if (this.state.shouldLoad === true && this.state.isLoading === false && this.state.hasError === false) {
      onPress = this.props.linkPressHandler
    }

    let onLongPress = this.props.linkPressHandler
    if (this.state.hasError || this.state.isLoading || this.state.shouldLoad === false) onLongPress = () => {}

    return (
      <TouchableNativeFeedback onLongPress={onLongPress} onPress={onPress} style={[{ justifyContent: 'center', alignItems: 'center' }, alignSelf]}>
        {<View style={{ width: source.width, height: source.height }}>
          {this.state.shouldLoad === false && (
              <View style={{flex: 1, backgroundColor: modeInfo.brighterLevelOne, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{color: modeInfo.standardTextColor, textAlign: 'center', textAlignVertical: 'center'}}>点击加载图片</Text>
              </View>
            ) || undefined}
          {
            this.state.shouldLoad && this.state.hasError && (
              <View style={{flex: 1, backgroundColor: modeInfo.brighterLevelOne, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{color: modeInfo.standardTextColor, textAlign: 'center', textAlignVertical: 'center'}}>
                  {'加载失败: ' + this.state.hasError}
                </Text>
              </View>) || undefined
          }
          {this.state.shouldLoad && !this.state.hasError &&
            <Image
              resizeMode={'contain'}
              resizeMethod={'resize'}
              onError={() => {}}
              key={`${source.width}:${source.height}`}
              style={{width: source.width, height: source.height}}
              source={source} /> || undefined
          }
        </View>}
      </TouchableNativeFeedback>
    )
  }
}
