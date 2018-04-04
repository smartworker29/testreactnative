import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
    ActivityIndicator,
    ImageBackground,
    Modal,
    StyleSheet,
    View,
    Dimensions, TouchableOpacity, Image, Text, Platform
} from 'react-native'
import { addPhoto, uploadPhoto, clearPhoto } from '../actions/photo'
import { isIphoneX } from '../utils/util'
import { goToSettings, back } from '../actions/navigation'
import { Container, Header, Left, Right, Icon, Title, ListItem, Button, Footer } from 'native-base'
import I18n from 'react-native-i18n'
import { NavigationActions } from 'react-navigation'
import _ from 'lodash'
import { RNCamera } from 'react-native-camera';
import { cameraIcon } from "../utils/images";
import Orientation from "react-native-orientation";
import ImageZoom from 'react-native-image-pan-zoom';

class PhotoScene extends Component {

    takePictureStatus = false;

    constructor(props) {
        super(props)
        this.state = {
            // modalVisible: false,
            modalVisible: true,
            pressedBack: false,
            isSend: false,
            status: false,
            orientation: null
        }
    }
    prepareRatio = async () => {
        if (Platform.OS === 'android' && this.camera) {
            const ratios = await this.camera.getSupportedRatiosAsync();

            const ratio =  ratios[ratios.length - 1];

            this.setState({ ratio });
        }
    }

    onBackPress = () => {
        this.props.navigation.dispatch(NavigationActions.back());
    }

    async componentDidMount() {
        Orientation.addOrientationListener(() => {
            console.log(333)
        });
    }

    componentWillMount() {
        Orientation.unlockAllOrientations();
    }

    componentWillUnmount() {
        Orientation.lockToPortrait();
        const {backHandler} = this.props.navigation.state.params;
        backHandler();
    }

    uploadPhoto = () => {
        this.props.dispatch(NavigationActions.back())
    }

    addPhoto = () => {
        this.props.dispatch(NavigationActions.back())
    }

    // componentDidMount() {
    //     NetInfo.isConnected.addEventListener('change', this._handleConnectionChange);
    // }
    //
    // componentWillUnmount() {
    //     NetInfo.isConnected.removeEventListener('change', this._handleConnectionChange);
    // }
    //
    // _handleConnectionChange = (isConnected) => {
    //     this.setState({ isConnected: isConnected });
    // };

    getOrientation() {
        return new Promise((resolve, reject) => {
            Orientation.getOrientation((err, orientation) => {
                return (err) ? reject(err) : resolve(orientation);
            });
        })
    }

    showCamera(val, back) {

        this.setState({
            modalVisible: val,
            pressedBack: true
        })

        if (back !== undefined) {
            this.props.back()
        }
    }

    async changeLayout() {
        const initial = await this.getOrientation();
        this.setState({orientation: initial})
    }

    takePicture = async () => {

        if (this.takePictureStatus === true) {
            return;
        }

        this.takePictureStatus = true;

        if (!this.camera) {
            return this.takePictureStatus = false;
        }

        const options = {quality: 0.95, base64: true, exif: true, fixOrientation: true};
        const initial = await this.getOrientation();
        if (initial === 'PORTRAIT') {
            options.width = 720
        } else {
            options.width = 1000
        }

        const data = await this.camera.takePictureAsync(options);
        this.setState({
            uri: data.uri
        }, () => {
            this.showCamera(false);
            this.takePictureStatus = false;
        })

    }

    renderPreview() {

        const {isFetch, uri, error, uploadPhoto} = this.props
        const {id, backHandler} = this.props.navigation.state.params
        if (this.state.modalVisible === false && !this.state.uri) {
            return null
        }

        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black'}}>
                {this.state.uri ? <ImageBackground style={styles.image}
                                                   source={{uri: this.state.uri}}>
                </ImageBackground> : null}
                {isFetch ? <ActivityIndicator color="white" style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}/> : null}


                {!this.state.modalVisible ? <View style={styles.footer}>
                    <Button block transparent style={styles.button} onPress={() => this.showCamera(true)}>
                        <Text
                            style={styles.text}>{this.state.uri ? I18n.t('photo.reship') : I18n.t('photo.makePhoto')}</Text>
                    </Button>
                    <Button block transparent style={styles.button}
                            disabled={this.state.uri === null}
                            onPress={async () => {
                                if (this.state.uri !== null) {                                   
                                    await this.props.addPhoto(this.state.uri, id);
                                    this.props.uploadPhoto(this.state.uri, id);
                                    this.props.back();
                                    backHandler();
                                }
                            }}>
                        <Text style={styles.text}>{I18n.t('photo.send')}</Text>
                    </Button>
                </View> : null}
            </View>
        )

    }

    renderCamera() {

        return (
            <View style={{flex: 1}}>
            {/*<View style={{flex: 1, alignItems: "center"}}>*/}
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}

                    zoom={0.0}
                    style={[styles.preview,]}
                    type={RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.off}
                    onCameraReady={this.prepareRatio} // You can only get the supported ratios when the camera is mounted
                    ratio={this.state.ratio}
                    permissionDialogTitle={'Permission to use camera'}
                    permissionDialogMessage={'We need your permission to use your camera phone'}
                />
                <View style={styles.bottomRow}>
                    <View style={styles.bottomRowItem}>
                        <TouchableOpacity onPress={this.onBackPress}>
                            <Text style={styles.backText}>{I18n.t('photo.back')}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={this.takePicture} style={styles.capture}>
                        <Image style={styles.cameraImage} source={cameraIcon}/>
                    </TouchableOpacity>
                    <View style={styles.bottomRowItem}/>
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
                onLayout={() => this.changeLayout()}
                style={{backgroundColor: "black"}}>

                {this.state.modalVisible ? this.renderCamera() : this.renderPreview()}
            </Container>
        )
    }
}

PhotoScene.propTypes = {
    uri: PropTypes.string,
    isFetch: PropTypes.bool,
    error: PropTypes.object
}
export default connect((state) => {
        const {photo} = state
        return {
            uri: photo.uri,
            isFetch: photo.isFetch,
            error: photo.error
        }
    },
    {uploadPhoto, addPhoto, back, clearPhoto}
)(PhotoScene)

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
    bottomRow: {
        position: "absolute",
        bottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    bottomRowItem: {
        flex: 1,
        flexDirection: "row",
        justifyContent: 'center',
        alignSelf: 'center'
    },
    backText: {
        color: "white",
        fontWeight: "bold"
    },
    capture: {
        flexDirection: "row",
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: 'transparent'
    },
    cameraImage: {
        width: 36,
        height: 36
    },
    button: {
        flex: 1,
        backgroundColor: 'black'
    },
    image: {
        flex: 1,
        justifyContent: 'flex-start',
        width: Dimensions.get('window').width
    },
    text: {color: 'white'}
})

