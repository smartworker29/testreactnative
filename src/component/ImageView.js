import React, {Component} from 'react';
import {StyleSheet, ImageBackground, TouchableOpacity, View, Image, Text, ActivityIndicator} from 'react-native';
import PropTypes from 'prop-types';
import {photoUnsyncIcon} from "../utils/images";
import {getPhotoPathWithPrefix} from "../utils/util";

export default class ImageView extends Component {

    render() {
        const {photo, loaded, total} = this.props;
        const percent = (loaded && total) ? loaded * 100 / total : null;
        const loader = (total) ?
            <ActivityIndicator sixe="small" color="white" style={styles.indicator}/> : (photo.isUploaded) ? null :
                <Image source={photoUnsyncIcon} style={styles.indicator}/>;
        const filPath = getPhotoPathWithPrefix(photo.uri);
        return (
            <TouchableOpacity {...this.props} onPress={this.props.onPress}>
                <View style={styles.item}>
                    {loader}
                    {percent ? <Text style={styles.loadedText}>{`${Math.round(percent)}%`}</Text> : null}
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
    loadedText: {
        zIndex: 1,
        color: "white",
        position: 'absolute',
        right: 25,
        top: 8,
    },
    indicator: {
        zIndex: 1,
        position: 'absolute',
        right: 5,
        top: 10,
        width: 18,
        height: 18
    },
    image: {
        zIndex: 0,
        height: 106,
        width: 106,
    }
});
