import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
    ActivityIndicator,
    ImageBackground,
    Modal,
    StyleSheet,
    View,
    Dimensions, TouchableOpacity, Image, Text, Platform, Animated, Easing
} from 'react-native'
import {addPhoto, uploadPhoto, clearPhoto} from '../actions/photo'
import {getPhotoPath, isIphoneX} from '../utils/util'
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

const ANDROID_INC = 10;
const ANDROID_DEC = 10;
const IOS_INC = 0.001;
const IOS_DEC = 0.001;

class PhotoScene extends Component {

    takePictureStatus = false;
    tmpZoom = 0;

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
            flashMode: RNCamera.Constants.FlashMode.auto,
            fadeValue: new Animated.Value(1),
            zoom: 0
        };
    }

    prepareRatio = async () => {
        if (Platform.OS === 'android' && this.camera) {
            const ratios = await this.camera.getSupportedRatiosAsync();
            if (ratios.includes("16:9") && _.last(ratios) !== "16:9") {
                this.setState({ratio: "16:9"});
            }
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

    onBackPress = () => {
        this.props.navigation.dispatch(NavigationActions.back());
    };

    componentWillUnmount() {
        const {backHandler} = this.props.navigation.state.params;
        backHandler();
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
            this.setState({flashMode: RNCamera.Constants.FlashMode.auto})
        }
        if (this.state.flashMode === RNCamera.Constants.FlashMode.auto) {
            this.setState({flashMode: RNCamera.Constants.FlashMode.on})
        }
        if (this.state.flashMode === RNCamera.Constants.FlashMode.on) {
            this.setState({flashMode: RNCamera.Constants.FlashMode.off})
        }
    };

    getOrientation() {
        return new Promise((resolve, reject) => {
            Orientation.getOrientation((err, orientation) => {
                return (err) ? reject(err) : resolve(orientation);
            });
        })
    }

    takePicture = async () => {

        if (this.takePictureStatus === true || !this.camera) {
            return;
        }

        this.fadeCamera();
        this.takePictureStatus = true;
        this.setState({processPhoto: true});

        const options = {quality: 0.9, exif: true, width: 1500, skipProcessing: true};
        let rotate = this.getRotate();

        const initial = await this.getOrientation();
        if (Platform.OS === 'ios' && initial !== 'PORTRAIT') {
            rotate = 0
        }

        const data = await this.camera.takePictureAsync(options);

        if (Platform.OS !== 'ios' && data.width > data.height) {
            rotate = rotate + 90;
        }

        const result = await ImageResizer.createResizedImage(data.uri, 1500, 1500, 'JPEG', 90, rotate);
        await unlink(data.uri);
        const path = getPhotoPath(result.path);
        await copyFile(result.uri, path);
        await unlink(result.uri);
        const finalUri = "file://" + path;
        const {id} = this.props.navigation.state.params;
        await this.props.addPhoto(finalUri, id);
        if (Map(this.props.visits.entities.offline).count() === 0) {
            this.props.uploadPhoto(finalUri, id);
        }
        this.setState(state => (
            {photoCount: state.photoCount + 1, processPhoto: false}
        ), () => {
            this.takePictureStatus = false;
        });
    };

    changeZoom = _.throttle(() => {
        console.log("this.tmpZoom", this.tmpZoom);
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
        const props = {};
        if (this.state.ratio) {
            props.ratio = this.state.ratio
        }
        return <Animated.View style={{flex: 1, opacity: this.state.fadeValue}}>
            <PinchGestureHandler
                onGestureEvent={this.pinchGesture}>
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    zoom={this.state.zoom}
                    style={[styles.preview]}
                    type={RNCamera.Constants.Type.back}
                    flashMode={this.state.flashMode}
                    onCameraReady={this.prepareRatio}
                    {...props}
                />
            </PinchGestureHandler>
        </Animated.View>
    }

    renderCamera() {
        let rowStyle = styles.bottomRow;
        let itemStyle = styles.bottomRowItem;
        const rotate = this.getRotate();

        let flashIcon = flashAuto;

        if (this.state.flashMode === RNCamera.Constants.FlashMode.on) {
            flashIcon = flashOn;
        }

        if (this.state.flashMode === RNCamera.Constants.FlashMode.off) {
            flashIcon = flashOff;
        }

        const buttonTint = (this.state.processPhoto === true) ? {tintColor: "#555"} : {tintColor: "white"};
        const overButton = (this.state.processPhoto === true) ?
            <View style={styles.photoWait}><ActivityIndicator/></View> :
            (this.state.photoCount > 0) ? <Text style={styles.photoCount}>{this.state.photoCount}</Text> : null;
        return (
            <View style={{flex: 1}}>
                {this.selectCamera()}
                <View style={{position: "absolute"}}>
                    <TouchableOpacity onPress={this.onBackPress} style={{paddingLeft: 16, paddingTop: 30}}
                                      hitSlop={{top: 50, left: 50, bottom: 50, right: 50}}>
                        <Image source={closeIcon}
                               style={{tintColor: "white", transform: [{rotate: -1 * rotate + 'deg'}]}}/>
                    </TouchableOpacity>
                </View>
                <View style={{position: "absolute", right: 0}}>
                    <TouchableOpacity onPress={this.changeFlashMode} style={{paddingRight: 16, paddingTop: 30}}
                                      hitSlop={{top: 50, right: 50, bottom: 50, left: 50}}>
                        <Image source={flashIcon} style={{tintColor: "white", width: 24, height: 24}}/>
                    </TouchableOpacity>
                </View>
                <View style={rowStyle}>
                    <View style={itemStyle}/>
                    <TouchableOpacity onPress={this.takePicture} style={styles.capture}>
                        {overButton}
                        <Image style={[styles.cameraImage, buttonTint]} source={cameraButton}/>
                    </TouchableOpacity>
                    <View style={itemStyle}/>
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
            visits: visits
        }
    },
    {uploadPhoto, addPhoto, back, clearPhoto}
)(sensors({Accelerometer: {updateInterval: 300}})(PhotoScene))


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
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    leftRow: {
        position: "absolute",
        left: 10,
        height: "100%",
        flexDirection: 'column',
        alignItems: "center",
        justifyContent: 'space-between'
    },
    bottomRow: {
        position: "absolute",
        bottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
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
        padding: 20,
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
    photoWait: {
        position: "absolute",
        zIndex: 9
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
    text: {color: 'white'}
});

let a = [
    1526892855704,
    1525694210294,
    1526376030942,
    1526892732439,
    1525694196604,
    1528111008736,
    1527847036361,
    1529663202866,
    1525694202564,
    1530178723377,
    1530169196238,
    1530178728216,
    1526376039863,
    1526376052396,
    1529652373433,
    1529663288947,
    1526892845065,
    1526892814148,
    1529663183150,
    1529663474636,
    1526892797368,
    1529663468154,
    1526892791284,
    1528110996753,
    1530016068906,
    1529920475279,
    1529663343507,
    1525694191898,
    1528101926627,
    1529652646882,
    1529663375711,
    1529663472228,
    1526892775468,
    1526892831350,
    1529652640370,
    1526892833457,
    1528101910341,
    1526376056036,
    1530169182116,
    1529663648230,
    1526376070631,
    1527837725639,
    1529663458493,
    1529652479211,
    1526892756325,
    1526376059819,
    1529652461072,
    1526892862463,
    1530178739353,
    1526892822349,
    1528109620634,
    1529652625824,
    1525692963699,
    1528887327635,
    1529652526003,
    1526892750058,
    1526376036206,
    1530169190590,
    1525694229478,
    1529652472277,
    1526892848835,
    1526376023251,
    1526892785494,
    1525694217245,
    1530016079046,
];

