import {Component} from "react";
import {feedbackCategoriesNavigationOptions} from "../navigators/options";
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React from "react";
import connect from "react-redux/es/connect/connect";
import {goToFeedback} from "../actions/navigation";
import {arrowRight} from "../utils/images";

class FeedbackCategoriesScene extends Component {

    static navigationOptions = ({navigation}) => feedbackCategoriesNavigationOptions(navigation);

    constructor() {
        super()
    }

    goToFeedback(category) {
        const visitId = this.props.navigation.getParam("id");
        this.props.goToFeedback(visitId, category);
    };

    render() {
        return (
            <ScrollView style={{flex: 1, backgroundColor: "white"}}>
                <TouchableOpacity style={styles.item} onPress={() => this.goToFeedback("SKU_ERROR")}>
                    <Text style={styles.text}>Неправильно определены товары</Text>
                    <Image source={arrowRight}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.item} onPress={() => this.goToFeedback("PRICE_ERROR")}>
                    <Text style={styles.text}>Неправильно определены цены</Text>
                    <Image source={arrowRight}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.item} onPress={() => this.goToFeedback("KPI_ERROR")}>
                    <Text style={styles.text}>Неправильно подсчитаны показатели</Text>
                    <Image source={arrowRight}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.item} onPress={() => this.goToFeedback("REPORT_ERROR")}>
                    <Text style={styles.text}>Нет визита в отчетах </Text>
                    <Image source={arrowRight}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.item} onPress={() => this.goToFeedback("APP_ERROR")}>
                    <Text style={styles.text}>Сбой в работе приложения</Text>
                    <Image source={arrowRight}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.item} onPress={() => this.goToFeedback("OTHER")}>
                    <Text style={styles.text}>Другое</Text>
                    <Image source={arrowRight}/>
                </TouchableOpacity>
            </ScrollView>
        )
    }

}

const styles = StyleSheet.create({
    item: {
        height: 60,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: "#bcbbc1"
    },
    text: {
        fontSize: 17,
        lineHeight: 22,
        letterSpacing: -0.41,
        color: "#000000"
    }
});

export default connect(null, {
    goToFeedback
})(FeedbackCategoriesScene)