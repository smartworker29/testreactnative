import React, {PureComponent} from 'react'
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import I18n from 'react-native-i18n'
import PropTypes from 'prop-types'
import {
    badIcon, dislikeIcon, fiveImage, goodIcon, likeIcon, magnitLogo, pinIcon, syncIcon, timeIcon, unknownIcon,
    unsyncIcon
} from '../utils/images'
import moment from 'moment'
import {connect} from 'react-redux';
import ru from 'moment/locale/ru';
import _ from "lodash";
import {CachedImage} from "react-native-img-cache";
import DeviceInfo from "react-native-device-info";

class ListItem extends PureComponent {
    constructor() {
        super();
        this.moment = moment;
        this.moment.updateLocale("ru", ru);

        if (I18n.currentLocale().includes("ru")) {
            this.moment.locale("ru");
        } else {
            this.moment.locale("en");
        }
    }


    /**
     * Status moderation
     * @returns {*}
     */
    renderResultBlock(visit) {
        const {moderation, results} = visit;

        if (moderation === null) {
            return null;
        }

        const moderationBlock = (icon, text, color) => {
            return (
                <View style={styles.statusModeration}>
                    <Image style={styles.statusIcon} source={icon}/>
                    <Text style={[styles.statusText, color]}>{text}</Text>
                </View>
            )
        };

        let moderationView = (!visit.tmp && moderation !== null) ? moderationBlock(timeIcon, I18n.t('visits_list.OnModeration')) : null;

        if (moderation && moderation.status) {
            switch (moderation.status) {
                case 'NEGATIVE' :
                    moderationView = moderationBlock(badIcon, I18n.t('visits_list.moderation'), styles.red);
                    break;
                case 'POSITIVE' :
                    moderationView = moderationBlock(goodIcon, I18n.t('visits_list.moderation'), styles.green);
                    break
            }
        }

        return (
            <View style={[styles.row, styles.mgt15]}>
                <View style={styles.statusRow}>
                    {moderationView}
                </View>
            </View>
        )
    }

    renderShopInfo(visit) {
        if (!visit) {
            return null;
        }
        const {shop_name, shop_area} = visit;
        if (!shop_name || !shop_area) {
            return null
        }
        const shop = visit.gps_shop;
        const logo = shop.logo;
        return (
            <View style={styles.topRow}>
                {(logo) ? <CachedImage style={styles.icon} source={{uri: logo}} resizeMode="contain"/> : null}
                <View style={{flex: 1, justifyContent: "center"}}>
                    <View style={styles.rowTitleFavorite}>
                        <Text style={styles.title}>{shop_name}</Text>
                    </View>
                </View>
            </View>
        )
    }

    render() {
        const {visit, photos, pathNumber, sync, instance} = this.props;
        const route = (visit.current_agent_route !== undefined) ? visit.current_agent_route : pathNumber;
        const needPhotoSync = photos.find(photo => {
            return (
                (photo.visit === visit.id || photo.tmpId === visit.id || sync[photo.visit] === visit.id) &&
                (photo.isUploaded === false || photo.isUploading === true)) &&
                photo.isProblem !== true
        });

        let hasRoute = null;
        if (instance.agent_fields) {
            hasRoute = _.find(instance.agent_fields, {name: "route"});
        }

        let [lang] = DeviceInfo.getDeviceLocale().split("-");
        let routeName = I18n.t("visitDetail.pathId");

        if (lang && hasRoute && hasRoute[`label_${lang}`]) {
            routeName = hasRoute[`label_${lang}`]
        }

        //Reactotron.log(`visit ${visit.id} needPhotoSync=${needPhotoSync}`);

        const sync_icon = (visit.tmp || needPhotoSync) ? unsyncIcon : syncIcon;
        const shopId = (visit.shop && visit.tmp !== true) ? visit.shop : visit.customer_id;
        const id = (!visit.id || visit.tmp === true) ? '- - -' : visit.id;
        const taskName = this.props.taskNames.get(`${visit.shop}_${visit.task}`);
        const time = (visit.started_date) ? visit.started_date : visit.local_date;

        const infoRow = hasRoute ? `ID ${shopId} ${routeName} ${route}` : `ID ${shopId}`;

        return (
            <TouchableOpacity {...this.props} onPress={this.props.onPress} style={{padding: 5}}>
                <View style={styles.item}>
                    <View style={styles.row}>
                        <Text style={styles.dateColor}>{this.moment(time).format('D MMMM, HH:mm')}</Text>
                        <Image source={sync_icon}/>
                    </View>
                    <Text style={styles.taskName}>{taskName}</Text>
                    {this.renderShopInfo(visit)}
                    <View style={styles.delimiter}/>
                    {this.renderResultBlock(visit)}
                    <View style={styles.numberRow}>
                        <Text style={styles.shopNumber}>{infoRow}</Text>
                        <Text style={styles.number}>{`№ ${id}`}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}

ListItem.propTypes = {
    visit: PropTypes.object,
    onPress: PropTypes.func,
};

ListItem.defaultProps = {
    visit: {}
};

const styles = StyleSheet.create({
    item: {
        borderRadius: 4,
        backgroundColor: 'white',
        padding: 16,
        marginHorizontal: 5,
        marginTop: 3,
        shadowOffset: {
            width: 0,
            height: 0.2
        },
        shadowRadius: 2.5,
        shadowOpacity: 0.15,
        elevation: 3
    },
    topRow: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center"
    },
    icon: {
        width: 40,
        height: 40,
        marginRight: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: "500",
        fontStyle: "normal",
        color: "#000000"
    },
    location: {
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
    description: {
        fontSize: 15,
        paddingRight: 10,
        fontWeight: "normal",
        color: "#b4b4b4"
    },
    taskName: {
        marginTop: 16,
        fontSize: 17,
        fontWeight: "bold",
        fontStyle: "normal",
        letterSpacing: 0,
        color: "#000000"
    },
    dateColor: {
        color: '#808080',
        fontSize: 15,
        fontWeight: 'normal',
        fontStyle: 'normal',
        letterSpacing: 0
    },
    delimiter: {
        marginTop: 15,
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderColor: '#d8d8d8'
    },
    statusIcon: {
        width: 20,
        height: 20
    },
    statusText: {
        marginLeft: 6,
        color: '#808080',
        fontSize: 14,
        fontWeight: '500',
        fontStyle: 'normal'
    },
    red: {
        color: '#c40010'
    },
    green: {
        color: '#58c02f'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    statusRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    statusResult: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    statusModeration: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    numberRow: {
        marginTop: 17,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    shopNumber: {
        fontSize: 12,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000'
    },
    number: {
        fontSize: 12,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#808080'
    },
    mgt15: {
        marginTop: 15
    },
    bold: {
        fontWeight: 'bold'
    },
    shopDetails: {
        marginTop: 10
    },
    shopName: {
        fontSize: 17,
        fontWeight: 'bold',
        fontStyle: 'normal',
        color: '#000000'
    },
    shopPositionRow: {
        marginTop: 8,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    addressText: {
        marginHorizontal: 5,
        fontSize: 15,
        width: 100,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#b4b4b4'
    }
});

export default connect(state => {
    return {
        photos: state.photo.photos,
        pathNumber: state.profile.pathNumber,
        sync: state.visits.sync,
        taskNames: state.tasks.taskNames,
        instance: state.auth.instance
    }
})(ListItem)
