import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
    ActivityIndicator,
    ImageBackground,
    Modal,
    StyleSheet,
    View,
    Dimensions,
    TouchableOpacity,
    Image,
    Text,
    Platform,
    Animated,
    Easing,
    TouchableWithoutFeedback,
    Vibration,
    SafeAreaView,
    Alert,
    StatusBar
} from 'react-native'
import {addPhoto, uploadPhoto, clearPhoto, setCameraType, deleteImage} from '../actions/photo'
import {getFileSize, getPhotoPath, isIphoneX} from '../utils/util'
import {goToSettings, back} from '../actions/navigation'
import {Container, Header, Left, Right, Icon, Title, ListItem, Button, Footer} from 'native-base'
import I18n from 'react-native-i18n'
import {NavigationActions} from 'react-navigation'
import _ from 'lodash'
import {RNCamera} from 'react-native-camera';
import {backIcon, cameraButton, closeIcon, flashAuto, flashOff, flashOn} from "../utils/images";
import {copyFile, unlink, stat} from 'react-native-fs';
import {decorator as sensors} from "react-native-sensors";
import ImageResizer from 'react-native-image-resizer';
import Orientation from "react-native-orientation";
import {PinchGestureHandler} from "react-native-gesture-handler"
import {Map} from "immutable";
import {basename} from "react-native-path";
//import ARCamera from "ar-shelf-camera"

let {height, width} = Dimensions.get('window');
const heightCamera = width / 3 * 4;
const DURATION = 1000;
const ANDROID_INC = 10;
const ANDROID_DEC = 10;
const IOS_INC = 0.001;
const IOS_DEC = 0.001;
const AR_CAMERA = 'AR_CAMERA';
const STANDARD_CAMERA = "STANDARD_CAMERA";

class PhotoScene extends Component {

    takePictureStatus = false;
    tmpZoom = 0;
    startedSession = false;

    constructor(props) {
        super(props);
        this.state = {
            // modalVisible: false,
            modalVisible: true,
            pressedBack: false,
            isSend: false,
            status: false,
            photoCount: 0,
            processPhoto: false,
            flashMode: RNCamera.Constants.FlashMode.off,
            fadeValue: new Animated.Value(1),
            zoom: 0,
            showButton: false,
            planeCaptured: false,
            arReady: false,
            cameraTypeIos: Platform.OS === "ios" && Platform.Version >= "11.3" ? "AR_CAMERA" : "STANDARD_CAMERA",
            files: [],
            photoIndex: null,
            finalUri: null,
        };
    }

    prepareRatio = async () => {
        if (Platform.OS === 'android' && this.camera) {
            const ratios = await this.camera.getSupportedRatiosAsync();
        }
    };

    fadeCamera() {
        Animated.timing(
            this.state.fadeValue,
            {
                toValue: 0,
                duration: 300,
            }
        ).start(() => {
            Animated.timing(
                this.state.fadeValue,
                {
                    toValue: 1,
                    duration: 300,
                }
            ).start();
        });
    }

    componentDidMount() {
        StatusBar.setHidden(true);
        const photoIndex = this.props.navigation.getParam("photoIndex", null);
        this.setState({photoIndex})

    }


    onBackPress = () => {
        this.props.navigation.dispatch(NavigationActions.back());
    };

    componentWillUnmount() {
        StatusBar.setHidden(false);
        const {backHandler} = this.props.navigation.state.params;
        if (this.ifAR() && this.camera !== null) {
            this.camera.stopSession();
        }
        backHandler && backHandler(this.state.finalUri);
    }

    uploadPhoto = () => {
        this.props.dispatch(NavigationActions.back())
    };

    addPhoto = () => {
        this.props.dispatch(NavigationActions.back())
    };

    async changeLayout() {
    }

    getRotate() {
        const {Accelerometer} = this.props;
        let x = 0;
        let y = 0;
        let z = 0;
        if (Accelerometer) {
            x = Accelerometer.x;
            y = Accelerometer.y;
            z = Accelerometer.z;
        }

        let rotate = 0;

        if (Platform.OS === 'ios') {
            if (x > 0.60 && z > -0.80 && Math.abs(y) < 0.60) {
                rotate = 90
            }
            if (x < -0.60 && z > -0.80 && Math.abs(y) < 0.60) {
                rotate = -90
            }
        } else {
            if (x > 6 && z < 8 && y < 6) {
                rotate = -90
            }
            if (x < -6 && z < 8 && y < 6) {
                rotate = 90
            }
        }

        return rotate;
    }

    changeFlashMode = () => {
        if (this.state.flashMode === RNCamera.Constants.FlashMode.off) {
            this.setState({flashMode: RNCamera.Constants.FlashMode.on})
        }
        if (this.state.flashMode === RNCamera.Constants.FlashMode.on) {
            this.setState({flashMode: RNCamera.Constants.FlashMode.off})
        }
        if (this.ifAR()) {
            this.camera.toggleFlash();
        }
    };

    getOrientation() {
        return new Promise((resolve, reject) => {
            Orientation.getOrientation((err, orientation) => {
                return (err) ? reject(err) : resolve(orientation);
            });
        })
    }

    confirmPlane() {
        if (this.camera && this.state.planeCaptured === true) {
            this.camera.confirmPlane();
        }
    };

    renderAr = () => {
        return <TouchableOpacity onPress={() => this.confirmPlane()}><ARCamera
            ref={ref => {
                if (this.startedSession === false && ref !== null) {
                    ref.startSession();
                    this.startedSession = true;
                }
                this.camera = ref;
            }}
            flashMode={this.state.flashMode}
            width={1500}
            quality={0.9}
            onCameraReady={() => {
                this.setState({arReady: true});
            }}
            onPlaneCaptureStarted={() => {
                console.log("onPlaneCaptureStarted")
            }}
            onPlaneCaptureSuccess={() => {
                this.setState({planeCaptured: true});
                Vibration.vibrate(DURATION)
            }}
            onPlaneCaptureLost={() => {
                this.setState({planeCaptured: false});
            }}
        /></TouchableOpacity>
    };

    renderCameraElement = () => {
        const props = {};
        if (this.state.ratio) {
            props.ratio = "4:3"
        }
        return <RNCamera
            ref={ref => {
                this.camera = ref;
            }}
            zoom={this.state.zoom}
            style={[styles.preview]}
            type={RNCamera.Constants.Type.back}
            flashMode={this.state.flashMode}
            onCameraReady={this.prepareRatio}
            ratio="4:3"
        />
    };

    getPhotosIndex() {
        const {id} = this.props.navigation.state.params;
        const {sync} = this.props;
        const index = this.props.photos.filter(photo => {
            return photo.visit === id || photo.tmpId === id || sync[photo.visit] === id;
        }).count();
        return index + 1;
    }

    ifAR = () => {
        //Disable AR
        return false;
        const {pins, pin} = this.props;
        const enable_ar_camera = pins[pin].enable_ar_camera;
        return Platform.OS === 'ios' && Platform.Version >= "11.3" && this.state.cameraTypeIos === AR_CAMERA && enable_ar_camera === true
    };

    ifIosStandard = () => {
        return true;
        const {pins, pin} = this.props;
        const enable_ar_camera = pins[pin].enable_ar_camera;
        return Platform.OS === 'ios' && (this.state.cameraTypeIos === STANDARD_CAMERA || enable_ar_camera !== true)
    };

    takePicture = async () => {

        if (this.takePictureStatus === true || !this.camera) {
            return;
        }

        const photoUUID = this.props.navigation.getParam("photoUUID", null);
        const photoIndex = this.props.navigation.getParam("photoIndex", null);

        console.log("photoUUID", photoUUID);
        console.log("photoIndex", photoIndex);

        this.fadeCamera();
        this.takePictureStatus = true;
        this.setState({processPhoto: true});

        const options = {quality: 0.9, exif: true, width: 1500, skipProcessing: true};
        let rotate = 0;

        if (Platform.OS === "android") {
            rotate = this.getRotate();
        }

        const initial = await this.getOrientation();

        let data;
        if (this.ifAR()) {
            try {
                data = await this.camera.takePicture(1500, 0.9);
            } catch (error) {
                data = null;
            }
        } else {
            data = await this.camera.takePictureAsync(options);
        }

        if (data === null) {
            this.takePictureStatus = false;
            this.setState({processPhoto: false});
            return alert("Фото не сделано");
        }

        if (this.ifIosStandard() && initial !== 'PORTRAIT') {
            rotate = 0
        }

        if (Platform.OS !== 'ios' && data.width > data.height) {
            rotate = rotate + 90;
        }

        if (Platform.OS === 'ios' && initial === 'PORTRAIT' && rotate !== 0) {
            rotate = 0
        }

        const width = (Platform.OS === 'ios') ? data.width : 1500;
        const height = (Platform.OS === 'ios') ? data.height : 1500;

        const result = await ImageResizer.createResizedImage(data.uri, width, height, 'JPEG', 90);
        if (result.size === 0) {
            this.takePictureStatus = false;
            this.setState({processPhoto: false});
            await unlink(data.uri);
            await unlink(result.uri);
            return alert("Размер фото 0 байт, фото будет удаленно");
        }

        this.setState(state => {
            const files = [...state.files];
            files.push({uri: basename(result.uri), size: result.size});
            return {files}
        });

        const index = photoIndex ? photoIndex : this.getPhotosIndex();
        await unlink(data.uri);
        const path = getPhotoPath(result.path);
        await copyFile(result.uri, path);
        await unlink(result.uri);
        const finalUri = "file://" + path;
        const {id} = this.props.navigation.state.params;
        await this.props.addPhoto(finalUri, id, index);
        if (Map(this.props.visits.entities.offline).count() === 0) {
            //this.props.uploadPhoto(finalUri, id, null, undefined, index);
        }

        if (photoUUID) {
            try {
                const oldPhoto = this.props.photos.find(photo => photo.uuid === photoUUID);
                const result = await this.props.deleteImage(oldPhoto.uri, oldPhoto.id, true);
                if (result) {
                    await unlink(getPhotoPath(oldPhoto.uri));
                }
            } catch (error) {
                console.log(error);
            }
        }

        this.setState(state => (
            {photoCount: state.photoCount + 1, processPhoto: false, finalUri}
        ), async () => {
            if (photoUUID === null) {
                this.takePictureStatus = false;
            } else if (photoUUID && this.state.photoCount < 1) {
                this.takePictureStatus = false;
            } else if (photoUUID && this.state.photoCount === 1) {
                this.onBackPress();
            }
        });
    };

    changeZoom = _.throttle(() => {
        this.setState({zoom: this.tmpZoom})
    }, 20);

    pinchGesture = (event) => {
        const INC = (Platform.OS === "android") ? ANDROID_INC : IOS_INC;
        const DEC = (Platform.OS === "android") ? ANDROID_DEC : IOS_DEC;
        if (event.nativeEvent.velocity > 0) {
            this.tmpZoom += (event.nativeEvent.velocity * INC);
        }
        if (event.nativeEvent.velocity < 0) {
            this.tmpZoom += (event.nativeEvent.velocity * DEC);
        }
        if (this.tmpZoom > 1) {
            this.tmpZoom = 1;
        }
        if (this.tmpZoom < 0) {
            this.tmpZoom = 0
        }
        this.changeZoom();
    };

    selectCamera() {
        let camera = null;
        if (Platform.OS === 'ios') {
            camera = (this.ifAR())
                ? this.renderAr()
                : this.renderCameraElement();
        } else {
            camera = this.renderCameraElement();
        }

        return camera
    }

    closeArCamera = () => {
        this.setState({cameraTypeIos: STANDARD_CAMERA});
        if (this.camera) {
            this.camera.stopSession();
        }
    };

    renderBottomControl = () => {
        const overButton = (this.state.processPhoto === true) ?
            <View style={{position: "absolute", zIndex: 9}}><ActivityIndicator/></View> :
            (this.state.photoCount > 0) ? <Text style={styles.photoCount}>{this.state.photoCount}</Text> : null;
        const buttonTint = (this.state.processPhoto === true) ? {tintColor: "#555"} : {tintColor: "white"};

        const text = !this.state.planeCaptured ? I18n.t("arCamera.captureStarted")
            : I18n.t("arCamera.captureSuccess");

        if (this.ifAR()) {
            if (this.state.arReady) {
                return (
                    <TouchableOpacity onPress={this.takePicture}>
                        {overButton}
                        <Image style={[styles.cameraImage, buttonTint]} source={cameraButton}/>
                    </TouchableOpacity>
                )
            } else {
                return (
                    <View style={{alignItems: "center"}}>
                        <Text style={styles.arText}>{text}</Text>;
                        <TouchableOpacity
                            onPress={this.closeArCamera}
                            style={styles.cancelButton}>
                            <Text style={styles.cancelAr}>Отмена</Text>
                        </TouchableOpacity>
                    </View>
                )
            }

        } else {
            return (
                <TouchableOpacity onPress={this.takePicture} style={styles.capture}>
                    {overButton}
                    <Image style={[styles.cameraImage, buttonTint]} source={cameraButton}/>
                </TouchableOpacity>
            )
        }
    };

    renderCamera() {
        const topPadding = (Platform.OS === "ios") ? 0 : 15;
        const rotate = this.getRotate();

        let flashIcon = flashAuto;

        if (this.state.flashMode === RNCamera.Constants.FlashMode.on) {
            flashIcon = flashOn;
        }

        if (this.state.flashMode === RNCamera.Constants.FlashMode.off) {
            flashIcon = flashOff;
        }
        const {id} = this.props.navigation.state.params;
        const style = (!this.ifAR()) ? {flex: 1} : {};
        const diff = height - heightCamera;
        return (
            <View style={style}>
                <View style={{height: 55}}/>
                {this.selectCamera()}
                <SafeAreaView style={{position: "absolute", top: 22}}>
                    <TouchableOpacity onPress={this.onBackPress} style={{paddingLeft: 16}}
                                      hitSlop={{top: 50, left: 50, bottom: 50, right: 50}}>
                        <Image source={closeIcon}
                               style={{tintColor: "white", transform: [{rotate: -1 * rotate + 'deg'}]}}/>
                    </TouchableOpacity>
                </SafeAreaView>
                <SafeAreaView style={{position: "absolute", right: 0, top: 22}}>
                    <TouchableOpacity onPress={this.changeFlashMode} style={{paddingRight: 16}}
                                      hitSlop={{top: 50, right: 50, bottom: 50, left: 50}}>
                        <Image source={flashIcon} style={{tintColor: "white", width: 24, height: 24}}/>
                    </TouchableOpacity>
                </SafeAreaView>

                <View style={diff - 55 > 65 ? styles.bottomRowFlex : styles.bottomRowAbs}>
                    {this.renderBottomControl()}
                </View>
            </View>
        )
    }

    render() {
        if (this.state.modalVisible === false && !this.state.uri) {
            return null
        }

        return (
            <Container
                style={{backgroundColor: "black"}}>
                {this.renderCamera()}
            </Container>
        )
    }
}

PhotoScene.propTypes = {
    uri: PropTypes.string,
    isFetch: PropTypes.bool,
    error: PropTypes.object
};

export default connect((state) => {
        const {photo, app, visits} = state;
        return {
            uri: photo.uri,
            isFetch: photo.isFetch,
            error: photo.error,
            ratios: app.ratioExceptions,
            visits: visits,
            pins: state.auth.pins,
            pin: state.auth.pin,
            sync: visits.sync,
            photos: photo.photos
        }
    },
    {uploadPhoto, addPhoto, back, clearPhoto, setCameraType, deleteImage}
)((Platform.OS === "android") ? sensors({Accelerometer: {updateInterval: 300}})(PhotoScene) : PhotoScene)


const styles = StyleSheet.create({
    footer: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'black',
        flexDirection: 'row', paddingBottom: isIphoneX() ? 15 : 0,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    preview: {
        width,
        height: width / 3 * 4
        //justifyContent: 'flex-end',
        //alignItems: 'center',
    },
    leftRow: {
        position: "absolute",
        left: 10,
        height: "100%",
        flexDirection: 'column',
        alignItems: "center",
        justifyContent: 'space-between'
    },
    bottomRowAbs: {
        width: "100%",
        position: "absolute",
        flexDirection: 'row',
        justifyContent: 'center',
        zIndex: 9,
        bottom: 10
    },
    bottomRowFlex: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        zIndex: 9,
    },
    leftRowItem: {
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    bottomRowItem: {
        flex: 1,
        flexDirection: "row",
        justifyContent: 'center',
        alignSelf: 'center'
    },
    backText: {
        width: "100%",
        color: "white",
        fontWeight: "bold"
    },
    capture: {
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: "center",
        alignSelf: 'center'
    },
    cameraImage: {
        width: 65,
        height: 65
    },
    button: {
        flex: 1,
        backgroundColor: 'black'
    },
    photoCount: {
        position: "absolute",
        color: "black",
        fontSize: 15,
        zIndex: 9,
        fontWeight: "bold"
    },
    image: {
        flex: 1,
        justifyContent: 'flex-start',
        width: "100%"
    },
    arText: {
        width: 300,
        color: "white",
        textAlign: "center"
    },
    cancelButton: {
        margin: 10,
        marginTop: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 4,
        width: 100,
        alignItems: "center",
        justifyContent: "center"
    },
    cancelAr: {
        color: "white"
    },
    text: {color: 'white'}
});

