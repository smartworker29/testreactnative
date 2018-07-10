import React, {Component, Fragment} from 'react'
import HTMLView from "react-native-htmlview/HTMLView";
import {Image, Text, View, StyleSheet} from 'react-native';
import {CachedImage} from "react-native-img-cache";
import {triangleUp} from "./images";

export default class ComponentParser {

    static cache = new Map();

    static parse(string) {
        if (ComponentParser.cache.has(string)) {
            return ComponentParser.cache.get(string);
        }
        try {
            const array = JSON.parse(string);
            const components = [];
            for (const [key, item] of Object.entries(array)) {
                components.push(ComponentParser.selectComponent(item, key));
            }
            ComponentParser.cache.set(string, components);
            return components;
        } catch (err) {
            console.log(err);
            return (
                <View>
                    <Text style={styles.error}>Ошибка преобразования JSON</Text>
                    <Text>{err.message}</Text>
                </View>
            )
        }
    }

    static selectComponent(component, key) {

        switch (component.type) {
            case "text":
                return ComponentParser.renderText(component.data, `${component.type}_${key}`, key);
            case "image":
                return ComponentParser.renderImages(component.data, `${component.type}_${key}`, key);
            case "kpi":
                return ComponentParser.renderKpi(component.data, `${component.type}_${key}`, key);
            default:
                return null;
        }
    }

    static renderKpi(data, key, index) {
        const rows = [];
        let group = [];

        let index_cell = 0;
        let index_row = 0;
        while (data.length > 0) {
            const kpi = data.shift();
            const style = (index_cell % 2 === 0) ? {marginRight: -1} : null;
            const direct = (kpi.value > kpi.target_value) ? ">" : "<";
            group.push(
                <View key={`kpi_cell_${index_cell}`} style={[styles.kpiCell, style]}>

                    <Text style={styles.cellTitle}>{kpi.label}</Text>
                    <View style={{flexDirection: "row", alignItems: "flex-end"}}>
                        <Text style={[styles.cellMainValue, {color: kpi.color}]}>{kpi.value}<Text
                            style={styles.cellPercent}>{` ${kpi.unit}`}</Text></Text>
                        {(kpi.target_value) ?
                            <Text style={styles.targetRow}>{`${direct} ${kpi.target_value}`}</Text> : null}
                    </View>
                    <View style={{flexDirection: "row"}}>
                        <Image source={triangleUp} style={[styles.directionImage, {tintColor: kpi.change_color}]}/>
                        <Text style={[styles.cellSecondValue, {color: kpi.change_color}]}>{kpi.change_value}
                            <Text>{` ${kpi.unit}`}</Text>
                        </Text>
                    </View>
                </View>
            );

            if (group.length === 2 || data.length === 0) {
                const style = (index_row > 0) ? {flexDirection: "row", marginTop: -1} : {flexDirection: "row"};
                rows.push(
                    <View key={`kpi_row_${index_row}`} style={style}>
                        {group}
                    </View>
                );
                group = [];
                index_row = index_row + 1;
            }

            index_cell = index_cell + 1;
        }
        return (
            <View key={key} style={{alignItems: "center", marginTop: 20}}>
                <View>{rows}</View>
            </View>
        );
    }

    static renderImages(images, key, index) {
        const array = [];
        for (const [key, img] of Object.entries(images)) {
            array.push(
                <View style={{alignItems: "center", marginTop: 20}} key={`${key}_${img.url}`}>
                    <CachedImage key={img.url}
                                 source={{uri: img.url}}
                                 style={{width: "100%", height: 300}} resizeMode="contain"/>
                    <Text style={styles.imageLabel}>{img.label}</Text>
                </View>
            )
        }
        return (
            <View key={key}>
                {array}
            </View>
        )
    }

    static renderText(value, key) {
        return <HTMLView value={value} key={key} style={{marginTop: 20}}/>
    }
}

const styles = StyleSheet.create({
    imageLabel: {
        fontWeight: "bold",
        marginTop: 5,
        marginBottom: 10
    },
    error: {
        color: "red",
        fontWeight: "bold"
    },
    kpiCell: {
        borderWidth: 1,
        borderColor: "#e5e5e5",
        width: 150,
        height: 150,
        paddingLeft: 15
    },
    cellTitle: {
        marginTop: 20,
        fontSize: 11,
        fontWeight: "bold",
        fontStyle: "normal",
        letterSpacing: 0,
        color: "#000000"
    },
    cellMainValue: {
        fontSize: 24,
        fontWeight: "600",
        fontStyle: "normal",
        letterSpacing: 0,
        marginTop: 10
    },
    cellSecondValue: {
        fontSize: 14,
        marginTop: 3,
        fontWeight: "500",
        fontStyle: "normal",
        letterSpacing: 0,
        color: "#58c02f"
    },
    targetRow: {
        fontSize: 17,
        marginBottom: 3,
        marginLeft: 5
    },
    directionImage: {
        marginLeft: -5
    },
    cellPercent: {
        fontSize: 17,
        fontWeight: "600",
        fontStyle: "normal",
        letterSpacing: 0
    }
});