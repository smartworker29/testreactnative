/* eslint-disable indent,no-unused-vars */
import React, {Component} from 'react'
import {Image, Dimensions} from 'react-native'
import ImageZoom from 'react-native-image-pan-zoom'

class PhotoViewScene extends Component {
    render () {
        const {uri} = this.props.navigation.state.params;

        return (
            <ImageZoom cropWidth={Dimensions.get('window').width}
                       cropHeight={Dimensions.get('window').height}
                       imageWidth={200}
                       imageHeight={200}>
                <Image style={{width: 200, height: 200}}
                       source={{uri: uri}}/>
            </ImageZoom>)
    }
}
export default PhotoViewScene
