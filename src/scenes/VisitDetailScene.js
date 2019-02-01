import React, {Component, Fragment} from 'react'
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Platform,
    AlertIOS,
    InteractionManager, ActivityIndicator, Modal, Clipboard,
    Button, Dimensions
} from 'react-native'
import {connect} from 'react-redux'
import {
    goToPhoto,
    backTo,
    gotToPhotoView,
    goToFeedback,
    goToFeedbackCategories,
    goToQuestionnaire
} from '../actions/navigation'
import {
    addReasonForSync,
    changeRoute,
    clearVisitDetails,
    getVisitDetails,
    getVisitPosition,
    sendReason
} from '../actions/visitDetails'
import I18n from 'react-native-i18n'
import ImageView from '../component/ImageView'
import {visitNavigationOptions} from '../navigators/options'
import {
    badIcon,
    cameraIcon, conversation,
    dislikeIcon,
    editIcon,
    foodImage,
    goodIcon,
    likeIcon,
    magnitLogo,
    pinIcon,
    syncIcon,
    timeIcon, triangleDown,
    unknownIcon,
    unsyncIcon
} from '../utils/images'
import GradientButton from '../component/GradientButton'
import moment from 'moment'
import _ from "lodash"
import ru from "moment/locale/ru";
import {allowAction, copyToClipboard, getPhotoFromVisit} from "../utils/util";
import Permissions from 'react-native-permissions';
import DialogAndroid from 'react-native-dialogs';
import HTMLView from 'react-native-htmlview';
import {CachedImage} from "react-native-img-cache";
import ComponentParser from "../utils/ComponentParser";
import DeviceInfo from "react-native-device-info";
import RNPickerSelect from "react-native-picker-select";
import EventEmitter from "react-native-eventemitter";
import {List, Set} from "immutable";

let {height, width} = Dimensions.get('window');

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
            showBtn: true,
            afterTransition: false,
            showPicture: false,
            pictureUrl: null,
            pictureLoading: false
        }
    }

    componentWillUnmount() {
        EventEmitter.emit("updateTasksTime");
        this.timer && clearInterval(this.timer);
        this.timeoutBackHandler && clearTimeout(this.timeoutBackHandler);
    }

    componentWillMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({afterTransition: true})
        });

        const id = this.props.navigation.getParam("id");
        const pos = this.props.getVisitPosition(id);
        if (pos > 30) {
            this.props.getVisitDetails(id);
        }
    }

    componentDidMount() {
        const {openCamera, id} = this.props.navigation.state.params;
        if (openCamera === true) {
            this.goToPhoto(id).then().catch(console.log);
        }
        ComponentParser.sendReason = this.props.sendReason;
        ComponentParser.addReasonForSync = this.props.addReasonForSync;
    }

    renderShopDetail(visit) {
        if (!visit || !visit.shop_name || !visit.shop_area) {
            return null
        }

        const logo = (visit && visit.gps_shop) ? visit.gps_shop.logo : null;

        return (
            <View style={styles.topRow}>
                {(logo) ? <CachedImage style={styles.icon} source={{uri: logo}} resizeMode="contain"/> : null}
                <View style={{flex: 1, justifyContent: "center"}}>
                    <View style={styles.rowTitleFavorite}>
                        <Text style={styles.title}>{visit.shop_name}</Text>
                    </View>
                    {/*<View style={styles.location}>
                        <Image source={pinIcon} style={styles.pinIcon}/>
                        <Text style={styles.description}>{visit.shop_area}</Text>
                    </View>*/}
                </View>
            </View>
        );
    }

    renderQuestionnaire(task, visitUuid) {
        if (!task || !task.question_group) {
            return null;
        }

        if (_.isArray(task.question_group) && task.question_group.length === 0 || visitUuid === undefined) {
            return null
        }

        const questions = this.props.questions.get(visitUuid);
        if (questions === undefined || _.isArray(questions) && questions.length === 0) {
            return (
                <View>
                    <View style={styles.delimiter}/>
                    <Text style={styles.infoTitle}>{I18n.t("questions.questionnaire")}</Text>
                    {this.renderEmptyQuestions()}
                    <TouchableOpacity style={[styles.QuestionnaireButton, {borderColor: "#c40010"}]}
                                      onPress={() => this.goToQuestionnaire(task.question_group, visitUuid)}>
                        <Text
                            style={[styles.QuestionnaireText, {color: "#c40010"}, {borderColor: "#c40010"}]}>{I18n.t("questions.answerButton")}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        const [questionsRender, syncStatuses] = this.renderQuestions(questions, visitUuid);
        const [textColor, borderColor] = syncStatuses.has(null)
        || syncStatuses.has("empty")
        || syncStatuses.has("required") ? [{color: "#c40010"}, {borderColor: "#c40010"}] : [{color: "#cfcfcf"}, {borderColor: "#cfcfcf"}];
        const textStyle = {color: '#c40010'};
        return (
            <View>
                <View style={styles.delimiter}/>
                <Text style={styles.infoTitle}>{I18n.t("questions.questionnaire")}</Text>
                {questionsRender}
                <TouchableOpacity style={[styles.QuestionnaireButton, borderColor]}
                                  onPress={() => this.goToQuestionnaire(task.question_group, visitUuid)}>
                    <Text style={[styles.QuestionnaireText, textColor]}>{I18n.t("questions.answerButton")}</Text>
                </TouchableOpacity>
                {syncStatuses.has(null) &&
                <View style={{flex: 1, alignItems: "center", marginTop: 10}}>
                    <Text style={textStyle}>{I18n.t("questions.saveToServer")}</Text>
                </View>}
                {syncStatuses.has(false) &&
                <View style={styles.rowSync}>
                    <ActivityIndicator style={{marginRight: 10}}/>
                    <Text style={{alignItems: 'center'}}>{I18n.t("questions.savingToServer")}</Text>
                </View>}
            </View>
        )
    }

    renderQuestions(questions, visitUuid) {
        const groups = [];
        let syncStatuses = Set();
        if (questions === undefined) {
            syncStatuses = syncStatuses.add("empty");
            return [this.renderEmptyQuestions(), syncStatuses];
        }
        for (const [group, _questions] of questions) {
            const questions = [];
            for (const [index, question] of List(_questions).entries()) {
                if (!this.props.answers.has(visitUuid + '_' + question)) {
                    if (this.props.questionsRequired.has(question)) {
                        syncStatuses = syncStatuses.add("required");
                    }
                    continue
                }
                const syncStatus = this.props.questionsSync.get(visitUuid + '_' + question);
                syncStatuses = syncStatuses.add(syncStatus);
                const textStyle = syncStatus === null ? {color: '#c40010'} : syncStatus === false ? {color: 'orange'} : {color: 'green'};
                const required = this.props.questionsRequired.has(question);
                const requiredMark = required ? <Text style={stylesQuestions.requireMark}>*</Text> : null;
                questions.push(
                    <View key={question}
                          style={stylesQuestions.answerContainer}>
                        <Text style={textStyle}>{index + 1}.</Text>
                        <View style={{marginLeft: 10}}>
                            <Text
                                style={stylesQuestions.titleQuestion}>{this.props.uuidValues.get(question)} {requiredMark}</Text>
                            {this.renderAnswer(question, visitUuid)}
                        </View>
                    </View>
                )
            }
            if (questions.length > 0) {
                groups.push(
                    <View key={group}>
                        <Text style={stylesQuestions.titleGroup}>{this.props.uuidValues.get(group)}</Text>
                        {questions}
                    </View>
                );
            }
        }

        if (groups.length === 0) {
            return [this.renderEmptyQuestions(), syncStatuses]
        }
        return [groups, syncStatuses];
    }

    renderEmptyQuestions() {
        return (
            <View>
                <View style={styles.conversationImageContainer}>
                    <Image style={styles.conversationImage} source={conversation}/>
                </View>
                <View style={{marginTop: 18, alignItems: "center"}}>
                    <Text style={{textAlign: "center", fontSize: 16}}>
                        {I18n.t("questions.text")}
                    </Text>
                </View>
            </View>
        )
    }

    renderAnswer(questionUUID, visitUuid) {
        const answer = this.props.answers.get(visitUuid + '_' + questionUUID);

        if (!answer) {
            return null
        }
        if (answer.select_one !== undefined) {
            return <Text style={stylesQuestions.answerValue}>{this.props.uuidValues.get(answer.select_one)}</Text>
        }
        if (answer.text !== undefined) {
            return <Text style={stylesQuestions.answerValue}>{answer.text}</Text>
        }
        if (answer.number !== undefined) {
            return <Text style={stylesQuestions.answerValue}>{answer.number}</Text>
        }
        if (answer.bool !== undefined) {
            return <Text style={stylesQuestions.answerValue}>{answer.bool ? "Да" : "Нет"}</Text>
        }
        if (answer.select_multiple !== undefined && _.isArray(answer.select_multiple)) {
            const answers = [];
            for (const _answer of answer.select_multiple) {
                answers.push(<Text key={_answer}
                                   style={stylesQuestions.answerValue}>{this.props.uuidValues.get(_answer)}</Text>)
            }
            return answers
        }
        return null;
    }

    showProductPicture = (url) => {
        if (!url) {
            return;
        }
        this.setState({
            showPicture: true,
            pictureUrl: url
        })
    };

    renderResultsBlock(results, id) {

        if (!results || !this.state.afterTransition) {
            return (
                <View style={styles.result}>
                    <View style={styles.delimiter}/>
                    <Text style={styles.infoTitle}>{I18n.t('visitDetail.visitResult')}</Text>
                </View>
            )
        }

        const {instance} = this.props;
        const date = this.moment(results.created_date).format('D MMMM, HH:mm');
        const data = {
            visitId: id,
            skuReasons: this.props.skuReasons,
            instanceReasons: instance["oos_reason"],
            showProductPicture: this.showProductPicture
        };
        const message = (results.message_type === "MULTIMEDIA") ? ComponentParser.parse(results.message, data) :
            <TouchableOpacity onPress={() => {
                copyToClipboard(results.message)
            }}>
                <HTMLView value={results.message}/>
            </TouchableOpacity>;

        const style = (Platform.OS === "ios") ? {marginTop: 20} : {};
        const lastMessage = (
            <View style={[style, {paddingTop: (Platform.OS === "android") ? 20 : 0}]}>
                {message}
            </View>
        );

        return (
            <View style={styles.result}>
                <View style={styles.delimiter}/>
                <View style={styles.resultRow}>
                    <Text style={styles.infoTitle}>{I18n.t('visitDetail.visitResult')}</Text>
                    <Text style={styles.statusBlockDate}>{date}</Text>
                </View>
                {lastMessage}
            </View>
        )
    }

    renderModerationBlock(moderation) {

        if (!moderation || !this.state.afterTransition) {
            return null;
        }

        let moderationRow = (
            <View style={styles.infoStatusRow}>
                <Image style={styles.statusIcon} source={timeIcon}/>
                <Text style={styles.statusText}>{I18n.t('visits_list.moderation')}</Text>
            </View>
        );

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
            <HTMLView value={moderation.message}/>;

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
                <View style={styles.infoRow}>
                    <Text style={styles.infoTitle}>{I18n.t('feedback.support')}</Text>
                    <Text style={styles.statusDate}>{date}</Text>
                </View>
                <View style={styles.statusBlock}>
                    <HTMLView value={helpdesk.message}/>
                </View>
            </View>
        )
    }

    componentWillReceiveProps(props) {
        const {sync} = this.props;

        if (this.props.sync !== props.sync) {
            this.props.navigation.setParams({sync});
        }
    }

    goToPreview(uri, photos, index, count, photoId, id, photoUUID) {
        if (allowAction("goToPreview")) {
            this.props.navigation.navigate("Preview", {uri, photos, index, count, photoId, id, photoUUID});
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
        const photos = getPhotoFromVisit(id, this.props.photos, sync);
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
        const filteredPhoto = photos.filter(photo => !!photo);
        for (const image of filteredPhoto) {
            const irData = _.find(visit.images, {id: image.id});
            if (irData) {
                image.ir_message = irData.ir_message;
                image.ir_status = irData.ir_status;
            }
            const index = filteredPhoto.findIndex(photo => photo && photo.uri === image.uri);
            const progressData = this.props.loadedProgress.get(image.uri);
            const loaded = (progressData) ? progressData.loaded : null;
            const total = (progressData) ? progressData.total : null;
            const count = photos.count();
            imageBlocks.push(
                <ImageView style={styles.imageView} key={image.uri} photo={image}
                           loaded={loaded} total={total}
                           onPress={() => this.goToPreview(image.uri, photos, index, count, image.id, id, image.uuid)}/>
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
        this.timeoutBackHandler = setTimeout(() => {
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

    getRouteName = (def) => {
        const {instance} = this.props;
        let hasRoute;
        let routeName = def;
        if (instance.agent_fields) {
            hasRoute = _.find(instance.agent_fields, {name: "route"});
        }
        let [lang] = DeviceInfo.getDeviceLocale().split("-");
        if (lang && hasRoute && hasRoute[`label_${lang}`]) {
            routeName = hasRoute[`label_${lang}`]
        }
        return routeName;
    };

    editRoute = () => {
        if (Platform.OS === "ios") {
            AlertIOS.prompt(
                `${I18n.t("alerts.enter")} ${this.getRouteName()}`,
                null,
                text => {
                    const {id} = this.props.navigation.state.params;
                    this.props.changeRoute(id, text);
                }
            );
        } else {
            const dialog = new DialogAndroid();
            dialog.set({
                title: `${I18n.t("alerts.enter")} ${this.getRouteName()}`,
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

    goToFeedback = () => {
        if (allowAction("goToFeedback")) {
            const {id} = this.props.navigation.state.params;
            this.props.goToFeedbackCategories(id);
        }
    };

    goToQuestionnaire = (questions, uuid) => {
        if (allowAction("goToQuestionnaire")) {
            this.props.goToQuestionnaire(questions, uuid);
        }
    };

    renderFeedbackButton() {
        return (
            <View>
                {this.props.feedbackOffline.count() > 0 ? <View style={styles.rowSync}>
                    <ActivityIndicator style={{marginRight: 10}}/>
                    <Text style={{alignItems: 'center'}}>Синхронизация жалоб...</Text>
                </View> : null}
                {this.props.feedbackError !== null ? <View style={styles.rowSync}>
                    <Text style={{
                        alignItems: 'center',
                        color: "#c40010"
                    }}>{JSON.stringify(this.props.feedbackError)}</Text>
                </View> : null}
                <TouchableOpacity style={styles.feedbackButton} onPress={this.goToFeedback}>
                    <Text style={styles.feedbackText}>{I18n.t('visitDetail.feedback')}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        const {id} = this.props.navigation.state.params;
        const visit = this.props.visits[id] || this.props.visits[this.props.sync[id]];
        const {photos, sync, lastCreatedId, instance, routeChangeProcessing} = this.props;

        if (!visit) {
            return null
        }

        let hasRoute = null;
        if (instance.agent_fields) {
            hasRoute = _.find(instance.agent_fields, {name: "route"});
        }

        let [lang] = DeviceInfo.getDeviceLocale().split("-");
        let routeName = I18n.t("visitDetail.pathId");

        if (lang && hasRoute && hasRoute[`label_${lang}`]) {
            routeName = hasRoute[`label_${lang}`]
        }

        const needPhotoSync = photos.find(photo => {
            return (
                photo &&
                (photo.visit === id || photo.tmpId === id || sync[photo.visit]) &&
                (photo.isUploaded === false || photo.isUploading === true)) &&
                photo.isProblem !== true
        });

        const sync_icon = (visit.tmp || needPhotoSync) ? unsyncIcon : syncIcon;
        const shopId = (visit.shop && visit.tmp !== true) ? visit.shop : visit.customer_id;
        const route = visit.current_agent_route;
        const taskName = this.props.taskNames.get(`${visit.shop}_${visit.task}`);

        let isLast = false;
        if (lastCreatedId === id) {
            isLast = true;
        } else if (id === sync[lastCreatedId]) {
            isLast = true;
        }

        const hourDiff = moment().diff(moment(visit.started_date), "hours");
        let allowPhotoByHours = hourDiff < 24;

        if (visit && visit.gps_shop) {
            if (String(visit.gps_shop.customer_id) !== String(this.props.lastCustomer)) {
                allowPhotoByHours = false;
            }
        } else {
            if (String(visit.shop) !== String(this.props.lastCustomer)) {
                allowPhotoByHours = false;
            }
        }

        const _photos = this.props.photos.filter(photo => photo && (photo.visit === id || photo.tmpId === id || sync[photo.visit])).toList();
        let photosCount = _photos.count();

        if (visit && visit.images) {
            photosCount += visit.images.length;
        }

        let taskQuestions = null;
        if (visit.task) {
            taskQuestions = this.props.tasks.find(task => task && parseInt(task.id) === parseInt(visit.task)) || null
        }

        this.id = id;
        const time = (visit.started_date) ? visit.started_date : visit.local_date;

        const routeValue = !routeChangeProcessing ? <Text style={styles.value}>{route}</Text> :
            <ActivityIndicator/>;
        let modalWidth = width * 80 / 100;
        if (modalWidth > 300) {
            modalWidth = 300;
        }

        return (
            <View style={{flex: 1}}>
                <Modal visible={this.props.reasonSending} animationType="fade"
                       onRequestClose={() => {
                       }}
                       transparent={true}>
                    <View style={styles.alertArea}>
                        <View style={styles.alertWindow} elevate={5}>
                            <View style={{alignItems: "center"}}>
                                <Text style={styles.requestText}>{"Оправка причины отсуствия"}</Text>
                                <ActivityIndicator size="small"/>
                            </View>
                        </View>
                    </View>
                </Modal>
                <Modal visible={this.state.showPicture}
                       animationType="fade"
                       onRequestClose={() => {
                       }}
                       transparent={true}>
                    <View style={styles.alertArea}>
                        <View style={styles.pictureWindow} elevate={5}>
                            {this.state.pictureLoading ?
                                <ActivityIndicator style={{position: "absolute"}} size="large"/> : null}
                            <Image source={{uri: this.state.pictureUrl}} style={{width: modalWidth, height: 300}}
                                   resizeMode="contain" onLoadEnd={() => this.setState({pictureLoading: false})}
                                   onLoadStart={() => this.setState({pictureLoading: true})}/>
                            <View style={{marginTop: 30}}>
                                <Button
                                    onPress={() => this.setState({showPicture: false})}
                                    style={{width: "100%", height: 20}}
                                    title="Закрыть"
                                    color="rgb(0,122,255)"/>
                            </View>
                        </View>
                    </View>
                </Modal>
                {allowPhotoByHours && this.state.showBtn ?
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
                            {hasRoute ?
                                <View style={styles.updateRow}>
                                    <Text style={styles.titleValue}>{`${routeName}: `}</Text>
                                    {routeValue}
                                    {!routeChangeProcessing ?
                                        <TouchableOpacity style={styles.updateArea}
                                                          hitSlop={{top: 30, left: 30, bottom: 30, right: 30}}
                                                          onPress={this.editRoute}>
                                            <Image source={editIcon}/>
                                        </TouchableOpacity> : null}
                                </View> : null}
                            {(photosCount > 0 && !visit.tmp) && this.renderResultsBlock(visit.results, visit.id)}
                            {this.renderQuestionnaire(taskQuestions, visit.uuid)}
                            {(photosCount > 0 && !visit.tmp) && this.renderModerationBlock(visit.moderation)}
                        </View>
                        {this.renderPhotoArea(visit, isLast)}
                        {this.renderFeedbackAnswer(visit.helpdesk)}
                        {this.renderFeedbackButton()}
                        {allowPhotoByHours && this.state.showBtn ?
                            <View style={{flex: 1, height: 80}}/> : null}
                    </View>
                </ScrollView>
            </View>
        )
    }

}

const mapStateToProps = (state) => {
    const {nav, visitDetails, photo, visits, tasks, shops, auth, questions} = state;
    return {
        nav: nav,
        isFetch: visitDetails.isFetch,
        visits: visits.entities.visit,
        offline: visits.entities.offline,
        photos: photo.photos,
        sync: visits.sync,
        lastCreatedId: visits.lastCreatedId,
        detail: visitDetails.visit,
        routeChangeProcessing: visitDetails.routeChangeProcessing,
        taskNames: tasks.taskNames,
        tasks: state.tasks.list,
        needSync: photo.needSync || visits.needSync,
        loadedProgress: photo.loadedProgress,
        instance: auth.instance,
        reasonSending: visitDetails.reasonSending,
        skuReasons: visitDetails.skuReasons,
        lastCustomer: shops.lastCustomer,
        questions: questions.questions,
        answers: questions.answers,
        uuidValues: questions.uuidValues,
        questionsSync: questions.sync,
        questionsRequired: questions.required,
        feedbackOffline: visits.feedbackOffline,
        feedbackError: visits.feedbackError,
    }
};

export default connect(mapStateToProps, {
    goToPhoto,
    goToFeedbackCategories,
    goToQuestionnaire,
    backTo,
    clearVisitDetails,
    gotToPhotoView,
    changeRoute,
    getVisitDetails,
    getVisitPosition,
    sendReason,
    addReasonForSync
})(VisitDetailScene)

const stylesQuestions = StyleSheet.create({
    titleGroup: {
        color: "black",
        fontSize: 15,
        marginTop: 24,
        fontWeight: "bold",
    },
    answerContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        marginTop: 10
    },
    answerValue: {
        marginTop: 5,
        fontSize: 14,
        color: "black",
        fontWeight: "bold",
    },
    titleQuestion: {
        color: "black",
        fontSize: 14,
    },
    requireMark: {
        color: "#c40010"
    },
});

const styles = StyleSheet.create({
    rowSync: {
        flex: 1,
        alignItems: "center",
        marginTop: 15,
        flexDirection: "row",
        justifyContent: 'center'
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
    pictureWindow: {
        alignItems: "center",
        borderRadius: 5,
        padding: 10,
        paddingTop: 30,
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
    },
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
    delimiterMini: {
        marginVertical: 10,
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderColor: '#d8d8d8'
    },
    infoRow: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
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
        marginTop: 19,
    },
    statusBlockComment: {
        opacity: 0.6,
        fontSize: 12,
        marginBottom: 10,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000'
    },
    statusDate: {
        opacity: 0.6,
        fontSize: 12,
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
    resultRow: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
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
    conversationImageContainer: {
        marginTop: 10,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    conversationImage: {
        width: 56,
        height: 56
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
    QuestionnaireButton: {
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        marginTop: 20,
        justifyContent: "center"
    },
    QuestionnaireText: {
        fontSize: 16,
        fontWeight: "600",
        fontStyle: "normal",
        letterSpacing: 0,
        textAlign: "center"
    },
    empty: {flex: 1, justifyContent: 'center', alignItems: 'center'}
});