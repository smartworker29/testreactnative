import React, { Component, Fragment } from 'react'
import { StyleSheet, Text, View, FlatList, ScrollView, Image } from 'react-native'
import { Button, Container, Icon, ListItem, Title } from 'native-base'
import { connect } from 'react-redux'
import { goToPhoto, backTo, visitDetailsAndReset } from '../actions/navigation'
import { clearVisitDetails, getVisitDetails, } from '../actions/visitDetails'
import I18n from 'react-native-i18n'
import ImageView from '../component/ImageView'
import { visitNavigationOptions } from '../navigators/options'
import {
    badIcon, cameraIcon, dislikeIcon, foodImage, goodIcon, likeIcon, pinIcon, syncIcon, timeIcon, unknownIcon,
    unsyncIcon
} from '../utils/images'
import GradientButton from '../component/GradientButton'
import moment from 'moment'
import _ from "lodash"
import ru from "moment/locale/ru";
import { allowAction } from "../utils/util";

export class VisitDetailScene extends Component {

    static navigationOptions = ({navigation}) => visitNavigationOptions(navigation)

    constructor() {
        super()

        this.moment = moment
        this.moment.updateLocale("ru", ru);

        if (I18n.currentLocale().includes("ru")) {
            this.moment.locale("ru");
        } else {
            this.moment.locale("en");
        }

        this.state = {
            date: undefined
        }
    }

    async componentWillMount() {
        const id = this.props.navigation.state.params.id
        const visit = this.props.visits[id]

        if (visit && visit.tmp) {
            return
        }

        await this.props.getVisitDetails(id)

        this.timer = setInterval(async () => {
            await this.props.getVisitDetails(id)
        }, 6000)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
        this.props.clearVisitDetails()
    }

    renderInfoBlock(title, icon, status) {
        return (
            <View syle={styles.result}>
                <View style={styles.delimiter}/>
                <Text style={styles.infoTitle}>{title}</Text>
                <View style={styles.infoStatusRow}>
                    <Image style={styles.statusIcon} source={icon}/>
                    <Text style={styles.statusText}>{status}</Text>
                </View>
            </View>
        )
    }

    renderShopDetail(visit) {
        if (!visit.shop_name || !visit.shop_area) {
            return null
        }
        return (
            <View syle={styles.shop}>
                <Text style={styles.shopName}>{visit.shop_name}</Text>
                <View style={styles.shopPositionRow}>
                    <Image source={pinIcon}/>
                    <Text style={styles.addressText}>{visit.shop_area}</Text>
                </View>
            </View>
        )
    }

    renderResultsBlock(results, id) {

        let resultRow = (
            <View style={styles.infoStatusRow}>
                <Image style={styles.statusIcon} source={unknownIcon}/>
                <Text style={styles.statusText}>- - -</Text>
            </View>
        )

        if (!results) {
            return (
                <View syle={styles.result}>
                    <View style={styles.delimiter}/>
                    <Text style={styles.infoTitle}>{I18n.t('visitDetail.visitResult')}</Text>
                    {resultRow}
                </View>
            )
        }

        switch (results.status) {
            case 'NEGATIVE' :
                resultRow = (
                    <View style={styles.infoStatusRow}>
                        <Image style={styles.statusIcon} source={dislikeIcon}/>
                        <Text style={[styles.statusText, styles.red]}>{I18n.t('visitDetail.visitReject')}</Text>
                    </View>
                )
                break
            case 'NEUTRAL':
            case 'POSITIVE' :
                resultRow = (
                    <View style={styles.infoStatusRow}>
                        <Image style={styles.statusIcon} source={likeIcon}/>
                        <Text style={[styles.statusText, styles.green]}>{I18n.t('visitDetail.visitAccept')}</Text>
                    </View>
                )
                break
        }

        const date = this.moment(results.created_date).format('D MMMM, HH:mm')

        const lastMessage = (this.props.detail.id === id) ? (
            <View style={styles.statusBlock}>
                <Text style={styles.statusBlockText}>{this.props.detail.detail}</Text>
                <Text style={styles.statusBlockDate}>{date}</Text>
            </View>
        ) : null;

        return (
            <View syle={styles.result}>
                <View style={styles.delimiter}/>
                <Text style={styles.infoTitle}>{I18n.t('visitDetail.visitResult')}</Text>
                {resultRow}
                {lastMessage}
            </View>
        )
    }

    renderModerationBlock(moderation) {

        let moderationRow = (
            <View style={styles.infoStatusRow}>
                <Image style={styles.statusIcon} source={timeIcon}/>
                <Text style={styles.statusText}>{I18n.t('visits_list.moderation')}</Text>
            </View>
        )

        if (moderation === null || !this.props.detail.lastModerationMessage) {
            return (
                <View syle={styles.result}>
                    <View style={styles.delimiter}/>
                    <Text style={styles.infoTitle}>{I18n.t('visitDetail.moderationResult')}</Text>
                    {moderationRow}
                </View>
            )
        }

        switch (moderation.status) {
            case 'NEGATIVE' :
                moderationRow = (
                    <View style={styles.infoStatusRow}>
                        <Image style={styles.statusIcon} source={badIcon}/>
                        <Text style={[styles.statusText, styles.red]}>{I18n.t('visitDetail.moderationReject')}</Text>
                    </View>
                )
                break
            case 'POSITIVE' :
                moderationRow = (
                    <View style={styles.infoStatusRow}>
                        <Image style={styles.statusIcon} source={goodIcon}/>
                        <Text style={[styles.statusText, styles.green]}>{I18n.t('visitDetail.moderationDone')}</Text>
                    </View>
                )
                break
        }

        const date = this.moment(moderation.created_date).format('D MMMM, HH:mm')

        return (
            <View syle={styles.result}>
                <View style={styles.delimiter}/>
                <Text style={styles.infoTitle}>{I18n.t('visitDetail.moderationResult')}</Text>
                {moderationRow}
                <View style={styles.statusBlock}>
                    <Text style={styles.statusBlockComment}>{I18n.t('visitDetail.moderationComment')}</Text>
                    <Text style={styles.statusBlockText}>{this.props.detail.lastModerationMessage}</Text>
                    <Text style={styles.statusBlockDate}>{date}</Text>
                </View>
            </View>
        )
    }

    componentWillReceiveProps(props) {
        const {sync} = this.props
        const {id} = this.props.navigation.state.params

        if (sync && sync[id]) {
            return this.props.navigation.dispatch(visitDetailsAndReset(sync[id]))
        }
    }

    getFilename(path) {
        return path.replace(/^.*[\\\/]/, '');
    }

    renderPhotoArea(visit) {

        const images = visit.images || []
        const {id} = this.props.navigation.state.params
        const photos = this.props.photos.filter(photo => photo.visit === id).toList()
        const cachePhotos = this.props.photosCache.filter(photo => photo.visit === id).toList()

        console.log("cachePhotos", cachePhotos.toObject());

        if (cachePhotos.count() === 0 && photos.count() === 0) {
            return (
                <View style={styles.emptyPhotoContainer}>
                    <View style={styles.delimiter}/>
                    <View style={styles.emptyPhotoImageArea}>
                        <Image style={styles.emptyPhotoImage} source={foodImage}/>
                    </View>
                    <Text style={styles.emptyPhotoTitle}>{I18n.t('photo.noPhotoTitle')}</Text>
                    <Text style={styles.emptyPhotoDescription}>{I18n.t('photo.noPhotoDescription')}</Text>
                </View>
            )
        }

        const imageBlocks = []

        for (const image of cachePhotos) {
            imageBlocks.push(
                <ImageView key={image.uri} photo={{uri: image.uri, isUpload: true}}/>
            )
        }

        for (const image of photos) {
            imageBlocks.push(
                <ImageView key={image.uri} photo={image}/>
            )
        }

        return (
            <Fragment>
                <View style={styles.pd16}>
                    <View style={styles.delimiter}/>
                    <Text style={styles.photo}>{I18n.t('visitDetail.photo')}</Text>
                </View>
                <View style={styles.photoArea}>
                    {imageBlocks}
                </View>
            </Fragment>
        )
    }

    goToPhoto = (id) => {
        if (allowAction("goToPhoto")) {
            this.props.goToPhoto(id);
        }
    }

    render() {
        const {id} = this.props.navigation.state.params
        const visit = this.props.visits[id]
        const {photos} = this.props;

        if (!visit) {
            return null
        }

        const needPhotoSync = photos.find(photo => photo.visit === id && photo.isUpload === false);
        const sync_icon = (visit.tmp || needPhotoSync) ? unsyncIcon : syncIcon
        const shopId = (visit.shop !== null) ? visit.shop : '- - -'
        const hours = Math.abs(moment(visit.started_date).diff(new Date(), 'hours'))
        const maxId = _.max(this.props.result);
        return (
            <View style={{flex: 1}}>
                {hours < 1 && parseInt(id) === parseInt(maxId) ?
                    <GradientButton icon={cameraIcon} style={styles.takePhotoBtn} text={I18n.t('photo.makePhoto')}
                                    onPress={() => this.goToPhoto(id)}/> : null}
                <ScrollView style={styles.container}>
                    <View style={{paddingVertical: 16}}>
                        <View style={styles.pd16}>
                            <View style={styles.row}>
                                <Text
                                    style={styles.dateColor}>{this.moment(visit.started_date).format('D MMMM, HH:mm')}</Text>
                                <Image source={sync_icon}/>
                            </View>
                            {this.renderShopDetail(visit)}
                            <Text style={styles.id}>{`ID ${shopId}`}</Text>
                            {this.renderResultsBlock(visit.results, visit.id)}
                            {!visit.tmp ? this.renderModerationBlock(visit.moderation) : null}
                        </View>
                        {this.renderPhotoArea(visit)}
                        <View style={{flex: 1, height: 80}}/>
                    </View>
                </ScrollView>
            </View>
        )
    }

}

const mapStateToProps = (state) => {
    const {nav, visitDetails, photo, visits} = state
    return {
        nav: nav,
        isFetch: visitDetails.isFetch,
        visits: visits.entities.visit,
        offline: visits.entities.offline,
        result: visits.result,
        photos: photo.photos,
        photosCache: photo.cache,
        sync: visits.sync,
        detail: visitDetails.visit,
        needSync: photo.needSync || visits.needSync,
    }
}

export default connect(mapStateToProps, {getVisitDetails, goToPhoto, backTo, clearVisitDetails})(VisitDetailScene)

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
    },
    pd16: {
        paddingHorizontal: 16
    },
    dateColor: {
        color: '#808080',
        fontSize: 15,
        fontWeight: 'normal',
        fontStyle: 'normal',
        letterSpacing: 0,
    },
    shop: {},
    shopName: {
        marginTop: 11,
        textAlignVertical: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        fontStyle: 'normal',
        color: '#000000'
    },
    shopPositionRow: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    addressText: {color: '#b4b4b4', marginLeft: 5},
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    id: {
        fontSize: 16,
        marginTop: 20,
        color: '#000',
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'grey',
    },
    delimiter: {
        marginTop: 20,
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderColor: '#d8d8d8'
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        fontStyle: 'normal',
        color: '#000000',
        marginTop: 15
    },
    infoStatusRow: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    statusIcon: {
        width: 28,
        height: 28
    },
    statusText: {
        marginLeft: 6,
        color: '#808080',
        fontSize: 16,
        fontWeight: '500',
        fontStyle: 'normal'
    },
    statusBlock: {
        padding: 15,
        flex: 1,
        marginTop: 19,
        borderRadius: 4,
        backgroundColor: '#f5f5f7'
    },
    statusBlockComment: {
        opacity: 0.6,
        fontSize: 12,
        marginBottom: 10,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000'
    },
    statusBlockText: {
        fontSize: 15,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000'
    },
    statusBlockDate: {
        opacity: 0.6,
        marginTop: 10,
        fontSize: 12,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000'
    },
    red: {
        color: '#c40010'
    },
    green: {
        color: '#58c02f'
    },
    photo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        color: '#000',
    },
    innerContainer: {
        alignItems: 'center',
    },
    buttonArea: {
        width: '100%',
        position: 'absolute',
        bottom: 0
    },
    photoArea: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: "space-around",
        flexWrap: 'wrap',
        marginTop: 10
    },
    emptyPhotoContainer: {
        flexDirection: 'column',
        marginHorizontal: 16,
        justifyContent: 'center'
    },
    emptyPhotoImageArea: {
        marginTop: 20,
        width: 200,
        height: 200,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyPhotoImage: {
        width: 166,
        height: 172
    },
    emptyPhotoTitle: {
        marginTop: 10,
        fontSize: 22,
        fontWeight: '500',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#000000'
    },
    emptyPhotoDescription: {
        marginTop: 15,
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        letterSpacing: 0,
        textAlign: 'center',
        color: '#9b9b9b'
    },
    takePhotoBtn: {
        position: 'absolute',
        bottom: 10,
        zIndex: 1
    },
    empty: {flex: 1, justifyContent: 'center', alignItems: 'center'}
})