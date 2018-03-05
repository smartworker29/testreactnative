import React, {PureComponent} from 'react';
import {StyleSheet, ImageBackground, TouchableOpacity, View, Image,} from 'react-native';
import PropTypes from 'prop-types';
import {photoUnsyncIcon} from "../utils/images";

export default class ImageView extends PureComponent {
    render() {
        const {photo} = this.props
        return (
            <TouchableOpacity {...this.props} onPress={this.props.onPress}>
                <View style={styles.item}>
                    {photo.isUpload ? null : <Image source={photoUnsyncIcon} style={styles.indicator}/>}
                    <ImageBackground style={styles.image} source={{uri: photo.uri}}/>
                </View>
            </TouchableOpacity>
        )
    }
}

ImageView.propTypes = {
    photo: PropTypes.object,
    onPress: PropTypes.func,
}

ImageView.defaultProps = {
    photo: {}
}

const styles = StyleSheet.create({
    item: {
        padding: 1,
        height: 106,
        width: 106,
        backgroundColor: 'white'
    },
    isUploading: {
        position: 'absolute',
        top: 0, zIndex: 1,
        margin: 8
    },
    indicator: {
        zIndex: 1,
        position: 'absolute',
        right: 5,
        top: 10,
    },
    image: {
        zIndex: 0,
        height: 106,
        width: 106,
    }
});
