import React, {Component} from 'react';
import {shopsNavigationOptions} from "../navigators/options";
import {
    FlatList,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
    AlertIOS,
    ActivityIndicator,
    Modal, Alert, RefreshControl
} from "react-native";
import I18n from 'react-native-i18n'
import {connect} from "react-redux";
import {
    distanceIcon,
    likeOffIcon,
    likeOnIcon,
    pinIcon
} from "../utils/images";
import GradientButton from "../component/GradientButton";
import {getShops, getShopsNearest, requestShopById, selectFavorites, selectNearest, updateGeo} from "../actions/shops";
import {FAVORITES, NEAREST} from "../reducer/shops";
import DialogAndroid from "react-native-dialogs";
import {allowAction, getCoordinates} from "../utils/util";
import {CachedImage} from "react-native-img-cache";
import _ from "lodash";

class ShopsScene extends Component {
    static navigationOptions = ({navigation}) => shopsNavigationOptions(navigation);

    constructor() {
        super();
    }

    itemClick = (shop) => {
        if (allowAction("goToTasks")) {
            this.goToTasks(shop);
        }
    };

    renderItem(item) {
        if (!item) {
            return null;
        }
        const {geo} = this.props;
        const logo = item['logo'];
        const distance = (geo === null) ? <ActivityIndicator
            size="small"/> : <Text
            style={styles.gray}>{(item.distance !== undefined) ? this.formatDistance(item.distance) : this.distance(item.latitude, item.longitude, geo.latitude, geo.longitude)}</Text>;
        const {favorites} = this.props;
        const icon = (favorites && favorites.find(fav => fav.shop === item.id)) ? likeOnIcon : likeOffIcon;

        const length = _.isArray(item.visittask_ids) ? item.visittask_ids.length : 0;
        return (
            <TouchableOpacity style={styles.item} onPress={() => this.itemClick(item)} key={`${item.id}`}>
                <View style={styles.topRow}>
                    {(logo) ? <CachedImage style={styles.icon} source={{uri: logo}} resizeMode="contain"/> : null}
                    <View style={{flex: 1}}>
                        <View style={styles.rowTitleFavorite}>
                            <Text style={styles.title}>{_.get(item, "customer_name")}</Text>
                            <Image style={styles.favoriteIcon} source={icon}/>
                        </View>
                        <View style={styles.location}>
                            <Image source={pinIcon} style={styles.pinIcon}/>
                            <Text style={styles.description}>{item.address}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.delimiter}/>
                <View style={styles.bottomInfo}>
                    <Text style={styles.gray}>{`${I18n.t("shops.tasks")}: ${length}`}</Text>
                    <Text style={styles.gray}>{`ID ${item.customer_id}`}</Text>
                    <View style={styles.distance}>
                        <Image source={distanceIcon} style={styles.distanceIcon}/>
                        {distance}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    formatDistance = (dist) => {
        if (dist === 0) {
            return `0 ${I18n.t("shops.m")}`
        }
        const [meter,] = String(dist).split(".");
        if (meter === 0) {
            return `0 ${I18n.t("shops.m")}`
        }
        if (meter < 1000 && meter > 0) {
            return meter + ` ${I18n.t("shops.m")}`
        }
        if (meter > 1000) {
            return (meter / 1000).toFixed(1) + ` ${I18n.t("shops.km")}`
        }
    };

    distance = (lat1, lon1, lat2, lon2) => {
        let R = 6371;
        let dLat = (lat2 - lat1) * Math.PI / 180;
        let dLon = (lon2 - lon1) * Math.PI / 180;
        let a =
            0.5 -
            Math.cos(dLat) / 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;

        const distance = (R * 2 * Math.asin(Math.sqrt(a))).toFixed(3);
        const [, meter] = String(distance).split(".");
        return (distance > 1) ? Math.round(distance) + ` ${I18n.t("shops.km")}` : meter + ` ${I18n.t("shops.m")}`;
    };


    async componentDidMount() {
        this.props.navigation.setParams({
            favHandler: this.selectFavorites,
            nearHandler: this.selectNearest,
            enterIdHandler: this.enterShopId
        })
    }

    async requestShop(id) {
        const shops = await this.props.requestShopById(id);
        const shop = _.find(shops, shop => shop.customer_id === id);
        if (!shop) {
            if (Platform.OS === "ios") {
                Alert.alert(
                    `${I18n.t("shops.notFoundById")} ${id}`,
                    I18n.t("shops.checkId"),
                    [
                        {
                            text: I18n.t("photo.cancel"), onPress: () => {
                            }, style: 'cancel'
                        },
                        {text: I18n.t("shops.continue"), onPress: () => this.goToTasks(id)},
                    ],
                    {cancelable: false}
                );
            } else {
                const dialog = new DialogAndroid();
                dialog.set({
                    title: `${I18n.t("shops.notFoundById")} ${id}. ${I18n.t("shops.checkId")}`,
                    positiveText: I18n.t("shops.continue"),
                    negativeText: I18n.t("photo.cancel"),
                    onPositive: () => {
                        this.goToTasks(id)
                    }
                });
                dialog.show();
            }
        } else {
            this.goToTasks(shop);
        }
    }

    enterShopId = () => {
        const {list} = this.props;
        if (Platform.OS === "ios") {
            AlertIOS.prompt(
                I18n.t("alerts.enterIdShop"),
                null,
                text => {
                    if (text.length > 20) {
                        return Alert.alert(I18n.t("error.attention"), I18n.t("alerts.idLength"))
                    }
                    const shop = list.find(shop => {
                        return shop.customer_id === text
                    });
                    if (shop) {
                        this.goToTasks(shop)
                    } else {
                        this.requestShop(text);
                    }
                },
                "plain-text",
                "",
                "numeric"
            );
        } else {
            const dialog = new DialogAndroid();
            dialog.set({
                title: I18n.t("alerts.enterIdShop"),
                input: {
                    callback: (shopId) => {
                        if (shopId.length > 20) {
                            return Alert.alert(I18n.t("attention"), I18n.t("alerts.idLength"))
                        }
                        const shop = list.find(shop => shop.customer_id === shopId);
                        if (shop) {
                            this.goToTasks(shop)
                        } else {
                            this.requestShop(shopId);
                        }
                    },
                    type: 2
                },
                allowEmptyInput: false,
                positiveText: I18n.t("alerts.accept"),
                negativeText: I18n.t("alerts.cancel"),
            });
            dialog.show();
        }
    };

    renderNewVisit() {
        return <GradientButton style={styles.newVisitBtn} text={I18n.t("shops.enterId")}
                               onPress={this.enterShopId}/>
    }

    goToTasks = (shop) => {
        const {favorites} = this.props;
        this.props.navigation.navigate("Tasks", {
            shop,
            favorites
        });
    };

    selectFavorites = () => {
        this.props.selectFavorites();
    };

    selectNearest = () => {
        this.props.selectNearest();
    };

    loadMore = () => {
        const {next} = this.props;
        this.props.getShopsNearest(next);
    };

    renderFooter = () => {
        if (!this.props.isFetchNext) {
            return <View style={{height: 80}}/>;
        }
        return (
            <View style={{height: 130, justifyContent: "flex-start"}}>
                <ActivityIndicator style={{marginTop: 15}}/>
            </View>
        )
    };

    updateShops = async () => {
        await this.props.getShopsNearest();
    };

    componentWillReceiveProps(props) {
        if (this.props.shopIsFetch !== props.shopIsFetch && props.shopIsFetch !== undefined) {
            this.props.navigation.setParams({shopIsFetch: props.shopIsFetch})
        }
    }

    renderHeader = () => {

        let text;
        if (this.props.geoIsFetch || this.props.geo === null) {
            text = I18n.t("CreateVisit.getGeo");
            return (
                <View
                    style={styles.geoRow}>
                    <ActivityIndicator/>
                    <Text style={{marginLeft: 10}}>{text}</Text>
                </View>
            )
        }

        if (this.props.geoIsFetch === false && this.props.geo !== null) {
            return (
                null
            )
        }

        if (this.props.geoErrorCode > 0) {
            return (
                <View style={styles.geoRow}>
                    <Text style={[styles.geoText, styles.colorRed]}>Не удалось получить геопозицию GPS. Прием сигнала
                        GPS может быть затруднен в помещениях, попробуйте еще раз на улице.</Text>
                </View>
            )
        }

        return null;
    };

    renderEmptyList = () => {

        if (!this.props.isFetch && this.props.type === NEAREST) {
            return (
                <View style={{alignItems: "center", justifyContent: "center", padding: 5}}>
                    <Text style={{textAlign: "center"}}>{I18n.t("shops.noShops")}.</Text>
                </View>
            )
        } else if (!this.props.isFetch && this.props.type === FAVORITES) {
            return (
                <View style={{alignItems: "center", justifyContent: "center", height: 30}}>
                    <Text style={{textAlign: "center"}}>У вас пока нет избранных магазинов.</Text>
                </View>
            )
        }

        return null;
    };

    render() {
        let {type, favorites, list} = this.props;
        if (type === FAVORITES) {
            list = favorites.map(item => item.gps_shop);
        }
        if (this.props.geoStatus === 'denied') {
            return <View style={{flex: 1, justifyContent: "center", alignItems: 'center'}}>
                <Text style={{textAlign: "center"}}>{I18n.t("shops.geoDeny")}</Text>
            </View>
        }
        console.log('list', list.toArray())
        return (
            <View style={{flex: 1}}>
                <FlatList
                    data={list.toArray()}
                    ListHeaderComponent={this.renderHeader}
                    ListFooterComponent={this.renderFooter}
                    renderItem={({item}) => this.renderItem(item)}
                    keyExtractor={(item)=>`${item.id}`}
                    ListEmptyComponent={this.renderEmptyList}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.props.isFetch}
                            onRefresh={() => this.updateShops()}
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
        tasks: state.tasks.list,
        isFetch: state.shops.isFetch,
        list: state.shops.list,
        favorites: state.shops.favorites,
        type: state.shops.type,
        geo: state.shops.geo,
        geoIsFetch: state.shops.geoIsFetch,
        next: state.shops.next,
        shopIsFetch: state.shops.shopIsFetch,
        isFetchNext: state.shops.isFetchNext,
        geoErrorCode: state.shops.geoErrorCode,
        geoStatus: state.app.geoStatus
    }
};

export default connect(mapStateToProps, {
    selectFavorites,
    selectNearest,
    getShops,
    requestShopById,
    updateGeo,
    getShopsNearest
})(ShopsScene);

const styles = StyleSheet.create({
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
    geoRow: {
        minHeight: 30,
        flex: 1, flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center"
    },
    geoText: {
        textAlign: "center"
    },
    containerInfo: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#efeff4"
    },
    icon: {
        width: 60,
        marginRight: 10,
    },
    location: {
        marginTop: 8,
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-start"
    },
    pinIcon: {
        width: 14,
        height: 16,
        marginTop: 3,
        marginRight: 5
    },
    gray: {
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        letterSpacing: 0,
        color: "#808080"
    },
    newVisitBtn: {
        position: "absolute",
        bottom: 10,
        zIndex: 1
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    topRow: {
        flexDirection: "row"
    },
    rowTitleFavorite: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    favoriteIcon: {
        position: "absolute",
        right: 0
    },
    bottomInfo: {
        marginTop: 15,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    distance: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center"
    },
    distanceIcon: {
        marginRight: 5,
    },
    title: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#000000",
        paddingRight: 30
    },
    description: {
        fontSize: 15,
        fontWeight: "normal",
        color: "#b4b4b4"
    },
    delimiter: {
        marginTop: 15,
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderColor: '#d8d8d8'
    },
    requestText: {
        color: "black",
        fontWeight: "bold",
        marginBottom: 15
    },
    alertArea: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    alertWindow: {
        width: 250,
        height: 100,
        borderRadius: 5,
        backgroundColor: "white",
        justifyContent: "center",
        shadowOffset: {
            width: 0,
            height: 0.2
        },
        shadowRadius: 5,
        shadowOpacity: 0.15,
        elevation: 5
    },
    colorGreen: {
        color: "#58c02f"
    },
    colorRed: {
        color: "#c40010"
    }
});