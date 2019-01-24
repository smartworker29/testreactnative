import React, {Component} from 'react';
import {taskNavigationOptions} from "../navigators/options";
import {
    FlatList,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    ActivityIndicator,
    Alert,
    Platform
} from "react-native";
import I18n from 'react-native-i18n'
import {connect} from "react-redux";
import {addIcon} from "../utils/images";
import GradientButton from "../component/GradientButton";
import HTMLView from 'react-native-htmlview';
import {allowAction, distance, distanceM, getCoordinates} from "../utils/util";
import {createVisit} from "../actions/visist";
import _ from "lodash";

const distance_check = "max_visit_to_store_distance_m";

class TaskScene extends Component {
    static navigationOptions = ({navigation}) => taskNavigationOptions(navigation);

    constructor() {
        super();
        this.state = {
            fetchGeo: false,
            geoAllow: false,
            code: null
        }
    }

    goToCreateVisit = async () => {
        if (allowAction("createVisitFromTask")) {
            const {shop, task} = this.props.navigation.state.params;
            const {fields, geo} = this.props;
            const shopId = _.isString(shop) ? shop : shop.customer_id;

            let coordinates = null;
            let _distance = null;

            const ds = this.props.instance[distance_check] && this.props.instance[distance_check];
            if (this.props.geo && this.props.geo !== null) {
                coordinates = this.props.geo;
                if (!_.isString(shop) && shop) {
                    _distance = distanceM(shop.latitude, shop.longitude, geo.latitude, geo.longitude);
                }
            } else {
                try {
                    this.setState({fetchGeo: true});
                    coordinates = await getCoordinates();
                } catch (error) {
                    return this.setState({
                        geoAllow: false,
                        fetchGeo: false,
                        geoError: error.message,
                        code: error.code
                    }, () => {
                        if (error.code && error.code === 5) {
                            return setTimeout(() => {
                                Alert.alert(I18n.t("overScreen.geoOff"), I18n.t("overScreen.startGeoInSettings"))
                            }, 500);
                        }
                        if (Platform.OS === "ios" && error.code === 2) {
                            return setTimeout(() => {
                                Alert.alert(I18n.t("overScreen.geoOff"), I18n.t("overScreen.startGeoInSettings"))
                            }, 500);
                        }
                        if (error.code === 3) {
                            return setTimeout(() => {
                                Alert.alert("Error", I18n.t("error.geoTimeout"));
                            }, 500);
                        }
                    });
                }
            }

            if (ds < _distance) {
                if (fields["position"] !== undefined && _.lowerCase(fields["position"]) === "checker") {
                    this.setState({geoAllow: true, fetchGeo: false, coordinates, geoError: ""});
                    return Alert.alert(I18n.t("error.attention"), `Нельзя создать отчёт, расстояние больше ${this.formatDistance(ds)}.`)
                } else {
                    const btn = {
                        text: "Ok", onPress: () => {
                            setTimeout(() => {
                                this.props.createVisit(shopId, task.id, 5000, coordinates, task.name, shop)
                            }, 100)
                        }
                    };
                    return this.setState({geoAllow: true, fetchGeo: false, coordinates, geoError: ""}, () => {
                        return Alert.alert(I18n.t("error.attention"), `Расстояние до магазина ${this.formatDistance(_distance)}.`, [btn]);
                    });
                }
            }
            this.props.createVisit(shopId, task.id, 5000, coordinates, task.name, shop);
        }
    };


    formatDistance = (meter) => {
        if (meter === 0) {
            return `0 ${I18n.t("shops.m")}`
        }
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

    renderNewVisit() {
        return <GradientButton icon={addIcon} style={styles.newVisitBtn} text={I18n.t("visits_list.newVisit")}
                               onPress={this.goToCreateVisit}/>
    }

    render() {
        const item = this.props.navigation.state.params.task;
        if (!item) {
            return null;
        }

        let text = "";

        if (this.state.fetchGeo) {
            text = "Получение геолокации";
        } else if (this.props.isFetch) {
            text = I18n.t("CreateVisit.createVisit");
        }

        return (
            <View style={{flex: 1}}>
                <Modal visible={this.state.fetchGeo || this.props.isFetch} animationType="fade"
                       onRequestClose={() => {
                       }}
                       transparent={true}>
                    <View style={styles.alertArea}>
                        <View style={styles.alertWindow} elevate={5}>
                            <View style={{alignItems: "center"}}>
                                <Text style={styles.requestText}>{text}</Text>
                                <ActivityIndicator size="small"/>
                            </View>
                        </View>
                    </View>

                </Modal>
                {this.renderNewVisit()}
                <ScrollView style={{flex: 1, paddingHorizontal: 16, backgroundColor: "white"}}>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.shortDescription}>{item.short_description}</Text>
                    <View style={styles.delimiter}/>
                    <Text style={styles.instruction}>{I18n.t("task.instruction")}</Text>
                    <HTMLView style={styles.longDescription} value={item.long_description}/>
                    <View style={{height: 75}}/>
                </ScrollView>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        list: state.tasks.list,
        isFetch: state.visits.isCreateFetch,
        geoStatus: state.app.geoStatus,
        instance: state.auth.instance,
        geo: state.shops.geo,
        fields: state.profile.fields
    }
};

export default connect(mapStateToProps, {createVisit})(TaskScene);

const styles = StyleSheet.create({
    title: {
        marginTop: 15,
        fontSize: 24,
        fontWeight: "bold",
        color: "#000000"
    },
    shortDescription: {
        marginTop: 9,
        fontSize: 16,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#9b9b9b"
    },
    delimiter: {
        marginTop: 21,
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderColor: '#d8d8d8'
    },
    instruction: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: "bold",
        fontStyle: "normal",
        color: "#000000"
    },
    longDescription: {
        marginTop: 17
    },
    newVisitBtn: {
        position: "absolute",
        bottom: 10,
        zIndex: 1
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
    requestText: {
        color: "black",
        fontWeight: "bold",
        marginBottom: 15
    }
});