import React, {Component} from 'react';
import {
  addNavigationHelpers,
  NavigationActions,
  StackNavigator,
  TabNavigator
} from 'react-navigation';
import {
  Alert,
  AppState,
  AsyncStorage,
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  YellowBox
} from "react-native";
import {addListener} from '../utils/redux';
import {photoInit, syncDeleteImage, syncPhoto} from '../actions/photo'
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import VisitListScene from '../scenes/VisitListScene';
import VisitDetailScene from '../scenes/VisitDetailScene';
import CreateVisitScene from '../scenes/CreateVisitScene';
import PhotoScene from '../scenes/PhotoScene';
import ProfileScene from '../scenes/ProfileScene';
import PhotoViewScene from '../scenes/PhotoViewScene';
import EnterPinScene from '../scenes/EnterPinScene';
import TasksScene from '../scenes/TasksScene';
import ResultsScene from "../scenes/ResultsScene";
import {
  initFeedback,
  initVisits,
  refreshVisitsList,
  syncFeedback,
  syncVisitList
} from "../actions/visist";
import {appInit, initFolders, setGeoStatus} from "../actions/app";
import {resetToList, resetToProfile} from "../actions/navigation";
import {authInit, initPins, setFetchPin, syncPins, updateInstance} from "../actions/auth";
import {loadData, saveData} from "../actions/profile";
import {getTasksList, initTasks} from "../actions/tasks";
import TaskScene from "../scenes/TaskScene";
import {getStatistics} from "../actions/stats";
import PreviewScene from "../scenes/PreviewScene";
import FeedbackScene from "../scenes/FeedbackScene";
import SyncScene from "../scenes/SyncScene";
import ErrorLogging from "../utils/Errors";
import {getFavorites, getShopsNearest, initFavorites, setGeo} from "../actions/shops";
import ShopsScene from "../scenes/ShopsScene";
import Permissions from 'react-native-permissions';
import I18n from "react-native-i18n";
import OpenSettings from 'react-native-open-settings';
import GoogleAPIAvailability from 'react-native-google-api-availability-bridge';
import FeedbackCategoriesScene from "../scenes/FeedbackCategoriesScene";
import Geolocation from "react-native-geolocation-service";
import QuestionnaireScene from "../scenes/QuestionnaireScene";
import {
  initAnswers,
  initAnswersSync,
  initQuestions,
  initRequiredQuestions,
  initUuidValues,
  syncAnswers
} from "../actions/questions";
import {initSkuSync, syncReasons} from "../actions/visitDetails";
import * as API from "../api";
import {Sentry} from 'react-native-sentry';

if (!__DEV__) {
  Sentry.config('https://11d80528d8d744ce9098692402b0339f@sentry.inspector-cloud.ru//6').install().then(console.log).catch(console.log);
}

YellowBox.ignoreWarnings([
  'Warning: componentWillMount is deprecated',
  'Warning: componentWillReceiveProps is deprecated',
  'Warning: componentWillUpdate is deprecated',
]);

const AppTabNavigator = TabNavigator({
  Shops: {
    screen: ShopsScene
  },
  Results: {
    screen: ResultsScene
  },
  VisitList: {
    screen: VisitListScene,
    key: "list",
  },
  Profile: {
    screen: ProfileScene,
    mode: 'modal'
  },
}, {
  tabBarPosition: "bottom",
  tabBarOptions: {
    renderIndicator: () => null,
    activeTintColor: '#C2071B',
    inactiveTintColor: "#8e8e93",
    upperCaseLabel: false,
    animationEnabled: false,
    showIcon: true,
    labelStyle: {
      fontSize: 9,
    },
    style: {
      borderTopWidth: 0.5,
      borderColor: "#B3B3B6",
      backgroundColor: "#F5F5F6",
    },
  }
});

export const AppNavigator = StackNavigator({
  VisitList: {
    screen: AppTabNavigator,
    key: "list"
  },
  VisitDetails: {
    screen: VisitDetailScene
  },
  CreateVisit: {
    screen: CreateVisitScene,
    mode: 'modal'
  },
  Task: {
    screen: TaskScene
  },
  Tasks: {
    screen: TasksScene
  },
  Pin: {
    screen: EnterPinScene,
  },
  Photo: {
    screen: PhotoScene,
    navigationOptions: {
      header: null,
    }
  },
  PhotoView: {
    screen: PhotoViewScene,
  },
  Profile: {
    screen: ProfileScene,
    mode: 'modal'
  },
  Preview: {
    screen: PreviewScene
  },
  Feedback: {
    screen: FeedbackScene
  },
  Questionnaire: {
    screen: QuestionnaireScene
  },
  Sync: {
    screen: SyncScene
  },
  Categories: {
    screen: FeedbackCategoriesScene
  }
}, {
  // mode: 'modal',
});


class AppWithNavigationState extends Component {

  constructor() {
    super();
    this._isMounted = false;


    this.state = {
      geo: null,
      checkGeo: false,
      service: null,
      platform: Platform.OS,
      watchGeoId: null,
      getNearestFirstTime: false
    };

    AppState.addEventListener("change", async event => {
      if (event === "active") {
        if (this.state.checkGeo === false) {
          await this.checkLocation();
        }
      }
    });
  }

  async checkLocation() {
    this._isMounted && this.setState({checkGeo: true}, async () => {
      const status = await Permissions.request('location');
      this.props.dispatch(setGeoStatus(status));
      if (this.state.platform === "android") {
        GoogleAPIAvailability.checkGooglePlayServices((result) => {
          this._isMounted && this.setState({service: result});
        });
      }
      this._isMounted && this.setState({geo: status, checkGeo: false});
    });
  }

  async init() {
    await this.props.dispatch(appInit());
    await this.props.dispatch(authInit());
    await this.props.dispatch(loadData());
    await this.props.dispatch(initTasks());
    await this.props.dispatch(initVisits());
    await this.props.dispatch(photoInit());
    await this.props.dispatch(initFavorites());
    await this.props.dispatch(initQuestions());
    await this.props.dispatch(initUuidValues());
    await this.props.dispatch(initAnswers());
    await this.props.dispatch(initAnswersSync());
    await this.props.dispatch(initRequiredQuestions());
    await this.props.dispatch(initFeedback());
    await this.props.dispatch(initSkuSync());

    if (this.props.authId === null) {
      this.props.dispatch(resetToProfile());
    } else {
      await this.props.dispatch(resetToList());
    }
  }

  startGeoWatching() {
    if (this.state.watchGeoId !== null) {
      return;
    }
    const id = Geolocation.watchPosition(this.saveGeo, console.log, {
      enableHighAccuracy: true,
      distanceFilter: 10,
      maximumAge: 0,
    });

    this._isMounted && this.setState({watchGeoId: id})
  }

  saveGeo = (data) => {
    this.props.dispatch(setGeo(data.coords));
    if (this.state.getNearestFirstTime === false) {
      this._isMounted && this.setState({getNearestFirstTime: true});
      this.props.dispatch(getShopsNearest());
    }
  };

  onStateChange = (state) => {
    switch (state) {
      case "background":
        Geolocation.clearWatch(this.state.watchGeoId);
        this._isMounted && this.setState({watchGeoId: null});
        break;
      case "active" :
        this.startGeoWatching();
        break;
    }
  };

  async componentDidMount() {
    this._isMounted = true;

    await this.checkLocation();
    await this.props.dispatch(initFolders());
    await this.props.dispatch(initPins());
    //await this.props.dispatch(updateRatioExceptions());
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);

    this.intervalSyncPins = setInterval(async () => {
      await this.props.dispatch(syncPins());
    }, 7000);

    try {
      ErrorLogging.deletedPhotos = JSON.parse(await AsyncStorage.getItem("deletePhotoHistory")) || [];
    } catch (err) {
    }
    this.timerErrorLogging = setInterval(() => {
      ErrorLogging.save();
    }, 5000);
  }

  async updateAll() {
    await this.props.dispatch(loadData());
    await this.props.dispatch(saveData(null, false));
    await this.props.dispatch(refreshVisitsList(false));
    await this.props.dispatch(getTasksList());
    await this.props.dispatch(getStatistics());
    await this.props.dispatch(getFavorites());
    await this.props.dispatch(syncPins());
  }

  async componentWillUnmount() {
    this._isMounted = false;

    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    this.timerSyncVisitList && clearInterval(this.timerSyncVisitList);
    this.timersyncPhoto && clearInterval(this.timersyncPhoto);
    this.timerRefreshVisitsList && clearInterval(this.timerRefreshVisitsList);
    this.timerGetTasksList && clearInterval(this.timerGetTasksList);
    this.timerGetStatistics && clearInterval(this.timerGetStatistics);
    this.timerSyncPins && clearInterval(this.timerSyncPins);
    this.timerGetFavorites && clearInterval(this.timerGetFavorites);
    this.timerSyncDeleteImage && clearInterval(this.timerSyncDeleteImage);
    this.timerSyncAnswers && clearInterval(this.timerSyncAnswers);
    this.timerSyncFeedback && clearInterval(this.timerSyncFeedback);
    this.timerSyncReasons && clearInterval(this.timerSyncReasons);
    this.timerSyncReasons && clearInterval(this.timerSyncReasons);
    this.timerCheckAgent && clearInterval(this.timerCheckAgent);
    this.timerUpdateInstance && clearInterval(this.timerUpdateInstance);
    this.timerErrorLogging && clearInterval(this.timerErrorLogging);
  }

  async componentWillReceiveProps(props) {

    if (props.pin !== null && this.props.pin !== props.pin) {
      await this.init();
      this.props.dispatch(setFetchPin(false));
    }

    if (this.props.authId !== props.authId && props.authId !== null && this.props.dispatch) {
      clearInterval(this.intervalSyncPins);
      await this.props.dispatch(refreshVisitsList(true));
      this.startGeoWatching();
      AppState.addEventListener('change', this.onStateChange);
      await this.updateAll();

      this.timerSyncVisitList = setInterval(async () => {
        await this.props.dispatch(syncVisitList());
      }, 2000);

      this.timersyncPhoto = setInterval(async () => {
        await this.props.dispatch(syncPhoto());
      }, 2100);

      this.timerRefreshVisitsList = setInterval(async () => {
        await this.props.dispatch(refreshVisitsList(false));
      }, 10000);

      this.timerGetTasksList = setInterval(async () => {
        await this.props.dispatch(getTasksList());
      }, 10100);

      this.timerGetStatistics = setInterval(async () => {
        await this.props.dispatch(getStatistics());
      }, 10200);

      this.timerSyncPins = setInterval(async () => {
        await this.props.dispatch(syncPins());
      }, 10300);

      this.timerGetFavorites = setInterval(async () => {
        await this.props.dispatch(getFavorites());
      }, 10400);

      this.timerSyncDeleteImage = setInterval(async () => {
        await this.props.dispatch(syncDeleteImage());
      }, 3000);

      this.timerSyncAnswers = setInterval(async () => {
        await this.props.dispatch(syncAnswers())
      }, 3500);

      this.timerSyncFeedback = setInterval(async () => {
        await this.props.dispatch(syncFeedback())
      }, 3100);

      this.timerSyncReasons = setInterval(async () => {
        await this.props.dispatch(syncReasons())
      }, 1500);

      this.timerCheckAgent = setInterval(async () => {
        const result = await API.checkUser(this.props.authId);
        if (result && result.status === 404) {
          Alert.alert("Ошибка агента", "Ваш агент не найден на сервере, обратитесь в службу поддержки")
        }
      }, 10000);

      this.timerUpdateInstance = setInterval(async () => {
        await this.props.dispatch(updateInstance());
      }, 120000)
    }
  }

  onBackPress = () => {
    const {dispatch, nav} = this.props;
    if (nav.index === 0) {
      return false;
    }
    dispatch(NavigationActions.back());
    return true;
  };

  render() {
    const {dispatch, nav} = this.props;

    if (this.state.geo === null) {
      return null;
    }

    if (this.state.platform === "android" && this.state.service === null) {
      return null;
    }

    if (this.state.platform === "android" && (this.state.service === "failure" || this.state.service === "invalid")) {
      return (
        <View style={styles.containerInfo}>
          <Text style={styles.deleteText}>{I18n.t("overScreen.notInstall")}</Text>
          <Text style={styles.deleteText}>{"Google Play Services"}</Text>
          <TouchableOpacity onPress={() => {
            GoogleAPIAvailability.promptGooglePlayUpdate(false);
          }}>
            <Text style={styles.link}>{I18n.t("overScreen.install")}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (this.state.platform === "android" && (this.state.service === "update")) {
      return (
        <View style={styles.containerInfo}>
          <Text style={styles.deleteText}>{I18n.t("overScreen.needUpdate")}</Text>
          <Text style={styles.deleteText}>{"Google Play Services"}</Text>
          <TouchableOpacity onPress={() => {
            GoogleAPIAvailability.promptGooglePlayUpdate(false);
          }}>
            <Text style={styles.link}>{I18n.t("overScreen.update")}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (this.state.platform === "android" && (this.state.service === "disabled")) {
      return (
        <View style={styles.containerInfo}>
          <Text style={styles.deleteText}>{I18n.t("overScreen.offService")}</Text>
          <Text style={styles.deleteText}>{"Google Play Services"}</Text>
          <TouchableOpacity onPress={() => {
            GoogleAPIAvailability.promptGooglePlayUpdate(false);
          }}>
            <Text style={styles.link}>{I18n.t("overScreen.onService")}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (Platform.OS === "android" && this.state.geo === "denied" || this.state.geo === "restricted") {
      return (
        <View style={styles.containerInfo}>
          <Text style={styles.deleteText}>{I18n.t("overScreen.geoOff")}</Text>
          <Text style={styles.deleteText}>{I18n.t("overScreen.startGeoInSettings")}</Text>
          <TouchableOpacity onPress={() => {
            OpenSettings.openSettings();
          }}>
            <Text style={styles.link}>{I18n.t("overScreen.goToSettings")}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <AppNavigator
        navigation={addNavigationHelpers({
          dispatch,
          state: nav,
          addListener,
        })}
      />
    );
  }

}

AppWithNavigationState.propTypes = {
  dispatch: PropTypes.func.isRequired,
  nav: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  pin: state.auth.pin,
  nav: state.nav,
  authId: state.auth.id,
});

export default connect(mapStateToProps)(AppWithNavigationState);

const styles = StyleSheet.create({
  containerPhoto: {
    flex: 1,
    backgroundColor: "black"
  },
  containerInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  image: {
    flex: 1
  },
  deleteText: {
    fontSize: 20,
    color: "black",
    fontWeight: "bold"
  },
  link: {
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 20,
    color: "blue",
  }
});
