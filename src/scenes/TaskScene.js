import React, { Component } from 'react';
import { taskNavigationOptions } from "../navigators/options";
import { FlatList, Text, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import I18n from 'react-native-i18n'
import { connect } from "react-redux";
import { addIcon } from "../utils/images";
import GradientButton from "../component/GradientButton";
import HTMLView from 'react-native-htmlview';

class TaskScene extends Component {
    static navigationOptions = ({navigation}) => taskNavigationOptions(navigation);

    constructor() {
        super();
    }

    goToCreateVisit = () => {
        this.props.navigation.navigate("CreateVisit", {
            taskId: this.props.navigation.state.params.id
        });
    };

    renderNewVisit() {
        return <GradientButton icon={addIcon} style={styles.newVisitBtn} text={I18n.t("visits_list.newVisit")}
                               onPress={this.goToCreateVisit}/>
    }

    render() {
        const id = this.props.navigation.state.params.id;
        const item = this.props.list.find(obj => obj.id === id);
        return (
            <View style={{flex: 1}}>
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
        list: state.tasks.list
    }
}

export default connect(mapStateToProps)(TaskScene);

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
});