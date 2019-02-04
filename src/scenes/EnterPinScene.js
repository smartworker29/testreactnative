import React, {Component} from 'react'
import {pinNavigationOptions} from "../navigators/options";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import {logo} from "../utils/images";
import I18n from "react-native-i18n";
import {connect} from "react-redux";
import {checkPin} from "../actions/auth";

class EnterPinScene extends Component {

  static navigationOptions = ({navigation}) => pinNavigationOptions(navigation);

  constructor() {
    super();
    this._isMounted = false;

    this.state = {
      pin: ""
    }
  }

  componentDidMount() {
    this._isMounted = true;

    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.keyboardDidHideListener.remove();
  }


  timeout = async (ms) => {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  };

  _keyboardDidHide = async () => {
    if (this.input) {
      this.input.blur();
    }

    await this.timeout(100);

    if (this.input) {
      this.input.focus();
    }
  };

  enterPin = (pin) => {
    if (this.state.syncProcessFirst) {
      return;
    }
    this._isMounted && this.setState({pin});
    if (pin.length === 4) {
      this.props.checkPin(pin);
    }

  };

  renderCircle(pos) {
    const color = (this.state.pin.length >= pos) ? styles.red : styles.gray;
    return <View style={[styles.circle, color]}/>
  }

  renderCircles() {
    return (
      <TouchableOpacity style={styles.circlesView} onPress={this._keyboardDidHide}>
        {this.renderCircle(1)}
        {this.renderCircle(2)}
        {this.renderCircle(3)}
        {this.renderCircle(4)}
      </TouchableOpacity>
    )
  }

  componentWillReceiveProps(props) {
    if (props.wrongPin === true) {
      this._isMounted && this.setState({pin: ""});
    }
  }

  openSupport = () => {
    const locale = I18n.currentLocale();

    if (locale.includes("ru")) {
      Linking.openURL(`tel:${I18n.t("pin.descriptionAddress")}`);
    } else {
      Linking.openURL(`mailto:${I18n.t("pin.descriptionAddress")}`)
    }

  };

  render() {

    const error = (this.props.wrongPin) ? I18n.t("pin.error") : " ";
    const message = (this.props.wrongPin) ? I18n.t("pin.enterAgain") : I18n.t("pin.enter");
    let indicator = (!this.props.isFetchPin) ? this.renderCircles() :
      <ActivityIndicator style={styles.indicator}/>;

    if (this.props.syncProcessFirst) {
      indicator = <View style={styles.loadPins}>
        <ActivityIndicator style={{marginRight: 5}} size="small"/>
        <Text>{I18n.t("pin.firstLoad")}</Text>
      </View>;
    }

    return (
      <View style={styles.container}>
        <Image style={styles.logo} source={logo}/>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.enterText}>{message}</Text>
        {indicator}
        <Text style={styles.description}>{I18n.t("pin.description")}</Text>
        <Text style={styles.descriptionAddress}
              onPress={this.openSupport}>{I18n.t("pin.descriptionAddress")}</Text>
        <TextInput ref={(ref) => this.input = ref}
                   value={this.state.pin}
                   onChangeText={this.enterPin}
                   autoFocus={true}
                   keyboardType="numeric"
                   maxLength={4}
                   style={{opacity: 0}}
        />
      </View>
    )
  }
}

const mapStateTopProps = (state) => {
  return {
    wrongPin: state.auth.wrongPin,
    isFetchPin: state.auth.isFetchPin,
    syncProcessFirst: state.auth.syncProcessFirst
  }
};

export default connect(mapStateTopProps, {checkPin})(EnterPinScene)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 30,
    alignItems: "center",
    backgroundColor: "white"
  },
  logo: {
    marginTop: 42,
    width: 244,
    height: 35
  },
  loadPins: {
    marginTop: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  error: {
    marginTop: 34,
    fontSize: 15,
    color: "#c40010"
  },
  enterText: {
    marginTop: 12,
    height: 18,
    fontSize: 15,
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#636363"
  },
  circlesView: {
    flexDirection: "row",
    marginTop: 19,
    width: 94,
    height: 35,
    justifyContent: "space-between",
    alignItems: "center"
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 10
  },
  indicator: {
    marginTop: 19,
    width: 35,
    height: 35
  },
  red: {
    backgroundColor: "#c40010",
  },
  gray: {
    backgroundColor: "#e5e5e5",
  },
  descriptionAddress: {
    color: "blue",
    textAlign: "center",
    fontSize: 15,
  },
  description: {
    paddingHorizontal: 32,
    marginTop: 10,
    color: "#636363",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 20,
  }
});
