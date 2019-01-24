import React, {Component} from 'react';
import {StyleSheet, ImageBackground, TouchableOpacity, View, Image, Text, ActivityIndicator} from 'react-native';
import PropTypes from 'prop-types';
import {
    irSuccess,
    irSuccessGreen,
    photoUnsyncIcon,
    problem,
    problemRed,
    uploadSuccess,
    uploadSuccessGreen
} from "../utils/images";
import {getPhotoPathWithPrefix} from "../utils/util";

export default class ImageView extends Component {

    render() {
        const {photo, loaded, total} = this.props;
        const percent = (loaded && total) ? loaded * 100 / total : null;
        let loader = (total) ?
            <ActivityIndicator sixe="small" color="white" style={styles.indicator}/> : (photo.isUploaded) ? null :
                <Image source={photoUnsyncIcon} style={styles.indicator}/>;
        const filPath = getPhotoPathWithPrefix(photo.uri);
        if (photo.isUploaded !== undefined && photo.isUploaded === true || photo.ir_status === 'UPLOAD_SUCCESS') {
            loader = <Image source={uploadSuccessGreen} style={styles.indicator}/>;
        }
        if (photo.ir_status === 'IR_STARTED') {
            loader = <Image source={irSuccess} style={styles.indicator}/>;
        }
        if (photo.ir_status === 'IR_SUCCESS') {
            loader = <Image source={irSuccessGreen} style={styles.indicator}/>;
        }
        if (photo.isProblem !== undefined && photo.isProblem === true || photo.ir_status === 'UPLOAD_FAILED' || photo.ir_status === 'IR_ALERT') {
            loader = <Image source={problemRed} style={styles.indicator}/>;
        }
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
