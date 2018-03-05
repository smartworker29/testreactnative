import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
  ActivityIndicator,
  ImageBackground,
  NetInfo,
  Platform,
  Modal,
  StyleSheet,
  View,
  Dimensions, BackHandler
} from 'react-native'
import {CameraKitCameraScreen} from 'react-native-camera-kit'
import Toolbar from '../component/Toolbar'
import {addPhoto, uploadPhoto, clearPhoto} from '../actions/photo'
import {isIphoneX} from '../utils/util'
import {goToCreateVisit, goToSettings, goToVisitDetails, back} from '../actions/navigation'
import {Container, Header, Left, Body, Text, Right, Icon, Title, ListItem, Button, Footer} from 'native-base'
import I18n from 'react-native-i18n'
import {NavigationActions} from 'react-navigation'
import _ from 'lodash'

class PhotoScene extends Component {
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

  async componentWillUnmount() {
    //BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
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

  onBottomButtonPressed(event) {
    const {id} = this.props.navigation.state.params

    const captureImages = JSON.stringify(event.captureImages);
    console.log("captureImages", captureImages);
    if (event.type === 'left') {
      if (this.props.uri == null) {
        this.props.back()
      }
      this.showCamera(false)
    } else if (event.type === 'capture') {
      let uri = event.captureImages[0].uri
      console.log("uri", uri);
      this.setState({
        uri: Platform.OS === 'android' ? `file://${uri}` : uri, isSend: false
      }, () => this.showCamera(false))

    } else if (event.type === 'right') {

    }
  }

  throttlePress = _.throttle((event) => this.onBottomButtonPressed(event), 1000);

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
            <CameraKitCameraScreen
              ref={(camera) => {
                this.camera = camera
              }}
              actions={{
                rightButtonText: I18n.t('photo.ok'),
                leftButtonText: uri ? I18n.t('photo.cancel') : I18n.t('photo.back')
              }}
              onBottomButtonPressed={(event) => this.throttlePress(event)}
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

