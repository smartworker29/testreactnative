import React, {PureComponent} from 'react'
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import I18n from 'react-native-i18n'
import PropTypes from 'prop-types'
import {
    badIcon, dislikeIcon, goodIcon, likeIcon, pinIcon, syncIcon, timeIcon, unknownIcon,
    unsyncIcon
} from '../utils/images'
import moment from 'moment'
import {connect} from 'react-redux';
import ru from 'moment/locale/ru';
import _ from "lodash";

class ListItem extends PureComponent {
    constructor() {
        super()
        this.moment = moment;
        this.moment.updateLocale("ru", ru);

        if (I18n.currentLocale().includes("ru")) {
            this.moment.locale("ru");
        } else {
            this.moment.locale("en");
        }
    }

    /**
     * Shop detail
     * @param visit
     * @returns {*}
     */
    renderShopDetail(visit) {
        const {shop_name, shop_area} = visit
        if (!shop_name || !shop_area) {
            return null
        }
        return (
            <View style={styles.shopDetails}>
                <Text style={styles.shopName}>{shop_name}</Text>
                <View style={styles.shopPositionRow}>
                    <Image source={pinIcon}/>
                    <Text style={styles.addressText}>{shop_area}</Text>
                </View>
            </View>
        )
    }

    /**
     * Status moderation
     * @returns {*}
     */
    renderResultBlock(visit) {
        const {moderation, results} = visit;

        const resultBlock = (icon, text, color) => {
            return (
                <View style={styles.statusResult}>
                    <Image style={styles.statusIcon} source={icon}/>
                    <Text style={[styles.statusText, color]}>{text}</Text>
                </View>
            )
        };

        const moderationBlock = (icon, text, color) => {
            return (
                <View style={styles.statusModeration}>
                    <Image style={styles.statusIcon} source={icon}/>
                    <Text style={[styles.statusText, color]}>{text}</Text>
                </View>
            )
        };

        let resultView = resultBlock(unknownIcon, '- - -');
        let moderationView = (!visit.tmp && moderation !== null) ? moderationBlock(timeIcon, I18n.t('visits_list.OnModeration')) : null;
        //moderationView = (!moderation === null) ? moderation : null;

        if (results && results.status) {
            switch (results.status) {
                case 'NEGATIVE' :
                    resultView = resultBlock(dislikeIcon, I18n.t('visits_list.resultBad'), styles.red);
                    break;
                case 'NEUTRAL':
                case 'POSITIVE' :
                    resultView = resultBlock(likeIcon, I18n.t('visits_list.resultGood'), styles.green);
                    break
            }
        }

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
                    {resultView}
                    {moderationView}
                </View>
            </View>
        )
    }

    render() {
        const {visit, photos, pathNumber, sync} = this.props;
        const route = (visit.current_agent_route !== undefined) ? visit.current_agent_route : pathNumber;
        const needPhotoSync = photos.find(photo => {
            return (
                (photo.visit === visit.id || photo.tmpId === visit.id || sync[photo.visit] === visit.id) &&
                (photo.isUploaded === false || photo.isUploading === true))
        });

        //Reactotron.log(`visit ${visit.id} needPhotoSync=${needPhotoSync}`);

        const sync_icon = (visit.tmp || needPhotoSync) ? unsyncIcon : syncIcon;
        const shopId = (visit.shop !== null) ? visit.shop : '- - -';
        const id = (!visit.id || visit.tmp === true) ? '- - -' : visit.id;

        const time = (visit.started_date) ? visit.started_date : visit.local_date;

        return (
            <TouchableOpacity {...this.props} onPress={this.props.onPress} style={{padding: 5}}>
                <View style={styles.item}>
                    <View style={styles.row}>
                        <Text style={styles.dateColor}>{this.moment(time).format('D MMMM, HH:mm')}</Text>
                        <Image source={sync_icon}/>
                    </View>
                    {this.renderShopDetail(visit)}
                    <View style={styles.delimiter}/>
                    {this.renderResultBlock(visit)}
                    <View style={styles.numberRow}>
                        <Text style={styles.shopNumber}>{`ID ${shopId} ${I18n.t("visits_list.route")} ${route}`}</Text>
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
}

ListItem.defaultProps = {
    visit: {}
}

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
        marginLeft: 5,
        fontSize: 15,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#b4b4b4'
    }
})

export default connect(state => {
    return {
        photos: state.photo.photos,
        pathNumber: state.profile.pathNumber,
        sync: state.visits.sync,
    }
})(ListItem)
