import React, {Component} from 'react';
import {ActivityIndicator, Keyboard, StyleSheet, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {back, backToTasks, goToVisitDetails} from '../actions/navigation'
import {createVisit} from '../actions/visist'
import I18n from 'react-native-i18n'
import {createVisitsNavigationOptions} from "../navigators/options";
import GradientButton from "../component/GradientButton";
import {allowAction} from "../utils/util";
import Permissions from 'react-native-permissions'
import Geolocation from 'react-native-geolocation-service';
import _ from "lodash";

export class CreateVisitScene extends Component {

  static navigationOptions = ({navigation}) => createVisitsNavigationOptions(navigation);

  constructor() {
    super();
    this._isMounted = false;
    this.state = {
      text: '',
      geoError: '',
      fetchGeo: false,
      coordinates: null,
      geoAllow: null
    }
  }

  getCoordinates = async () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve(position.coords)
        },
        error => {
          console.log(error);
          reject(error)
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 0}
      );
    })
  };

  timeout = async (ms = 200) => {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    })
  };

  getGeo = async () => {
    try {
      this._isMounted && this.setState({fetchGeo: true});
      await this.timeout(1000);
      const coordinates = await this.getCoordinates();
      clearInterval(this.check);
      this._isMounted && this.setState({geoAllow: true, fetchGeo: false, coordinates, geoError: ""});
    } catch (error) {
      let errMsg = "";
      if (error && error.code) {
        switch (error.code) {
          case 3:
            errMsg = I18n.t("error.geoTimeout");
            break;
          case 4:
            errMsg = I18n.t("error.geoPlayService");
            break;
          default:
            errMsg = I18n.t("error.geoDeny");
        }
      }
      this._isMounted && this.setState({geoAllow: false, fetchGeo: false, geoError: errMsg});
    }
  };

  async componentDidMount() {
    this._isMounted = true;

    await Permissions.request('location');
    await this.getGeo();
    this.check = setInterval(async () => {
      if (this.state.coordinates === null) {
        await this.getGeo();
      }
    }, 15000);

    if (this.input) {
      this.input.focus();
    }
  }


  componentWillUnmount() {
    this._isMounted = false;

    this.check && clearInterval(this.check);
  }

  createVisit = async () => {
    if (this.props.isFetch === true) {
      return;
    }

    if (!this.state.geoAllow || this.state.coordinates === null) {
      return
    }

    const {shop, taskId, taskName} = this.props.navigation.state.params;
    const shopId = _.isString(shop) ? shop : shop.customer_id;
    if (allowAction("create_visit_process")) {
      Keyboard.dismiss();
      this.props.createVisit(shopId, taskId, 5000, this.state.coordinates, taskName);
    }
  };

  render() {
    let geoText = null;
    if (this.state.fetchGeo === true && this.state.coordinates === null) {
      geoText = (
        <View style={styles.row}>
          <ActivityIndicator size="small" style={styles.indicator}/>
          <Text>{I18n.t("CreateVisit.getGeo")}</Text>
        </View>
      );
    }
    if (this.state.fetchGeo === false && this.state.coordinates !== null) {
      geoText = <Text style={styles.colorGreen}>{I18n.t("CreateVisit.okGeo")}</Text>
    }
    if (this.state.fetchGeo === false && this.state.geoError) {
      geoText = <Text style={styles.colorRed}>{this.state.geoError}</Text>
    }
    geoText = <View style={styles.row}>{geoText}</View>;

    if (this.props.isFetch === true) {
      return (
        <View style={styles.containerInfo}>
          <ActivityIndicator size="small"/>
          <Text style={styles.infoText}>{I18n.t("CreateVisit.createVisit")}</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <View style={{flex: 1, justifyContent: "flex-start"}}>
          <Text style={styles.description}>{I18n.t("CreateVisit.description")}</Text>
          <View style={styles.input}>
            {geoText}
          </View>
          <View style={{marginTop: 15}}>
            <GradientButton
              disable={this.props.isFetch === true || !this.state.geoAllow || !this.state.coordinates}
              text={I18n.t('CreateVisit.createAction')}
              onPress={this.createVisit}/>
          </View>
        </View>
      </View>
    )
  }
}

export default connect(state => {
  const {nav, visits} = state;
  return {
    nav: nav,
    error: visits.error,
    isFetch: visits.isCreateFetch,
  }
}, {back, createVisit, goToVisitDetails})(CreateVisitScene)

const styles = StyleSheet.create({
  container: {
    flex: 2,
    justifyContent: "center",
    backgroundColor: "white"
  },
  containerInfo: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center"
  },
  infoText: {
    color: "black",
    marginTop: 20
  },
  input: {
    marginTop: 15,
    paddingHorizontal: 16
  },
  geoView: {
    height: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    marginTop: 15
  },
  inputCmp: {
    marginTop: 3,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD"
  },
  description: {
    marginTop: 35,
    width: 272,
    //fontFamily: "OpenSansRegular",
    fontSize: 15,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "center",
    alignSelf: "center",
    color: "#636363"
  },
  colorGreen: {
    color: "#58c02f"
  },
  colorRed: {
    color: "#c40010"
  },
  row: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  indicator: {
    marginRight: 10
  },
  createBtn: {
    position: "absolute",
    bottom: 10,
    zIndex: 1
  },
  empty: {
    //backgroundColor: "red",
    backgroundColor: "white",
    justifyContent: 'center',
    alignItems: 'center'
  },
  geoWarning: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "center",
    alignSelf: "center",
    color: "#C2071B"
  }
});
