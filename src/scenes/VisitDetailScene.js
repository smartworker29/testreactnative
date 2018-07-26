import React, {Component, Fragment} from 'react'
import {StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Platform, AlertIOS} from 'react-native'
import {Button, Container, Icon, ListItem, Title} from 'native-base'
import {connect} from 'react-redux'
import {goToPhoto, backTo, gotToPhotoView, goToFeedback} from '../actions/navigation'
import {changeRoute, clearVisitDetails} from '../actions/visitDetails'
import I18n from 'react-native-i18n'
import ImageView from '../component/ImageView'
import {visitNavigationOptions} from '../navigators/options'
import {
    badIcon, cameraIcon, dislikeIcon, editIcon, foodImage, goodIcon, likeIcon, pinIcon, syncIcon, timeIcon, unknownIcon,
    unsyncIcon
} from '../utils/images'
import GradientButton from '../component/GradientButton'
import moment from 'moment'
import _ from "lodash"
import ru from "moment/locale/ru";
import {allowAction} from "../utils/util";
import Permissions from 'react-native-permissions';
import DialogAndroid from 'react-native-dialogs';
import HTMLView from 'react-native-htmlview';
import {CachedImage} from "react-native-img-cache";
import ComponentParser from "../utils/ComponentParser";

export class VisitDetailScene extends Component {

    static navigationOptions = ({navigation}) => visitNavigationOptions(navigation);

    constructor() {
        super();

        this.moment = moment;
        this.moment.updateLocale("ru", ru);
        this.id = null;

        if (I18n.currentLocale().includes("ru")) {
            this.moment.locale("ru");
        } else {
            this.moment.locale("en");
        }

        this.state = {
            date: undefined,
            showBtn: true
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer)
        //this.props.clearVisitDetails()
    }

    componentDidMount() {
        const {openCamera, id} = this.props.navigation.state.params;
        if (openCamera === true) {
            this.goToPhoto(id).then().catch(console.log);
        }
    }

    renderShopDetail(visit) {
        if (!visit.shop_name || !visit.shop_area) {
            return null
        }

        const logo = (visit.gps_shop) ? visit.gps_shop.logo : null;

        return (
            <View style={styles.topRow}>
                {(logo) ? <CachedImage style={styles.icon} source={{uri: logo}} resizeMode="contain"/> : null}
                <View style={{flex: 1, justifyContent: "center"}}>
                    <View>
                        <Text style={styles.title}>{visit.shop_name}</Text>
                    </View>
                    <View style={styles.location}>
                        <Image source={pinIcon} style={styles.pinIcon}/>
                        <Text style={styles.description}>{visit.shop_area}</Text>
                    </View>
                </View>
            </View>
        )
    }

    renderResultsBlock(results, id) {

        if (!results) {
            return (
                <View style={styles.result}>
                    <View style={styles.delimiter}/>
                    <Text style={styles.infoTitle}>{I18n.t('visitDetail.visitResult')}</Text>
                </View>
            )
        }

        const date = this.moment(results.created_date).format('D MMMM, HH:mm');

        const message = (results.message_type === "MULTIMEDIA") ? ComponentParser.parse(results.message) :
            <HTMLView value={results.message}/>;

        const lastMessage = (
            <View style={styles.statusBlock}>
                <Text style={styles.statusBlockDate}>{date}</Text>
                {message}
            </View>
        );

        return (
            <View style={styles.result}>
                <View style={styles.delimiter}/>
                <Text style={styles.infoTitle}>{I18n.t('visitDetail.visitResult')}</Text>
                {lastMessage}
            </View>
        )
    }

    renderModerationBlock(moderation) {

        if (!moderation) {
            return null;
        }

        let moderationRow = (
            <View style={styles.infoStatusRow}>
                <Image style={styles.statusIcon} source={timeIcon}/>
                <Text style={styles.statusText}>{I18n.t('visits_list.moderation')}</Text>
            </View>
        );

        if (moderation === null) {
            return (
                <View style={styles.result}>
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
                );
                break;
            case 'POSITIVE' :
                moderationRow = (
                    <View style={styles.infoStatusRow}>
                        <Image style={styles.statusIcon} source={goodIcon}/>
                        <Text style={[styles.statusText, styles.green]}>{I18n.t('visitDetail.moderationDone')}</Text>
                    </View>
                );
                break
        }

        const date = this.moment(moderation.created_date).format('D MMMM, HH:mm');
        const message = (moderation.message_type === "MULTIMEDIA") ? ComponentParser.parse(moderation.message) :
            <HTMLView value={moderation.message}/>

        return (
            <View style={styles.result}>
                <View style={styles.delimiter}/>
                <Text style={styles.infoTitle}>{I18n.t('visitDetail.moderationResult')}</Text>
                {moderationRow}
                <View style={styles.statusBlock}>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                        <Text style={styles.statusBlockComment}>{I18n.t('visitDetail.moderationComment')}</Text>
                        <Text style={styles.statusBlockDate}>{date}</Text>
                    </View>
                    {message}
                </View>
            </View>
        )
    }

    renderFeedbackAnswer(helpdesk) {

        if (!helpdesk) {
            return null;
        }

        const date = this.moment(helpdesk.created_date).format('D MMMM, HH:mm');

        return (
            <View style={{paddingHorizontal: 16}}>
                <View style={styles.delimiter}/>
                <Text style={styles.infoTitle}>{I18n.t('feedback.support')}</Text>
                <View style={styles.statusBlock}>
                    <View style={{flexDirection: "row", justifyContent: "flex-end"}}>
                        <Text style={styles.statusBlockComment}>{date}</Text>
                    </View>
                    <HTMLView value={helpdesk.message}/>
                </View>
            </View>
        )
    }

    componentWillReceiveProps(props) {
        const {sync} = this.props;
        const {id} = this.props.navigation.state.params;

        if (this.props.sync !== props.sync) {
            if (props.sync[id]) {
                this.props.navigation.setParams({
                    sync,
                    id: props.sync[id],
                    tmp: false
                });
            } else {
                this.props.navigation.setParams({
                    sync
                });
            }

        }
    }

    goToPreview(uri, photos, index, count, photoId) {
        if (allowAction("goToPreview")) {
            this.props.navigation.navigate("Preview", {uri, photos, index, count, photoId});
        }
    };

    goToSync(id) {
        return;
        if (allowAction("goToSync")) {
            this.props.navigation.navigate("Sync", {id});
        }
    }

    renderPhotoArea(visit, isLast) {
        const {sync} = this.props;
        const {id} = this.props.navigation.state.params;
        const photos = this.props.photos.filter(photo => {
            return photo.visit === id || photo.tmpId === id || sync[photo.visit] === id;
        }).sort((a, b) => {
            if (a.timestamp < b.timestamp) {
                return -1;
            }
            if (a.timestamp > b.timestamp) {
                return 1;
            }
            if (a.timestamp === b.timestamp) {
                return 0;
            }
        }).toList();
        const hours = Math.abs(moment(visit.started_date).diff(new Date(), 'hours'));
        let photosCount = photos.count();

        if (isLast !== true && photosCount === 0) {
            return (
                <View style={styles.emptyPhotoContainer}>
                    <View style={styles.delimiter}/>
                    <View style={styles.emptyPhotoImageArea}>
                        <Image style={styles.emptyPhotoImage} source={foodImage}/>
                    </View>
                    <Text style={styles.emptyPhotoTitle}>{I18n.t('photo.expiredVisit')}</Text>
                    <Text style={styles.emptyPhotoDescription}>{I18n.t('photo.noPhotoExpiredVisit')}</Text>
                </View>
            )
        }

        if (photosCount === 0) {
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

        const imageBlocks = [];


        for (const image of photos) {
            const index = photos.findIndex(photo => photo.uri === image.uri);
            const progressData = this.props.loadedProgress.get(image.uri);
            const loaded = (progressData) ? progressData.loaded : null;
            const total = (progressData) ? progressData.total : null;
            const count = photos.count();
            imageBlocks.push(
                <ImageView style={styles.imageView} key={image.uri} photo={image}
                           loaded={loaded} total={total}
                           onPress={() => this.goToPreview(image.uri, photos, index, count, image.id)}/>
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

    backHandler = () => {
        setTimeout(() => {
            this.setState({showBtn: true})
        }, 1500);
    };

    goToPhoto = async (id) => {

        const perm = await Permissions.request('camera');
        if (perm === "denied") {
            return alert(I18n.t("photo.allowAccess"));
        }
        if (allowAction("goToPhoto")) {
            this.setState({showBtn: false}, () => {
                this.props.goToPhoto(id, this.backHandler);
            })
        }
    };

    editRoute = () => {

        if (Platform.OS === "ios") {
            AlertIOS.prompt(
                I18n.t("alerts.changeRoute"),
                null,
                text => {
                    const {id} = this.props.navigation.state.params;
                    this.props.changeRoute(id, text);
                }
            );
        } else {
            const dialog = new DialogAndroid();
            dialog.set({
                title: I18n.t("alerts.changeRoute"),
                input: {
                    callback: (routeId) => {
                        const {id} = this.props.navigation.state.params;
                        this.props.changeRoute(id, routeId);
                    }
                },
                allowEmptyInput: false,
                positiveText: I18n.t("alerts.change"),
                negativeText: I18n.t("alerts.cancel"),
            });
            dialog.show();
        }

    };

    renderPhotoInfo() {
        const {sync, offline} = this.props;
        const {id} = this.props.navigation.state.params;
        const photos = this.props.photos.filter(photo => {
            return photo.visit === id || photo.tmpId === id || sync[photo.visit] === id;
        }).sort((a, b) => {
            if (a.timestamp < b.timestamp) {
                return -1;
            }
            if (a.timestamp > b.timestamp) {
                return 1;
            }
            if (a.timestamp === b.timestamp) {
                return 0;
            }
        }).toList();

        return (
            <View>
                <Text>{`id = ${id}`}</Text>
                <Text>{`offline = ${JSON.stringify(offline)}`}</Text>
                <Text>{`sync = ${JSON.stringify(sync)}`}</Text>
                <Text>{`sync id = ${sync[id]}`}</Text>
                <Text>{`photos count = ${photos.count()}`}</Text>
                <Text>{`photos array = ${JSON.stringify(photos.toArray())}`}</Text>
            </View>
        )
    }

    goToFeedback = () => {
        if (allowAction("goToFeedback")) {
            const {id} = this.props.navigation.state.params;
            this.props.goToFeedback(id);
        }
    };

    renderFeedbackButton() {
        return (
            <TouchableOpacity style={styles.feedbackButton} onPress={this.goToFeedback}>
                <Text style={styles.feedbackText}>{I18n.t('visitDetail.feedback')}</Text>
            </TouchableOpacity>
        )
    }

    render() {
        const {id} = this.props.navigation.state.params;
        const visit = this.props.visits[id] || this.props.visits[this.props.sync[id]];
        const {photos, sync, lastCreatedId} = this.props;

        if (!visit) {
            return null
        }

        const needPhotoSync = photos.find(photo => {
            return (
                (photo.visit === id || photo.tmpId === id || sync[photo.visit]) &&
                (photo.isUploaded === false || photo.isUploading === true))
        });

        const sync_icon = (visit.tmp || needPhotoSync) ? unsyncIcon : syncIcon;
        const shopId = (visit.shop !== null) ? visit.shop : '- - -';
        const route = visit.current_agent_route;
        const task = this.props.tasks.find(task => task.id === visit.task);
        const taskName = (task) ? task.name : "";

        let isLast = false;
        if (lastCreatedId === id) {
            isLast = true;
        } else if (id === sync[lastCreatedId]) {
            isLast = true;
        }

        const _photos = this.props.photos.filter(photo => photo.visit === id || photo.tmpId === id || sync[photo.visit]).toList();
        let photosCount = _photos.count();

        if (visit && visit.images) {
            photosCount += visit.images.length;
        }

        this.id = id;

        const time = (visit.started_date) ? visit.started_date : visit.local_date;

        return (
            <View style={{flex: 1}}>
                {isLast && this.state.showBtn ?
                    <GradientButton icon={cameraIcon} style={styles.takePhotoBtn} text={I18n.t('photo.makePhoto')}
                                    onPress={() => this.goToPhoto(id)}/> : null}
                <ScrollView style={styles.container}>
                    <View style={{paddingVertical: 16}}>
                        <View style={styles.pd16}>
                            <View style={styles.row}>
                                <Text
                                    style={styles.dateColor}>{this.moment(time).format('D MMMM, HH:mm')}</Text>
                                <TouchableOpacity onPress={() => this.goToSync(id)}>
                                    <Image source={sync_icon}/>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.taskName}>{taskName}</Text>
                            {this.renderShopDetail(visit)}
                            <View style={styles.updateRow}>
                                <Text style={styles.titleValue}>{`${I18n.t("visitDetail.shopId")}: `}</Text>
                                <Text style={styles.value}>{shopId}</Text>
                            </View>
                            <View style={styles.updateRow}>
                                <Text style={styles.titleValue}>{`${I18n.t("visitDetail.pathId")}: `}</Text>
                                <Text style={styles.value}>{route}</Text>
                                <TouchableOpacity style={styles.updateArea}
                                                  hitSlop={{top: 30, left: 30, bottom: 30, right: 30}}
                                                  onPress={this.editRoute}>
                                    <Image source={editIcon}/>
                                </TouchableOpacity>
                            </View>
                            {(photosCount > 0 && !visit.tmp) && this.renderResultsBlock(visit.results, visit.id)}
                            {(photosCount > 0 && !visit.tmp) && this.renderModerationBlock(visit.moderation)}
                        </View>
                        {/*this.renderPhotoInfo()*/}
                        {this.renderPhotoArea(visit, isLast)}
                        {this.renderFeedbackAnswer(visit.helpdesk)}
                        {this.renderFeedbackButton()}
                        {isLast && this.state.showBtn ?
                            <View style={{flex: 1, height: 80}}/> : null}
                    </View>
                </ScrollView>
            </View>
        )
    }

}

const mapStateToProps = (state) => {
    const {nav, visitDetails, photo, visits, tasks} = state;
    return {
        nav: nav,
        isFetch: visitDetails.isFetch,
        visits: visits.entities.visit,
        offline: visits.entities.offline,
        result: visits.result,
        photos: photo.photos,
        sync: visits.sync,
        lastCreatedId: visits.lastCreatedId,
        detail: visitDetails.visit,
        tasks: tasks.list,
        needSync: photo.needSync || visits.needSync,
        loadedProgress: photo.loadedProgress
    }
};

export default connect(mapStateToProps, {
    goToPhoto,
    goToFeedback,
    backTo,
    clearVisitDetails,
    gotToPhotoView,
    changeRoute
})(VisitDetailScene)

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
    taskName: {
        marginTop: 16,
        fontSize: 24,
        fontWeight: "bold",
        fontStyle: "normal",
        letterSpacing: 0,
        color: "#000000"
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
    topRow: {
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center"
    },
    icon: {
        width: 40,
        height: 40,
        marginRight: 10,
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
        paddingRight: 16,
        fontSize: 15,
        fontWeight: "normal",
        color: "#808080"
    },
    title: {
        fontSize: 16,
        fontWeight: "500",
        fontStyle: "normal",
        color: "#000000"
    },
    shopPositionRow: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    addressText: {color: '#b4b4b4', marginLeft: 5},
    updateRow: {
        flexDirection: 'row',
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 15,
    },
    updateText: {
        color: "blue"
    },
    updateArea: {
        paddingHorizontal: 15
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    titleValue: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'grey',
    },
    delimiter: {
        marginVertical: 20,
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderColor: '#d8d8d8'
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        fontStyle: 'normal',
        color: '#000000'
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
        flex: 1,
        marginTop: 19,
        borderRadius: 4,
        //backgroundColor: '#f5f5f7',
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
        fontSize: 12,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000',
        textAlign: "right"
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
        color: '#000',
    },
    imageView: {
        marginTop: 10
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
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: "space-around",
        flexWrap: 'wrap'
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
    feedbackButton: {
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: "#cfcfcf",
        marginTop: 20,
        marginHorizontal: 16,
        justifyContent: "center"
    },
    feedbackText: {
        fontSize: 16,
        fontWeight: "600",
        fontStyle: "normal",
        letterSpacing: 0,
        textAlign: "center",
        color: "#b4b4b4"
    },
    empty: {flex: 1, justifyContent: 'center', alignItems: 'center'}
});