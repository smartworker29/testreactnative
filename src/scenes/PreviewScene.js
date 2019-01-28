import React, {Component} from 'react';
import {View, StyleSheet, Image, Dimensions, StatusBar, Platform, ActivityIndicator, Text} from "react-native";
import {connect} from "react-redux";
import {previewNavigationOptions} from "../navigators/options";
import {clearDeleteError, deleteImage} from "../actions/photo";
import {unlink, exists} from 'react-native-fs';
import {allowAction, getPhotoFromVisit, getPhotoPath, getPhotoPathWithPrefix} from "../utils/util";
import * as NavigationActions from '../actions/navigation'
import Swiper from 'react-native-swiper';
import I18n from 'react-native-i18n'
import PhotoView from 'react-native-photo-view';
import {irSuccess, irSuccessGreen, photoUnsyncIcon, problemRed, uploadSuccessGreen} from "../utils/images";
import {goToPhoto} from "../actions/navigation";
import _ from "lodash";

let {height, width} = Dimensions.get('window');

class PreviewScene extends Component {
    static navigationOptions = ({navigation}) => previewNavigationOptions(navigation);

    swiper = null;

    constructor() {
        super();
        this.state = {
            photoUri: null,
            initIndex: 0,
            renderSwiper: true
        }
    }

    deleteImage = async (uri, id) => {
        if (allowAction("deletePhoto")) {
            try {
                const result = await this.props.deleteImage(uri, id);
                if (result === true) {
                    await unlink(getPhotoPath(uri));
                    this.props.navigation.dispatch(NavigationActions.back())
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    rePhotoCallback = async (photoUri) => {
        if (!photoUri) {
            return this.setState({renderSwiper: true});
        }
        const {id} = this.props.navigation.state.params;
        const photos = getPhotoFromVisit(id, this.props.photos, this.props.sync);
        const photo = photos.find(photo => photo && photo.uri === photoUri);
        if (!photo) {
            return this.setState({renderSwiper: true});
        }
        const photoIndex = photos.findIndex(photo => photo && photo.uri === photoUri);
        if (photoIndex === undefined) {
            return this.setState({renderSwiper: true});
        }
        this.setState({photoUri, initIndex: photoIndex, renderSwiper: false}, () => {
            this.props.navigation.setParams({
                count: photos.count(),
                index: photoIndex,
                photo
            });
            this.setState({renderSwiper: true})
        });


    };

    componentWillMount() {
        const uri = this.props.navigation.getParam("uri");
        const id = this.props.navigation.getParam("id");
        const photos = getPhotoFromVisit(id, this.props.photos, this.props.sync);
        const index = photos.findIndex(photo => photo && photo.uri === uri);
        this.setState({photoUri: uri, initIndex: index || 0});
    }

    initData = () => {
        const {id, photoUUID} = this.props.navigation.state.params;
        const photos = getPhotoFromVisit(id, this.props.photos, this.props.sync);
        const photo = photos.find(photo => photo && photo.uuid === photoUUID);
        if (!photo) {
            return;
        }
        this.props.navigation.setParams({
            count: photos.count(),
            currentPhotoUri: photo.uri,
            visitId: id,
            photo,
            deleteHandler: async (uri, id) => {
                await this.deleteImage(uri, id);
            },
            rePhoto: (photo) => {
                this.setState({renderSwiper: false});
                this.props.goToPhoto(photo.visit, this.rePhotoCallback, photo.uuid, photo.index);
            }
        })
    };

    componentDidMount() {
        if (Platform.OS === 'ios') {
            StatusBar.setBarStyle('light-content');
        }
        this.initData();
    }

    componentWillUnmount() {
        if (Platform.OS === 'ios') {
            StatusBar.setBarStyle('dark-content');
        }

        this.props.clearDeleteError();
    }

    changeIndex = (index) => {
        const {id} = this.props.navigation.state.params;
        const photos = getPhotoFromVisit(id, this.props.photos, this.props.sync);
        const photo = photos.get(index);
        this.props.navigation.setParams({
            count: photos.count(),
            index,
            photo
        })
    };

    renderStatus(photo) {
        let icon;
        let message;

        if (photo.isUploading === true) {
            icon = photoUnsyncIcon;
            message = "Фотография загружается"
        }

        if (photo.isUploaded === true || photo.ir_status === 'UPLOAD_SUCCESS') {
            icon = uploadSuccessGreen;
            message = "Фотография успешно загружена "
        }

        if (photo.isProblem === true || photo.ir_status === 'UPLOAD_FAILED') {
            icon = problemRed;
            message = "Загрузка на сервер не прошла"
        }

        if (photo.ir_status === 'IR_STARTED') {
            icon = irSuccess;
            message = "Начато распознавание"
        }

        if (photo.ir_status === 'IR_SUCCESS') {
            icon = irSuccessGreen;
            message = "Успешное распознавание"
        }

        if (photo.ir_status === 'IR_ALERT') {
            icon = problemRed;
            message = photo.ir_message
        }

        if (icon === undefined) {
            return null;
        }

        return (
            <View style={styles.statusContainer}>
                <View style={styles.statusBackground}/>
                <View style={styles.statusRow}>
                    <Image source={icon}/>
                    <View style={{height: 46, maxWidth: "90%", minWidth: "70%", justifyContent: "center"}}>
                        <Text adjustsFontSizeToFit={true} numberOfLines={2} minimumFontScale={0.7}
                              style={styles.statusText}>{message}</Text>
                    </View>
                </View>
            </View>
        )
    }

    render() {
        const {id} = this.props.navigation.state.params;
        const photos = getPhotoFromVisit(id, this.props.photos, this.props.sync);

        let items = [];
        const filteredPhoto = photos.filter(photo => !!photo);
        for (const photo of filteredPhoto) {
            const filPath = getPhotoPathWithPrefix(photo.uri);
            items.push(
                <View style={{flex: 1}} key={filPath}>
                    <PhotoView
                        source={{uri: filPath}}
                        minimumZoomScale={1.0}
                        maximumZoomScale={2.5}
                        androidScaleType="fitCenter"
                        style={{width, height: width / 3 * 4, justifyContent: 'center', alignItems: 'center'}}/>
                    {this.renderStatus(photo)}
                </View>
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
                {this.state.renderSwiper ?
                    <Swiper style={styles.wrapper} index={this.state.initIndex} showsButtons={false}
                            showsPagination={false}
                            loop={false}
                            ref={el => this.swiper = el}
                            onIndexChanged={this.changeIndex}>
                        {items}
                    </Swiper> : null}
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        list: state.tasks.list,
        deleteError: state.photo.deleteError,
        deleteFetch: state.photo.deleteFetch,
        pin: state.auth.pin,
        loadedTokens: state.photo.loadedTokens,
        photos: state.photo.photos,
        sync: state.visits.sync,
    }
};

export default connect(mapStateToProps, {deleteImage, clearDeleteError, goToPhoto})(PreviewScene);

const styles = StyleSheet.create({
    containerPhoto: {
        flex: 1,
        backgroundColor: "black"
    },
    statusContainer: {
        position: "absolute",
        width: "100%",
        height: 46,
        bottom: 0,
        justifyContent: "center"
    },
    statusBackground: {
        flex: 1,
        opacity: 0.6,
        backgroundColor: "#000000",
    },
    statusRow: {
        position: "absolute",
        alignSelf: 'center',
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    statusText: {
        color: "white",
        marginHorizontal: 10,
        marginVertical: 3,
        fontSize: 15
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