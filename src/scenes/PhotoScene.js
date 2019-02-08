import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {addPhoto, clearPhoto, deleteImage, setCameraType, uploadPhoto} from '../actions/photo'
import {getPhotoPath, isIphoneX} from '../utils/util'
import {back, goToSettings} from '../actions/navigation'
import {Container} from 'native-base'
import {NavigationActions} from 'react-navigation'
import _ from 'lodash'
import {RNCamera} from 'react-native-camera';
import {cameraButton, closeIcon, flashAuto, flashOff, flashOn} from "../utils/images";
import {copyFile, unlink} from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import {basename} from "react-native-path";
import Orientation from "react-native-orientation";
import {accelerometer, setUpdateIntervalForType, SensorTypes} from "react-native-sensors";
import I18n from 'react-native-i18n'

import {Sentry} from 'react-native-sentry'

let {height, width} = Dimensions.get('window');
const heightCamera = width / 3 * 4;
const DURATION = 1000;
const ANDROID_INC = 10;
const ANDROID_DEC = 10;
const IOS_INC = 0.001;
const IOS_DEC = 0.001;
const AR_CAMERA = 'AR_CAMERA';
const STANDARD_CAMERA = "STANDARD_CAMERA";
setUpdateIntervalForType(SensorTypes.accelerometer, 400);

class PhotoScene extends Component {

  takePictureStatus = false;
  tmpZoom = 0;
  startedSession = false;
  accelSubscription = null;

  constructor() {
    super();
    this._isMounted = false;
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
      x: null,
      y: null,
      z: null
    };
  }

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

  getRotate() {
    const {x, y, z} = this.state;
    let rotate = 0;

    if (x === null || y === null || z === null) {
      return rotate
    }

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

  componentDidMount() {
    this._isMounted = true;
    StatusBar.setHidden(true);
    const photoIndex = this.props.navigation.getParam("photoIndex", null);
    this.setState({photoIndex});
    try {
      this.accelSubscription = accelerometer.subscribe(({x, y, z}) =>
        this.setState({x, y, z})
      );
    } catch (error) {
      Sentry.captureException(I18n.t("error.accelerometerError"));

      Alert.alert(I18n.t("error.attention"), I18n.t("error.accelerometerError"));
    }

  }

  onBackPress = () => {
    this.props.navigation.dispatch(NavigationActions.back());
  };

  componentWillUnmount() {
    this._isMounted = false;
    StatusBar.setHidden(false);
    const {backHandler} = this.props.navigation.state.params;
    if (this.accelSubscription !== null) {
      this.accelSubscription.unsubscribe();
    }
    backHandler && backHandler(this.state.finalUri);
  }

  uploadPhoto = () => {
    this.props.dispatch(NavigationActions.back())
  };

  addPhoto = () => {
    this.props.dispatch(NavigationActions.back())
  };

  changeFlashMode = () => {
    if (this.state.flashMode === RNCamera.Constants.FlashMode.off) {
      this._isMounted && this.setState({flashMode: RNCamera.Constants.FlashMode.on})
    }
    if (this.state.flashMode === RNCamera.Constants.FlashMode.on) {
      this._isMounted && this.setState({flashMode: RNCamera.Constants.FlashMode.off})
    }
  };

  renderCameraElement = () => {
    return <RNCamera
      ref={ref => {
        this.camera = ref;
      }}
      zoom={this.state.zoom}
      style={[styles.preview]}
      type={RNCamera.Constants.Type.back}
      flashMode={this.state.flashMode}
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
    return false;
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

    const photoUUID = this.props.navigation.getParam("photoUUID", null);
    const photoIndex = this.props.navigation.getParam("photoIndex", null);

    let rotate = 0;

    if (Platform.OS === "android") {
      rotate = this.getRotate();
    }

    const initial = await this.getOrientation();

    this.fadeCamera();
    this.takePictureStatus = true;
    this._isMounted && this.setState({processPhoto: true});

    const options = {quality: 0.9, exif: true, width: 1500, skipProcessing: true};

    let data;
    try {
      data = await this.camera.takePictureAsync(options);
    } catch (error) {
      data = null;
      this.takePictureStatus = false;
      this._isMounted && this.setState({processPhoto: false});
      return Alert.alert("Фото не сделано", _.get(error, "message", ""));
    }

    if (initial !== 'PORTRAIT') {
      rotate = 0
    }

    if (Platform.OS !== 'ios' && data.width > data.height) {
      rotate = rotate + 90;
    }

    if (Platform.OS === 'ios' && initial === 'PORTRAIT' && rotate !== 0) {
      rotate = 0
    }

    if (data === null) {
      this.takePictureStatus = false;
      this._isMounted && this.setState({processPhoto: false});
      return Alert.alert("Фото не сделано");
    }

    const width = (Platform.OS === 'ios') ? data.width : 1500;
    const height = (Platform.OS === 'ios') ? data.height : 1500;

    let result;
    try {
      result = await ImageResizer.createResizedImage(data.uri, width, height, 'JPEG', 90, rotate);
    } catch (error) {
      this.takePictureStatus = false;
      this._isMounted && this.setState({processPhoto: false});
      return Alert.alert("Ошибка обработки", _.get(error, "message", ""));
    }

    if (!result) {
      this.takePictureStatus = false;
      this._isMounted && this.setState({processPhoto: false});
      return Alert.alert("Нет результата обработки");
    }

    if (result.size === 0) {
      this.takePictureStatus = false;
      this._isMounted && this.setState({processPhoto: false});
      try {
        await unlink(data.uri);
        await unlink(result.uri);
      } catch (error) {
        return Alert.alert("Ошибка удаления пустых файлов", _.get(error, "message", ""))
      }
      return Alert.alert("Размер фото 0 байт, фото будет удаленно");
    }

    this._isMounted && this.setState(state => {
      const files = [...state.files];
      files.push({uri: basename(result.uri), size: result.size});
      return {files}
    });

    const index = photoIndex ? photoIndex : this.getPhotosIndex();
    try {
      await unlink(data.uri);
    } catch (error) {
      this.takePictureStatus = false;
      this._isMounted && this.setState({processPhoto: false});
      return Alert.alert("Ошибка удаления", _.get(error, "message", ""))
    }

    const path = getPhotoPath(result.path);
    try {
      await copyFile(result.uri, path);
    } catch (error) {
      this.takePictureStatus = false;
      this._isMounted && this.setState({processPhoto: false});
      return Alert.alert("Ошибка копирования", _.get(error, "message", ""))
    }

    try {
      await unlink(result.uri);
    } catch (error) {
      this.takePictureStatus = false;
      this._isMounted && this.setState({processPhoto: false});
      return Alert.alert("Ошибка удаления результата", _.get(error, "message", ""))
    }

    const finalUri = "file://" + path;
    const {id} = this.props.navigation.state.params;
    await this.props.addPhoto(finalUri, id, index);

    if (photoUUID) {
      try {
        const oldPhoto = this.props.photos.find(photo => photo && photo.uuid === photoUUID);
        if (!oldPhoto) {
          throw new Error("oldPhoto.uri not exists");
        }
        const result = await this.props.deleteImage(oldPhoto.uri, oldPhoto.id, true);
        if (result) {
          await unlink(getPhotoPath(oldPhoto.uri));
        }
      } catch (error) {
        console.log(error);
      }
    }

    this._isMounted && setTimeout(() => {
      this.setState(state => (
        {photoCount: state.photoCount + 1, processPhoto: false, finalUri}
      ), () => {
        if (photoUUID === null) {
          this.takePictureStatus = false;
        } else if (photoUUID && this.state.photoCount < 1) {
          this.takePictureStatus = false;
        } else if (photoUUID && this.state.photoCount === 1) {
          this.onBackPress();
        }
      });
    }, 100)

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
    return this.renderCameraElement()
  }

  renderBottomControl = () => {
    const overButton = (this.state.processPhoto === true) ?
      <View style={{position: "absolute", zIndex: 9}}><ActivityIndicator/></View> :
      (this.state.photoCount > 0) ?
        <Text style={styles.photoCount}>{this.state.photoCount}</Text> : null;
    const buttonTint = (this.state.processPhoto === true) ? {tintColor: "#555"} : {tintColor: "white"};
    return (
      <TouchableOpacity onPress={this.takePicture} style={styles.capture}>
        {overButton}
        <Image style={[styles.cameraImage, buttonTint]} source={cameraButton}/>
      </TouchableOpacity>
    )
  };

  renderCamera() {
    let flashIcon = flashAuto;
    if (this.state.flashMode === RNCamera.Constants.FlashMode.on) {
      flashIcon = flashOn;
    }
    if (this.state.flashMode === RNCamera.Constants.FlashMode.off) {
      flashIcon = flashOff;
    }
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
                   style={{tintColor: "white"}}/>
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

