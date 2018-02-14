import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {ActivityIndicator, ImageBackground, Modal, StyleSheet, View, Dimensions} from 'react-native';
import {CameraKitCameraScreen} from 'react-native-camera-kit';
import Toolbar from '../component/Toolbar'
import {addPhoto, uploadPhoto, clearPhoto} from '../actions/photo'
import {isIphoneX} from '../utils/util'
import {goToCreateVisit, goToSettings, goToVisitDetails, back} from '../actions/navigation'
import {Container, Header, Left, Body, Text, Right, Icon, Title, ListItem, Button, Fab} from 'native-base';
import I18n from 'react-native-i18n'


class PhotoScene extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible: true,
        }
    }

    showCamera(val) {
        this.setState({
            modalVisible: val
        })
    }

    onBottomButtonPressed(event) {

        const captureImages = JSON.stringify(event.captureImages);

        if (event.type === 'left') {
            if (this.props.uri == null) {
                this.props.back()
            }
            this.showCamera(false)
        } else if (event.type === 'capture') {

        } else if (event.type === 'right') {
            this.setState({
                photo: event.captureImages[0].uri
            }, () => this.showCamera(false))
            this.props.addPhoto(event.captureImages[0].uri)

        }

    }


    render() {
        const {isFetch, uri, error, uploadPhoto} = this.props
        const {id} = this.props.navigation.state.params

        return (
            <Container>
                <Toolbar
                    leftButton={<Button
                        transparent
                        onPress={() =>{
                            this.props.clearPhoto()
                            this.props.back()}}
                    >
                        <Icon name="arrow-back"/>
                    </Button>}
                    title={I18n.t('photo.title')}
                    rightButton={null}
                />
                <View style={styles.container}>
                    {uri ? <ImageBackground style={styles.image}
                                            source={{uri: uri}}>
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

                    <View style={{flexDirection: 'row', paddingBottom: isIphoneX() ? 15 : 0,}}>
                        <Button block success style={{flex: 1}} onPress={() => this.showCamera(true)}>
                            <Text>{I18n.t('photo.reship')}</Text>
                        </Button>
                        <Button block success style={{flex: 1}}
                                onPress={() => {
                                    if (this.props.uri !== null) {
                                        this.props.uploadPhoto(uri, id)
                                    }
                                }}>
                            <Text>{I18n.t('photo.send')}</Text>

                        </Button>

                    </View>
                    <Modal
                        animationType="slide"
                        visible={this.state.modalVisible}
                        onRequestClose={() => this.showCamera(false)}
                    >
                        <CameraKitCameraScreen
                            ref={(camera) => {
                                this.camera = camera;
                            }}
                            actions={{
                                rightButtonText: I18n.t('photo.ok'),
                                leftButtonText: uri ? I18n.t('photo.cancel') : I18n.t('photo.back')
                            }}
                            onBottomButtonPressed={(event) => this.onBottomButtonPressed(event)}
                            flashImages={{
                                on: require('../../assets/images/flashOn.png'),
                                off: require('../../assets/images/flashOff.png'),
                                auto: require('../../assets/images/flashAuto.png')
                            }}
                            cameraFlipImage={require('../../assets/images/cameraFlipIcon.png')}
                            captureButtonImage={require('../../assets/images/cameraButton.png')}
                        />

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
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    image: {
        flex: 1,
        justifyContent: 'flex-start',
        width: Dimensions.get('window').width
    },
});

