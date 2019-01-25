import React, {Component} from 'react';
import {syncNavigationOptions} from "../navigators/options";
import {ScrollView, Text, View, StyleSheet} from "react-native";
import {connect} from "react-redux";
import {basename} from 'react-native-path';
import moment from "moment";
import {Map} from "immutable";

class SyncScene extends Component {
    static navigationOptions = ({navigation}) => syncNavigationOptions(navigation);

    constructor() {
        super();
    }

    visitTask = (visit) => {
        const {syncVisitId, syncVisitError} = this.props;
        const title = (visit.tmp === true) ? "Синхронизация визита" : "Визит в очереди";
        return (
            <View style={styles.taskView} key={visit.local_date}>
                <Text style={styles.infoText}>{"Отчёт"}</Text>
                <Text style={styles.infoText}>{`ID отчёта: ${visit.id}`}</Text>
                <Text style={styles.infoText}>{`Дата добавления: ${moment(visit.local_date).toString()}`}</Text>
                <Text style={styles.infoText}>{`Данные: ${JSON.stringify(visit.data)}`}</Text>
                {(syncVisitError && visit.id === syncVisitId) ?
                    <Text style={styles.errorText}>{`Ошибка: ${syncVisitError}`}</Text> : null}
            </View>
        )
    };

    photoTask = (image) => {
        const title = (image.isUploading === true) ? "Синхронизация фото" : "Фото в очереди";
        if (image === undefined) {
            return null;
        }
        return (
            <View style={styles.taskView} key={image.timestamp}>
                <Text style={styles.infoText}>{"Фото"}</Text>
                <Text style={styles.infoText}>{`ID отчёта: ${image.visit}`}</Text>
                <Text style={styles.infoText}>{`Файл: ${basename(image.uri)}`}</Text>
                <Text style={styles.infoText}>{`Дата добавления: ${moment(image.timestamp).toString()}`}</Text>
            </View>
        )
    };

    render() {
        const {id} = this.props.navigation.state.params;
        const {photos, entities, syncVisit, syncPhoto} = this.props;
        const tasks = [];

        const offline = Map(entities.offline);
        for (const [, visit] of offline) {
            tasks.push(this.visitTask(visit));
        }

        let _photos = photos.filter(photo => photo.isUploaded === false);
        _photos = _photos.sort((a, b) => {
            if (a.timestamp < b.timestamp) {
                return -1;
            }
            if (a.timestamp > b.timestamp) {
                return 1;
            }
            if (a.timestamp === b.timestamp) {
                return 0;
            }
        });

        for (const [, task] of _photos) {
            tasks.push(this.photoTask(task));
        }

        let currentState = "Ожидание синхронизации";
        if (syncVisit === true) {
            currentState = "Синхронизация отчёта"
        }
        if (syncPhoto === true) {
            currentState = "Синхронизация фото"
        }

        return (
            <View style={{flex: 1, backgroundColor: "white"}}>
                <ScrollView style={{flex: 1}}>
                    <View style={{flexDirection: "row", alignItems: "center", padding: 5}}>
                        <Text style={styles.stateTitle}>Текущее состояние:</Text>
                        <Text style={styles.state}>{currentState}</Text>
                    </View>
                    <View style={{flexDirection: "row", alignItems: "center", padding: 5}}>
                        <Text style={styles.stateTitle}>Очередь</Text>
                    </View>
                    {tasks}
                </ScrollView>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        photos: state.photo.photos,
        sync: state.visits.sync,
        entities: state.visits.entities,
        syncVisitId: state.visits.syncVisitId,
        syncVisitError: state.visits.syncVisitError,
        syncVisit: state.visits.syncProcess,
        syncPhoto: state.photo.syncProcess
    }
};

export default connect(mapStateToProps)(SyncScene);

const styles = StyleSheet.create({
    taskView: {
        borderTopWidth: 0.5,
        borderTopColor: "#DDD",
        borderBottomWidth: 0.5,
        borderBottomColor: "#DDD",
        padding: 5
    },
    infoText: {
        fontSize: 11
    },
    stateTitle: {
        fontWeight: "bold"
    },
    state: {
        fontSize: 11,
        marginLeft: 5
    },
    errorText: {
        fontSize: 11,
        color: "#c40010"
    }
});