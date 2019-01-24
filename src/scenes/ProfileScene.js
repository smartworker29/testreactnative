import React, {Component} from 'react'
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Text,
    Image,
    Picker,
    Platform,
    AsyncStorage
} from 'react-native'
import {Item, Label, Input} from 'native-base'
import I18n from 'react-native-i18n'
import {connect} from 'react-redux'
import {profileNavigationOptions} from '../navigators/options'
import {loadData, saveData, setFieldValue, setName, setPathNumber, setPatronymic, setSurname} from '../actions/profile'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import DeviceInfo from 'react-native-device-info';
import {allowAction, getDeviceInfo} from "../utils/util";
import {forceSync, setForceSync} from "../actions/app";
import {cocacolaImage, triangleDown} from "../utils/images";
import {CachedImage} from "react-native-img-cache";
import RNPickerSelect from 'react-native-picker-select';
import CheckBox from "react-native-check-box"
import {Map} from "immutable";
import _ from "lodash";

const styles = StyleSheet.create({
    item: {
        marginTop: 15,
        borderBottomColor: "#d8d8d8",
        borderBottomWidth: 1
    },
    logoContainer: {
        alignItems: "center"
    },
    logo: {
        width: 100,
        height: 100
    },
    logoTitle: {
        marginTop: 10,
        fontSize: 24,
        fontWeight: "bold",
        fontStyle: "normal",
        letterSpacing: 0,
        textAlign: "center",
        color: "#000000"
    },
    containerInfo: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center"
    },
    infoText: {
        color: "black",
        marginTop: 20
    },
    input: {
        height: 30,
        paddingLeft: 0,
        paddingBottom: 0,
        marginBottom: 10
    },
    checkBox: {
        height: 30,
        paddingVertical: 5
    },
    selectInput: {
        height: 30,
        paddingLeft: 0,
        paddingBottom: 0,
        marginBottom: 10,
        justifyContent: "center"
    },
    selectValue: {
        fontSize: 16,
    },
    disabledValue: {
        fontSize: 16,
        color: '#b4b4b4'
    },
    container: {
        backgroundColor: 'white'
    },
    placeholder: {
        color: '#b4b4b4'
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
    statusRow: {
        marginTop: 15,
        alignItems: "center"
    },
    activity: {
        marginRight: 10
    },
    text: {
        textAlign: "center"
    }
});

class ProfileScene extends Component {

    static navigationOptions = ({navigation}) => profileNavigationOptions(navigation);

    constructor() {
        super();
        this.syncLock = false;
        this.state = {
            fields: {},
            storedFields: Map()
        }
    }

    //
    // async componentWillMount() {
    //   // this.props.navigation.setParams({
    //   //   saveData: this.props.saveData,
    //   //   hasChanges: this.props.hasChanges
    //   // })
    //   //
    //   // await this.props.loadData()
    //
    // }

    async componentWillMount() {
        await this.props.loadData();
        this.setState({fields: this.props.fields})
    }

    async componentDidMount() {
        this.props.navigation.setParams({
            saveData: this.props.saveData,
            hasChanges: this.props.hasChanges
        });

        await this.loadStoredFields();
    }

    async loadStoredFields() {
        const {pins, pin, instance} = this.props;
        const fields = instance.agent_fields;
        const fieldsData = {};
        if (fields) {
            for (const field of fields) {
                const val = await AsyncStorage.getItem(`@${pin}_profile_field_${field.name}`);
                if (val) {
                    fieldsData[field.name] = await AsyncStorage.getItem(`@${pin}_profile_field_${field.name}`);
                }
            }
            this.setState({storedFields: Map(fieldsData)})
        }
    }

    async componentWillReceiveProps(props) {
        if (this.props.agentFetch !== props.agentFetch) {
            this.props.navigation.setParams({
                isFetch: props.agentFetch
            })
        }
        if (props.agentFetch === false && props.agentFetch !== this.props.agentFetch) {
            await this.loadStoredFields();
        }
    }

    onChangeSurname = (text) => {
        this.props.setSurname(text)
    };

    onChangeName = (text) => {
        this.props.setName(text)
    };

    onChangePatronymic = (text) => {
        this.props.setPatronymic(text)
    };

    showAgentId = () => {
        alert(this.props.agentId);
    };

    showDeviceInfo = async () => {
        alert(JSON.stringify(await getDeviceInfo()))
    };

    forceSync = async () => {
        if (this.syncLock === true) {
            return;
        }
        this.syncLock = true;
        await this.props.forceSync();
        this.syncLock = false;
    };

    renderForceSync() {
        const {isForceSync} = this.props;
        if (!this.props.agentId) {
            return null;
        }
        if (isForceSync === true) {
            return (
                <View>
                    <TouchableOpacity style={styles.feedbackButton} onPress={this.forceSync}>
                        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                            <ActivityIndicator size="small" style={styles.activity}/>
                            <Text style={styles.text}>{I18n.t("user_profile.sync")}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        }
        return (
            <View>
                <TouchableOpacity style={styles.feedbackButton} onPress={this.forceSync}>
                    <Text style={styles.feedbackText}>{I18n.t("user_profile.sync")}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    onChangeFieldValue = (field, value) => {
        this.setState(state => {
            const fields = {...state.fields};
            fields[field] = _.trim(value);
            return {fields}
        });
        this.props.setFieldValue(field, value)
    };

    renderFields(fields) {
        if (!_.isArray(fields)) {
            return null;
        }
        const elements = [];
        for (const field of fields) {
            switch (field.type) {
                case "string":
                    elements.push(this.renderString(field));
                    break;
                case "email":
                    elements.push(this.renderEmail(field));
                    break;
                case "select":
                    (field.multiple) ? elements.push(this.renderMultiSelect(field)) :
                        elements.push(this.renderSelect(field));
            }
        }
        return elements;
    }

    renderString(field) {
        return (
            <View style={styles.item} key={field.name}>
                <View style={{flexDirection: "row", alignItems: "center"}}>
                    <Text style={{color: '#b4b4b4'}}>
                        {this.getLabel(field)}
                    </Text>
                    {(field.required) ? <Text style={{color: "#ff415f", marginLeft: 5}}>*</Text> : null}
                </View>
                <Input style={styles.input}
                       key={field.name}
                       onChangeText={(value) => this.onChangeFieldValue(field.name, value)}
                       value={this.state.fields[field.name]}/>
            </View>
        )
    }

    renderEmail(field) {
        return (
            <View style={styles.item} key={field.name}>
                <View style={{flexDirection: "row", alignItems: "center"}}>
                    <Text style={{color: '#b4b4b4'}}>
                        {this.getLabel(field)}
                    </Text>
                    {(field.required) ? <Text style={{color: "#ff415f", marginLeft: 5}}>*</Text> : null}
                </View>
                <Input style={styles.input}
                       key={field.name}
                       onChangeText={(value) => this.onChangeFieldValue(field.name, value)}
                       value={this.state.fields[field.name]}/>
            </View>
        )
    }

    renderSelect(field) {
        const values = [];
        if (Platform.OS === "android" && field.readonly !== true) {
            values.push({label: `Выберите ${this.getLabel(field)}:`, value: false})
        }
        for (const value of field.options) {
            values.push({label: value, value})
        }
        let _value = this.state.fields[field.name] ? this.state.fields[field.name] : values[0].value;
        const currentValue = field.readonly === true ? this.state.storedFields.has(field.name) ? this.state.storedFields.get(field.name) : "Выбор недоступен" : this.state.fields[field.name] || "Выберите";
        return (
            <View style={styles.item} key={field.name}>
                <View style={{flexDirection: "row", alignItems: "center"}}>
                    <Text style={{color: '#b4b4b4'}}>{this.getLabel(field)}</Text>
                    {(field.required) ? <Text style={{color: "#ff415f", marginLeft: 5}}>*</Text> : null}
                </View>
                <View style={styles.selectInput}>
                    <RNPickerSelect
                        items={values}
                        placeholder={{}}
                        disabled={field.readonly === true}
                        onValueChange={(value) => {
                            if (Platform.OS === "android" && value === false) {
                                return;
                            }
                            _value = value;
                            this.onChangeFieldValue(field.name, value)
                        }}
                        onDonePress={(value) => this.onChangeFieldValue(field.name, _value)}>
                        <TouchableOpacity style={{flexDirection: "row", alignItems: "center"}}>
                            <Text style={styles.selectValue}>{currentValue}</Text>
                            {field.readonly !== true ? <Image source={triangleDown}/> : null}
                        </TouchableOpacity>
                    </RNPickerSelect>
                </View>
            </View>
        )
    }

    renderMultiSelect(field) {
        const options = field.options.map(option => {
            let value = this.state.fields[field.name];
            if (_.isString(value)) {
                value = value.split(",")
            }
            return (

                <View style={{flexDirection: "row", alignItems: "center"}} key={option}>
                    <CheckBox style={styles.checkBox}
                              isChecked={value && value.includes(option)}
                              onClick={() => {
                                  this.onCheckOption(field.name, option)
                              }}/>
                    <Text style={{marginLeft: 10}}>{option}</Text>
                </View>)
        });
        return (
            <View style={styles.item} key={field.name}>
                <View style={{flexDirection: "row", alignItems: "center"}}>
                    <Text style={{color: '#b4b4b4'}}>
                        {this.getLabel(field)}
                    </Text>
                    {(field.required) ? <Text style={{color: "#ff415f", marginLeft: 5}}>*</Text> : null}
                </View>
                <View style={{marginVertical: 5}}>
                    {options}
                </View>
            </View>
        )
    }

    onCheckOption(name, option) {
        this.setState(state => {
            let options = [];
            const fields = {...state.fields};
            if (fields[name]) {
                options = fields[name]
            }
            if (typeof options === "string") {
                options = options.split(",");
            }
            if (options.includes(option)) {
                options = _.without(options, option);
            } else {
                options.push(option)
            }
            fields[name] = options;
            this.props.setFieldValue(name, options);
            return {fields}
        })
    }


    getLabel(field) {
        let [lang] = DeviceInfo.getDeviceLocale().split("-");
        if (lang && field[`label_${lang}`]) {
            return field[`label_${lang}`]
        }
        return I18n.t(`profile.${field.name}`, {defaultValue: field.name});
    }

    render() {

        const {pins, pin, instance} = this.props;
        const name = pins[pin].name;
        const logo = pins[pin].logo;
        const elements = this.renderFields(instance.agent_fields);
        const nameFields = instance.agent_name_fields;

        if (this.props.agentFetch === true) {
            const text = (this.props.agentId) ? I18n.t("user_profile.updateAgent") : I18n.t("user_profile.createAgent");
            return (
                <View style={styles.containerInfo}>
                    <ActivityIndicator size="small"/>
                    <Text style={styles.infoText}>{text}</Text>
                </View>
            );
        }

        let nameViews = (
            <View>
                <View style={styles.item}>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Text style={{color: '#b4b4b4'}}>
                            {I18n.t('settings.surname')}
                        </Text>
                        <Text style={{color: "#ff415f", marginLeft: 5}}>*</Text>
                    </View>
                    <Input style={styles.input}
                           onChangeText={this.onChangeSurname}
                           value={this.props.surname}/>
                </View>

                <View style={styles.item}>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Text style={{color: '#b4b4b4'}}>
                            {I18n.t('settings.name')}
                        </Text>
                        <Text style={{color: "#ff415f", marginLeft: 5}}>*</Text>
                    </View>
                    <Input style={styles.input}
                           onChangeText={this.onChangeName}
                           value={this.props.name}/>
                </View>
                <View stackedLabel style={styles.item}>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Text style={{color: '#b4b4b4'}}>
                            {I18n.t('settings.patronymic')}
                        </Text>
                        <Text style={{color: "#ff415f", marginLeft: 5}}>*</Text>
                    </View>
                    <Input style={styles.input}
                           onChangeText={this.onChangePatronymic}
                           value={this.props.patronymic}/>
                </View>
            </View>
        );

        let [lang] = DeviceInfo.getDeviceLocale().split("-");
        if (nameFields) {
            const newNameViews = [];
            for (const name of nameFields) {
                const value = String(name[`label_${lang}`]).toUpperCase();
                if (value === "FIRST NAME" || value === "ФАМИЛИЯ") {
                    newNameViews.push(
                        <View style={styles.item} key={value}>
                            <View style={{flexDirection: "row", alignItems: "center"}}>
                                <Text style={{color: '#b4b4b4'}}>
                                    {name[`label_${lang}`]}
                                </Text>
                                <Text style={{color: "#ff415f", marginLeft: 5}}>*</Text>
                            </View>
                            <Input style={styles.input}
                                   onChangeText={this.onChangeSurname}
                                   value={this.props.surname}/>
                        </View>
                    )
                }
                if (value === "SECOND NAME" || value === "ИМЯ") {
                    newNameViews.push(
                        <View style={styles.item} key={value}>
                            <View style={{flexDirection: "row", alignItems: "center"}}>
                                <Text style={{color: '#b4b4b4'}}>
                                    {name[`label_${lang}`]}
                                </Text>
                                <Text style={{color: "#ff415f", marginLeft: 5}}>*</Text>
                            </View>
                            <Input style={styles.input}
                                   onChangeText={this.onChangeName}
                                   value={this.props.name}/>
                        </View>
                    )
                }
                if (value === "MIDDLE NAME" || value === "ОТЧЕСТВО") {
                    newNameViews.push(
                        <View stackedLabel style={styles.item} key={value}>
                            <View style={{flexDirection: "row", alignItems: "center"}}>
                                <Text style={{color: '#b4b4b4'}}>
                                    {name[`label_${lang}`]}
                                </Text>
                                <Text style={{color: "#ff415f", marginLeft: 5}}>*</Text>
                            </View>
                            <Input style={styles.input}
                                   onChangeText={this.onChangePatronymic}
                                   value={this.props.patronymic}/>
                        </View>
                    )
                }
            }
            nameViews = newNameViews;
        }

        return (
            <KeyboardAwareScrollView extraScrollHeight={100} style={styles.container} enableOnAndroid={true}>
                <View style={{flex: 1, padding: 16}}>
                    <View style={styles.logoContainer}>
                        {(logo) ? <CachedImage style={styles.logo} source={{uri: logo}}/> : null}
                        <Text style={styles.logoTitle}>{name}</Text>
                    </View>
                    {nameViews}
                    {elements}
                    <TouchableOpacity onLongPress={this.showAgentId}>
                        <Text style={{
                            color: '#b4b4b4',
                            marginTop: 16
                        }}>{`${I18n.t('settings.build')} ${DeviceInfo.getBuildNumber()}`}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onLongPress={this.showDeviceInfo}>
                        <Text style={{
                            color: '#b4b4b4',
                            marginTop: 16
                        }}>{name}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        )
    }
}

const mapStateToProps = state => ({
    name: state.profile.name,
    pins: state.auth.pins,
    pin: state.auth.pin,
    instance: state.auth.instance,
    surname: state.profile.surname,
    patronymic: state.profile.patronymic,
    pathNumber: state.profile.pathNumber,
    contactNumber: state.profile.contactNumber,
    hasChanges: state.profile.hasChanges,
    fields: state.profile.fields,
    agentId: state.auth.id,
    agentFetch: state.auth.agentFetch,
    visitSync: state.visits.syncProcess,
    photoSync: state.photo.syncProcess,
    isForceSync: state.app.isForceSync
});

export default connect(mapStateToProps, {
    saveData,
    loadData,
    setName,
    setSurname,
    setPatronymic,
    setPathNumber,
    forceSync,
    setFieldValue
})(ProfileScene)


