import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
    ActivityIndicator,
    ImageBackground,
    Modal,
    StyleSheet,
    View,
    Dimensions, TouchableOpacity, Image
} from 'react-native'
import { addPhoto, uploadPhoto, clearPhoto } from '../actions/photo'
import { isIphoneX } from '../utils/util'
import { goToSettings,  back } from '../actions/navigation'
import { Container, Header, Left, Text, Right, Icon, Title, ListItem, Button, Footer } from 'native-base'
import I18n from 'react-native-i18n'
import { NavigationActions } from 'react-navigation'
import _ from 'lodash'
import { RNCamera } from 'react-native-camera';
import { cameraIcon } from "../utils/images";
import Orientation from "react-native-orientation";

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
        }
    }

    onBackPress = () => {
        this.props.navigation.dispatch(NavigationActions.back())
    }

    async componentDidMount() {
        //console.log(1);
        //BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    }

    componentWillMount() {
        Orientation.unlockAllOrientations();
    }

    async componentWillUnmount() {
        Orientation.lockToPortrait();
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

    showCamera(val, back) {

        this.setState({
            modalVisible: val,
            pressedBack: true
        })

        if (back !== undefined) {
            this.props.back()
        }
    }

    takePicture = async () => {

        if (this.takePictureStatus === true) {
            return;
        }

        this.takePictureStatus = true;

        if (!this.camera) {
            return this.takePictureStatus = false;
        }

        const options = {quality: 0.5, base64: true, exif: true, width: 700, fixOrientation:true};
        const data = await this.camera.takePictureAsync(options);
        this.setState({
            uri: data.uri, isSend: false
        }, () => {
            this.showCamera(false);
            this.takePictureStatus = false;
        })

    }

    render() {
        const {isFetch, uri, error, uploadPhoto} = this.props
        const {id} = this.props.navigation.state.params
        if (this.state.modalVisible === false && !this.state.uri) {
            return null
        }

        return (
            <Container>
                <View style={styles.container}>
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
                                style={styles.text}>{this.state.isSend ? I18n.t('photo.makePhoto') : I18n.t('photo.reship')}</Text>
                        </Button>
                        <Button block transparent style={styles.button}
                                disabled={this.state.isSend || this.state.uri === null}
                                onPress={() => {
                                    if (this.state.uri !== null) {
                                        this.props.addPhoto(this.state.uri, id)
                                        this.setState({isSend: true})
                                        this.props.uploadPhoto(this.state.uri, id)
                                        this.props.back()
                                    }
                                }}>
                            <Text style={styles.text}>{I18n.t('photo.send')}</Text>

                        </Button>

                    </View> : null}
                    <Modal
                        animationType="slide"
                        style={{backgroundColor: 'black'}}
                        transparent={false}
                        visible={this.state.modalVisible}
                        onRequestClose={(data) => this.showCamera(false, data)}
                    >
                        <RNCamera
                            ref={ref => {
                                this.camera = ref;
                            }}
                            zoom={0.0}
                            style={styles.preview}
                            type={RNCamera.Constants.Type.back}
                            flashMode={RNCamera.Constants.FlashMode.off}
                            permissionDialogTitle={'Permission to use camera'}
                            permissionDialogMessage={'We need your permission to use your camera phone'}
                        >
                            <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center',}}>
                                <TouchableOpacity
                                    onPress={this.takePicture}
                                    style={styles.capture}
                                >
                                    <Image style={styles.cameraImage} source={cameraIcon}/>
                                </TouchableOpacity>
                            </View>
                        </RNCamera>
                    </Modal>

                </View>

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
    capture: {
        flex: 0,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20
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

