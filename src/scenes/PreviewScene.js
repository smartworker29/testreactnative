import React, {Component} from 'react';
import {View, StyleSheet, Image, Dimensions, StatusBar, Platform, ActivityIndicator, Text} from "react-native";
import {connect} from "react-redux";
import {previewNavigationOptions} from "../navigators/options";
import {clearDeleteError, deleteImage} from "../actions/photo";
import {unlink} from 'react-native-fs';
import {allowAction, getPhotoPath, getPhotoPathWithPrefix} from "../utils/util";
import * as NavigationActions from '../actions/navigation'
import Swiper from 'react-native-swiper';
import I18n from 'react-native-i18n'
import PhotoView from 'react-native-photo-view';

class PreviewScene extends Component {
    static navigationOptions = ({navigation}) => previewNavigationOptions(navigation);

    constructor() {
        super();
    }

    deleteImage = async (uri, id) => {
        if (allowAction("deletePhoto")) {
            try {
                await unlink(getPhotoPath(uri));
                const result = await this.props.deleteImage(uri, id);
                if (result === true) {
                    this.props.navigation.dispatch(NavigationActions.back())
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    componentDidMount() {
        if (Platform.OS === 'ios') {
            StatusBar.setBarStyle('light-content');
        }
        const {uri, photoId} = this.props.navigation.state.params;
        this.props.navigation.setParams({
            currentPhotoUri: uri,
            photoId,
            deleteHandler: async (uri, id) => {
                await this.deleteImage(uri, id);
            }
        })
    }

    componentWillUnmount() {
        if (Platform.OS === 'ios') {
            StatusBar.setBarStyle('dark-content');
        }

        this.props.clearDeleteError();
    }

    changeIndex = (index) => {
        const {photos} = this.props.navigation.state.params;

        const photo = photos.get(index);
        this.props.navigation.setParams({
            index: index,
            currentPhotoUri: photos.get(index).uri,
            photoId: photo.id,
            deleteHandler: async (uri, id) => {
                await this.deleteImage(uri, id);
            }
        })
    };

    render() {
        const {uri, photos} = this.props.navigation.state.params;
        const index = photos.findIndex(photo => photo.uri === uri);
        let items = [];
        for (const photo of photos) {
            const filPath = getPhotoPathWithPrefix(photo.uri);
            items.push(
                <PhotoView
                    key={filPath}
                    source={{uri: filPath}}
                    minimumZoomScale={1.0}
                    maximumZoomScale={2.5}
                    androidScaleType="fitCenter"
                    onLoad={() => console.log("Image loaded!")}
                    style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} />
            )
        }

        const indicator = (this.props.deleteFetch) ? <ActivityIndicator size="small"/> : null;

        if (this.props.deleteFetch || this.props.deleteError !== null) {
            const text = (this.props.deleteError) ? this.props.deleteError : I18n.t("preview.remove");
            return (
                <View style={styles.containerInfo}>
                    {indicator}
                    <Text style={styles.deleteText}>{text}</Text>
                </View>
            )
        }

        return (
            <View style={styles.containerPhoto}>
                <Swiper style={styles.wrapper} index={index} showsButtons={false} showsPagination={false} loop={false}
                        onIndexChanged={this.changeIndex}>
                    {items}
                </Swiper>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        list: state.tasks.list,
        deleteError: state.photo.deleteError,
        deleteFetch: state.photo.deleteFetch,
        pin: state.auth.pin
    }
};

export default connect(mapStateToProps, {deleteImage, clearDeleteError})(PreviewScene);

const styles = StyleSheet.create({
    containerPhoto: {
        flex: 1,
        backgroundColor: "black"
    },
    containerInfo: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center"
    },
    image: {
        flex: 1
    },
    deleteText: {
        color: "white",
        marginTop: 20
    }
});