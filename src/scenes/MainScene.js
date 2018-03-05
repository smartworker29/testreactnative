import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {ActivityIndicator, Button, ImageBackground, Modal, StyleSheet, View} from 'react-native';
import {CameraKitCameraScreen} from 'react-native-camera-kit';
import {addPhoto, uploadPhoto} from '../actions/photo'

class MainScene extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
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
            this.showCamera(false)
        } else if (event.type === 'capture') {

        } else if (event.type === 'right') {
            this.setState({
                photo: event.captureImages[0].uri
            }, () => this.showCamera(false));
            this.props.addPhoto(event.captureImages[0].uri)

        }

    }

    renderUpload(){
        if(this.props.uri && !this.props.isFetch){
            return(
                <Button title='Upload' onPress={() => this.props.uploadPhoto(this.props.uri)}/>
            )
        }else  if(this.props.uri && this.props.isFetch){
            return(
               <ActivityIndicator/>
            )
        }

    }
    render() {
        const {isFetch, uri, error, uploadPhoto} = this.props;
        //console.log(uri);
        return (
            <View style={styles.container}>
                <ImageBackground style={styles.image}
                                 source={{uri: uri ? uri : ''}}>
                </ImageBackground>
                <Button title='Сделать фото' onPress={() => this.showCamera(true)}/>
                {this.renderUpload()}
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
                            rightButtonText: 'Готово'
                            ,
                            leftButtonText: 'Закрыть'
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
        )
    }
}

MainScene.propTypes = {
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
    }, {uploadPhoto, addPhoto}
)(MainScene)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    image: {
        height: 300,
        width: 300,
    },
});

