import React, {Component, Fragment} from 'react'
import HTMLView from "react-native-htmlview/HTMLView";
import {Image, Text, View, StyleSheet, Dimensions, TouchableOpacity, Platform} from 'react-native';
import {CachedImage} from "react-native-img-cache";
import {triangleDown, triangleUp} from "./images";
import ImageZoom from 'react-native-image-pan-zoom'
import PhotoView from 'react-native-photo-view';
import Swiper from "react-native-swiper";
import RNPickerSelect from "react-native-picker-select";
import {copyToClipboard} from "./util";

const {height, width} = Dimensions.get('window');

export default class ComponentParser {

    static cache = new Map();
    static dispatch;
    static sendReason;

    static parse(string, info) {
        try {
            const array = JSON.parse(string);
            const components = [];
            for (const [key, item] of Object.entries(array)) {
                components.push(ComponentParser.selectComponent(item, key, info));
            }
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

    static selectComponent(component, key, info) {

        switch (component.type) {
            case "text":
                return ComponentParser.renderText(component.data, `${component.type}_${key}`, key);
            case "image":
                return ComponentParser.renderImages(component.data, `${component.type}_${key}`, key);
            case "kpi":
                return ComponentParser.renderKpi(component.data, `${component.type}_${key}`, key);
            case "sku_list":
                return ComponentParser.renderSku(component, `${component.type}_${key}`, key, info);
            default:
                return null;
        }
    }

    static renderSku(component, key, index, info) {
        const items = [];
        let _index = 0;
        for (const item of component.data) {
            const isNotPresent = item.present === false || item.present === "false" || item.present === undefined;
            let color = {};
            if (item.present === true || item.present === "true") {
                color = {color: "#58c02f"}
            } else if (isNotPresent) {
                color = {color: "#c40010"}
            }
            let _value = false;
            const reasons = [];
            if (info.instanceReasons) {
                if (Platform.OS === "android") {
                    reasons.push({
                        label: "Выберите причину отсутствия:",
                        value: false
                    });
                }
                for (const reason of info.instanceReasons) {
                    reasons.push({label: reason, value: reason})
                }
                _value = reasons[0].value;
            } else {
                reasons.push({label: "Нет вариантов для выбора", value: false, color: "#c40010"})
            }
            const skuKey = `${info.visitId}_${component.component}_${item.gid}`;
            const _reason = info.skuReasons.has(skuKey) ? info.skuReasons.get(skuKey) : "Выберите причину отсутствия";
            items.push(
                <View
                    style={[styleSkuList.margin, {marginTop: _index > 0 ? 5 : 0}]}
                    key={item.gid}>
                    <View style={styleSkuList.container}>
                        <TouchableOpacity onPress={() => info.showProductPicture(item.image_url)}>
                            <Text style={[{fontWeight: "bold"}, color]}>{item.name}</Text>
                        </TouchableOpacity>
                        {item.ean ? <Text style={{marginTop: 5}}>EAN: {item.ean}</Text> : null}
                        {isNotPresent ? <View style={styleSkuList.delimiterMini}/> : null}
                        {isNotPresent ? <RNPickerSelect
                            items={reasons}
                            placeholder={{}}
                            onValueChange={(value) => {
                                _value = value;
                                if (Platform.OS === "android" && value !== false) {
                                    if (info.skuReasons.get(skuKey) === value) {
                                        return
                                    }
                                    ComponentParser.addReasonForSync(info.visitId, {
                                        component: component.component,
                                        sku_gid: item.gid,
                                        oos_reason: value
                                    })
                                }
                            }}
                            onDonePress={_ => {
                                if (_value === false) {
                                    return;
                                }
                                ComponentParser.addReasonForSync(info.visitId, {
                                    component: component.component,
                                    sku_gid: item.gid,
                                    oos_reason: _value
                                })
                            }}>
                            <TouchableOpacity style={{flexDirection: "row", alignItems: "center"}}>
                                <Text style={styles.selectValue}>{_reason}</Text>
                                <Image style={{marginLeft: 2}} source={triangleDown}/>
                            </TouchableOpacity>
                        </RNPickerSelect> : null}
                    </View>
                </View>
            );
            _index += 1;
        }
        return <View key={key} style={{marginTop: index > 0 ? 20 : 0}}>{items}</View>
    }

    static renderKpi(data, key, index) {
        const rows = [];
        let group = [];

        let index_cell = 0;
        let index_row = 0;
        while (data.length > 0) {
            const kpi = data.shift();
            const style = (index_cell % 2 === 0) ? styles.kpiCellRight : styles.kpiCellLeft;
            const direct = (kpi.value > kpi.target_value) ? ">" : "<";
            group.push(
                <View key={`kpi_cell_${index_cell}`} style={style}>

                    <Text style={styles.cellTitle}>{kpi.label}</Text>
                    <View style={{flexDirection: "row", alignItems: "flex-end"}}>
                        <Text adjustsFontSizeToFit={true} style={[styles.cellMainValue, {color: kpi.color}]}>{kpi.value}<Text
                            style={styles.cellPercent}>{` ${kpi.unit}`}</Text></Text>
                        {(kpi.target_value) ?
                            <Text adjustsFontSizeToFit={true}
                                  style={styles.targetRow}>{`${direct} ${kpi.target_value}`}</Text> : null}
                    </View>
                    <View style={{flexDirection: "row"}}>
                        <Image source={triangleUp} style={[styles.directionImage, {tintColor: kpi.change_color}]}/>
                        <Text adjustsFontSizeToFit={true}
                              style={[styles.cellSecondValue, {color: kpi.change_color}]}>{kpi.change_value}
                            <Text>{` ${kpi.unit}`}</Text>
                        </Text>
                    </View>
                </View>
            );

            if (group.length === 2 || data.length === 0) {
                const style = (index_row > 0) ? {flexDirection: "row", marginTop: -1} : {
                    flexDirection: "row"
                };
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
                <PhotoView
                    key={img.url}
                    source={{uri: img.url}}
                    minimumZoomScale={1.0}
                    maximumZoomScale={2.5}
                    androidScaleType="fitCenter"
                    style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "white"}}/>
            )
        }
        return (
            <View key={key}>
                <Swiper style={styles.wrapper} index={0} showsPagination={true} loop={false}>
                    {array}
                </Swiper>
            </View>
        )
    }

    static renderText(value, key, index) {
        return <TouchableOpacity key={key} onPress={() => copyToClipboard(value)}
                                 style={{marginTop: index > 0 ? 20 : 0}}>
            <HTMLView value={value}/>
        </TouchableOpacity>
    }
}


const styleSkuList = StyleSheet.create({
    margin: {
        marginHorizontal: -6,
        paddingHorizontal: 2,
        paddingVertical: 4
    },
    container: {
        borderRadius: 4,
        backgroundColor: '#F2F2F2',
        padding: 10,
        marginHorizontal: 5,
        marginTop: 3,
        elevation: 2
    },
    delimiterMini: {
        marginVertical: 10,
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderColor: '#d8d8d8'
    },
});

const styles = StyleSheet.create({
    imageLabel: {
        fontWeight: "bold",
        marginTop: 5,
        marginBottom: 10
    },
    wrapper: {
        height: 400,
        backgroundColor: "white"
    },
    error: {
        color: "red",
        fontWeight: "bold"
    },
    kpiCellLeft: {
        borderTopWidth: 1,
        borderTopColor: "#e5e5e5",
        borderLeftWidth: 1,
        borderLeftColor: "#e5e5e5",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
        height: 150,
        paddingLeft: 15,
        width: width / 2
    },
    kpiCellRight: {
        marginRight: -1,
        borderTopWidth: 1,
        borderTopColor: "#e5e5e5",
        borderRightWidth: 1,
        borderRightColor: "#e5e5e5",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
        height: 150,
        paddingLeft: 15,
        width: width / 2
    },
    cellTitle: {
        marginTop: 20,
        fontSize: 11,
        height: 40,
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