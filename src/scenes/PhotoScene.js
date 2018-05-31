import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
    ActivityIndicator,
    ImageBackground,
    Modal,
    StyleSheet,
    View,
    Dimensions, TouchableOpacity, Image, Text, Platform
} from 'react-native'
import {addPhoto, uploadPhoto, clearPhoto} from '../actions/photo'
import {getPhotoPath, isIphoneX} from '../utils/util'
import {goToSettings, back} from '../actions/navigation'
import {Container, Header, Left, Right, Icon, Title, ListItem, Button, Footer} from 'native-base'
import I18n from 'react-native-i18n'
import {NavigationActions} from 'react-navigation'
import _ from 'lodash'
import {RNCamera} from 'react-native-camera';
import {backIcon, cameraButton} from "../utils/images";
import {copyFile, unlink, stat} from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';
import {decorator as sensors} from "react-native-sensors";
import ImageResizer from 'react-native-image-resizer';
import Orientation from "react-native-orientation";

class PhotoScene extends Component {

    takePictureStatus = false;

    constructor(props) {
        super(props);
        this.state = {
            // modalVisible: false,
            modalVisible: true,
            pressedBack: false,
            isSend: false,
            status: false,
            photoCount: 0,
            processPhoto: false
        }
    }

    prepareRatio = async () => {
        if (Platform.OS === 'android' && this.camera) {
            const ratios = await this.camera.getSupportedRatiosAsync();
            if (ratios.includes("16:9") && _.last(ratios) !== "16:9") {
                this.setState({ratio: "16:9"});
            }
        }
    };

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

    getOrientation() {
        return new Promise((resolve, reject) => {
            Orientation.getOrientation((err, orientation) => {
                return (err) ? reject(err) : resolve(orientation);
            });
        })
    }

    takePicture = async () => {

        if (this.takePictureStatus === true) {
            return;
        }

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
        this.props.uploadPhoto(finalUri, id);
        this.setState(state => (
            {photoCount: state.photoCount + 1, processPhoto: false}
        ), () => {
            this.takePictureStatus = false;
        });
    };

    selectCamera() {
        const props = {};
        if (this.state.ratio) {
            props.ratio = this.state.ratio
        }
        return <RNCamera
            ref={ref => {
                this.camera = ref;
            }}

            zoom={0.0}
            style={[styles.preview,]}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.off}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
            onCameraReady={this.prepareRatio}
            {...props}
        />
    }

    renderCamera() {
        let rowStyle = styles.bottomRow;
        let itemStyle = styles.bottomRowItem;
        const rotate = this.getRotate();
        const buttonTint = (this.state.processPhoto === true) ? {tintColor: "#555"} : {tintColor: "white"};
        const overButton = (this.state.processPhoto === true) ?
            <View style={styles.photoWait}><ActivityIndicator/></View> :
            (this.state.photoCount > 0) ? <Text style={styles.photoCount}>{this.state.photoCount}</Text> : null;
        return (
            <View style={{flex: 1}}>
                {this.selectCamera()}
                <View style={rowStyle}>
                    <View style={itemStyle}>
                        <TouchableOpacity onPress={this.onBackPress} style={{padding: 30}}
                                          hitSlop={{top: 200, left: 100, bottom: 200, right: 10}}>
                            <Image source={backIcon}
                                   style={{tintColor: "white", transform: [{rotate: -1 * rotate + 'deg'}]}}/>
                        </TouchableOpacity>
                    </View>
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
        const {photo, app} = state;
        return {
            uri: photo.uri,
            isFetch: photo.isFetch,
            error: photo.error,
            ratios: app.ratioExceptions
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
        alignItems: 'center'
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
        padding: 30,
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

