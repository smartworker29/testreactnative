import React, {Component} from 'react';
import {tasksNavigationOptions} from "../navigators/options";
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import I18n from 'react-native-i18n'
import {connect} from "react-redux";
import {distanceIcon, pinIcon, tasksImage} from "../utils/images";
import {requestShopById, setFavorite} from "../actions/shops";
import {is} from "immutable"
import {distance} from "../utils/util";
import {CachedImage} from "react-native-img-cache";
import _ from "lodash";
import moment from "moment";
import EventEmitter from "react-native-eventemitter";

class TasksScene extends Component {
  static navigationOptions = ({navigation}) => tasksNavigationOptions(navigation);

  state = {
    lan: null,
    lon: null,
    lastVisitDate: null,
    refreshing: false,
    shop: null,
  };

  constructor() {
    super();
    this._isMounted = false;
  }

  renderItem(item) {
    let short_description = "Предыдущий отчёт: никогда ранее";
    if (this.state.lastVisitDate !== null) {
      if (this.state.lastVisitDate[item.id] !== undefined) {
        short_description = `Предыдущий отчёт: ${moment(this.state.lastVisitDate[item.id]).fromNow()}`;
      }
    }
    return (
      <View style={{backgroundColor: "#efeff4"}}>
        <TouchableOpacity style={styles.item} onPress={() => this.goToTask(item)}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.description}>{short_description}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  componentWillMount() {
    const {favorites, favoritePostRequest} = this.props;
    this.props.navigation.setParams({
      favorites,
      favoritePostRequest,
      favoriteHandler: this.toggleFavorite
    });
  }

  componentDidMount() {
    this._isMounted = true
    const {shop} = this.props.navigation.state.params;
    if (shop.last_visit_date) {
      this.setState({lastVisitDate: shop.last_visit_date})
    }
    EventEmitter.on("updateTasksTime", this.onRefresh);
  }

  componentWillUnmount() {
    this._isMounted = false
    EventEmitter.removeListener("updateTasksTime", this.onRefresh)
  }

  componentWillReceiveProps(props) {
    const {favorites} = this.props;
    if (this.props.favoritePostRequest !== props.favoritePostRequest) {
      this.props.navigation.setParams({favoritePostRequest: props.favoritePostRequest})
    }
    if (!is(this.props.favorites, props.favorites)) {
      this.props.navigation.setParams({favorites: props.favorites})
    }
  }

  goToTask = (task) => {
    const {shop} = this.props.navigation.state.params;
    this.props.navigation.navigate("Task", {task, shop});
  };

  toggleFavorite = async (shop) => {
    await this.props.setFavorite(shop)
  };

  shopHeader = () => {
    const {shop} = this.props.navigation.state.params;
    const logo = shop.logo;
    const {geo} = this.props;

    if (_.isString(shop)) {
      return (
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <Text style={styles.shopTitle}>{`${I18n.t("tasks.shopPoint")} ${shop}`}</Text>
            <View style={styles.location}/>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.header}>
        <View style={styles.headerMain}>
          {(logo) ?
            <CachedImage style={styles.shopLogo} source={{uri: logo}} resizeMode="contain"/> : null}
          <Text style={styles.shopTitle}>{_.get(shop, "customer_name")}</Text>
          <View style={styles.location}>
            <Image source={pinIcon} style={styles.pinIcon}/>
            <Text style={styles.address}>{shop.address}</Text>
          </View>
        </View>
        <View style={styles.bottomInfo}>
          <Text style={styles.gray}>{`ID ${shop.customer_id}`}</Text>
          <View style={styles.distance}>
            <Image source={distanceIcon} style={styles.distanceIcon}/>
            {(geo !== null) ? <Text
              style={styles.gray}>{`${distance(shop.latitude, shop.longitude, geo.latitude, geo.longitude)}`}</Text> : null}
          </View>
        </View>
        {this.props.list.count() !== 0 ?
          <Text style={styles.tasksLabel}>{I18n.t("tabBar.tasks")}</Text> : null}
      </View>
    )
  };

  shopFooter = () => {
    if (this.props.list.count() !== 0) {
      return <View style={{height: 20, backgroundColor: "#efeff4"}}/>;
    }
    return (
      <View style={styles.empty}>
        <View style={styles.delimiter}/>
        <Image source={tasksImage}/>
        <Text style={styles.emptyTitle}>{I18n.t("tasks.emptyTitle")}</Text>
        <Text style={styles.emptyDetail}>{I18n.t("tasks.emptyDescription")}</Text>
      </View>
    )
  };

  onRefresh = async () => {
    this._isMounted && this.setState({refreshing: true});
    const shop = this.props.navigation.getParam("shop");
    this._isMounted && this.setState({refreshing: false});
    const shopId = _.isString(shop) ? shop : shop.customer_id;
    const result = await this.props.requestShopById(shopId);
    if (this._isMounted && _.isArray(result)) {
      const foundShop = _.find(result, shop => shop.customer_id === shopId);
      if (foundShop) {
        this.setState({shop: foundShop, lastVisitDate: foundShop.last_visit_date});
      }
    }
  };

  render() {
    const shopRefreshed = this.state.shop;
    const shop = shopRefreshed ? shopRefreshed : this.props.navigation.getParam("shop");
    const {tasks} = this.props;
    let _tasks;
    if (!_.isString(shop) && shop.visittask_ids !== undefined) {
      if (shop.visittask_ids === null) {
        _tasks = this.props.tasks.toArray();
      }
      if (_.isArray(shop.visittask_ids)) {
        _tasks = tasks.filter(item => shop.visittask_ids.includes(item.id)).toArray()
      }
    } else {
      _tasks = this.props.tasks.toArray()
    }

    return (
      <View style={{flex: 1, backgroundColor: "#efeff4"}}>
        <FlatList
          data={_tasks}
          ListHeaderComponent={this.shopHeader}
          ListFooterComponent={this.shopFooter}
          renderItem={({item}) => this.renderItem(item)}
          keyExtractor={item => String(item.id)}
          ListEmptyComponent={() => <View/>}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => {
                EventEmitter.emit("updateTasksTime");

                //this.onRefresh().then();
              }}
              tintColor="#555"
              titleColor="#555"
            />
          }

        />

      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    list: state.tasks.list,
    favorites: state.shops.favorites,
    favoritePostRequest: state.shops.favoritePostRequest,
    geo: state.shops.geo,
    tasks: state.tasks.list
  }
};

const {width} = Dimensions.get('window');
export const getWidth = (_width) => {
  return (_width > width) ? width : _width;
};

export default connect(mapStateToProps, {setFavorite, requestShopById})(TasksScene);

const styles = StyleSheet.create({
  header: {
    flex: 1
  },
  headerMain: {
    padding: 5,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  },
  newVisitBtn: {
    position: "absolute",
    bottom: 10,
    zIndex: 1
  },
  shopTitle: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "center",
    color: "#000000",
    width,
    paddingHorizontal: 10
  },
  shopLogo: {
    marginTop: 10,
    width: 100,
    height: 100
  },
  location: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width,
    paddingHorizontal: 20
  },
  bottomInfo: {
    backgroundColor: "white",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  gray: {
    fontSize: 13,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#b4b4b4"
  },
  distance: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  distanceIcon: {
    marginRight: 5,
  },
  pinIcon: {
    width: 14,
    height: 16,
    marginRight: 10
  },
  address: {
    fontSize: 15,
    fontWeight: "normal",
    color: "#808080"
  },
  tasksLabel: {
    padding: 16,
    paddingBottom: 10,
    fontSize: 24,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "left",
    color: "#000000",
    backgroundColor: "#efeff4"
  },
  delimiter: {
    width: "90%",
    paddingHorizontal: 16,
    marginBottom: 25,
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderColor: '#d8d8d8'
  },
  item: {
    borderRadius: 4,
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 10,
    marginVertical: 6,
    shadowOffset: {
      width: 0,
      height: 0.2
    },
    shadowRadius: 2.5,
    shadowOpacity: 0.15,
    elevation: 3
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#000000"
  },
  description: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "normal",
    color: "#b4b4b4"
  },
  empty: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 15
  },
  emptyTitle: {
    marginTop: 31,
    fontSize: 22,
    fontWeight: "500",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "center",
    color: "#000000"
  },
  emptyDetail: {
    marginTop: 15,
    width: 260,
    fontSize: 16,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "center",
    color: "#9b9b9b"
  }
});