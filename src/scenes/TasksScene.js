import React, { Component } from 'react';
import { tasksNavigationOptions } from "../navigators/options";
import { FlatList, Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import I18n from 'react-native-i18n'
import { connect } from "react-redux";
import { tasksImage } from "../utils/images";

class TasksScene extends Component {
    static navigationOptions = ({navigation}) => tasksNavigationOptions(navigation);

    constructor() {
        super();
    }

    renderItem(item) {
        return (
            <TouchableOpacity style={styles.item} onPress={() => this.goToTask(item.id)}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.description}>{item.short_description}</Text>
            </TouchableOpacity>
        )
    }

    goToTask = (id) => {
        this.props.navigation.navigate("Task", {
            id
        });
    };

    render() {
        if (this.props.list.count() === 0) {
            return (
                <View style={styles.empty}>
                    <Image source={tasksImage}/>
                    <Text style={styles.emptyTitle}>{I18n.t("tasks.emptyTitle")}</Text>
                    <Text style={styles.emptyDetail}>{I18n.t("tasks.emptyDescription")}</Text>
                </View>
            )
        }
        return (
            <View style={{flex: 1}}>
                <FlatList
                    data={this.props.list.toArray()}
                    ListHeaderComponent={() => <View style={{height: 8}}/>}
                    renderItem={({item}) => this.renderItem(item)}
                    keyExtractor={item => String(item.id)}
                    ListEmptyComponent={() => <View/>}
                />
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        list: state.tasks.list
    }
}

export default connect(mapStateToProps)(TasksScene);

const styles = StyleSheet.create({
    item: {
        //fontFamily: "SFUIDisplay-Regular",
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
        fontFamily: "SFUIDisplay-Medium",
        fontSize: 17,
        fontWeight: "bold",
        color: "#000000"
    },
    description: {
        //fontFamily: "SFUIDisplay-Regular",
        marginTop: 8,
        fontSize: 15,
        fontWeight: "normal",
        color: "#b4b4b4"
    },
    empty: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyTitle: {
        //fontFamily: "SFUIDisplay-Regular",
        marginTop: 31,
        fontSize: 22,
        fontWeight: "500",
        fontStyle: "normal",
        letterSpacing: 0,
        textAlign: "center",
        color: "#000000"
    },
    emptyDetail: {
        //fontFamily: "SFUIDisplay-Regular",
        marginTop: 15,
        width: 260,
        fontSize: 16,
        fontWeight: "normal",
        fontStyle: "normal",
        letterSpacing: 0,
        textAlign: "center",
        color: "#9b9b9b"
    },
});