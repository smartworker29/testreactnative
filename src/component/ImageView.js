import React, {Component} from 'react';
import {StyleSheet, ImageBackground, TouchableOpacity, View, Image,} from 'react-native';
import PropTypes from 'prop-types';
import {photoUnsyncIcon} from "../utils/images";
import {getPhotoPathWithPrefix} from "../utils/util";

export default class ImageView extends Component {

    render() {
        const {photo} = this.props;
        const filPath = getPhotoPathWithPrefix(photo.uri);
        return (
            <TouchableOpacity {...this.props} onPress={this.props.onPress}>
                <View style={styles.item}>
                    {photo.isUploaded ? null : <Image source={photoUnsyncIcon} style={styles.indicator}/>}
                    <ImageBackground style={styles.image} source={{uri: filPath}}/>
                </View>
            </TouchableOpacity>
        )
    }
}

ImageView.propTypes = {
    photo: PropTypes.object,
    onPress: PropTypes.func,
};

ImageView.defaultProps = {
    photo: {}
};

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
