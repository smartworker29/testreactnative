import React, {Component, PureComponent} from 'react';
import {StyleSheet, Text, ActivityIndicator, ImageBackground, TouchableOpacity, View,} from 'react-native';
import I18n from 'react-native-i18n'
import PropTypes from 'prop-types';
import {Icon} from 'native-base'

export default class ImageView extends PureComponent {
    render() {
        const {photo} = this.props
        console.log('ImageView', photo)
        return (
            <TouchableOpacity {...this.props} onPress={this.props.onPress}>
                <View style={styles.item}>

                    {photo.isUpload ?null : <ActivityIndicator size="small" style={styles.indicator}/>}
                    <ImageBackground style={styles.image}
                        // loader={<ActivityIndicator/>}
                                     source={{uri: photo.uri}}


                    />
                </View>
            </TouchableOpacity>
        )
    }
}

ImageView.propTypes = {
    /**
     * The data of visit
     */
    photo: PropTypes.object,
    /**
     * action for when pressing the item
     */
    onPress: PropTypes.func,

}

ImageView.defaultProps = {
    photo: {}
}

const styles = StyleSheet.create({
    item: {
        padding: 4,
        height: 108,
        width: 108,
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
        top: 50,
        left: 50,
    },
    image: {
        zIndex: 0,
        height: 100,
        width: 100,
    }
});
