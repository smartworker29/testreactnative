import React, { Component } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native'
import {
    Button,
    Container,
    Fab,
    Header,
    Icon,
    Left,
    ListItem,
    Right,
    Title,
    Text,
    Item,
    Label,
    Input
} from 'native-base'
import I18n from 'react-native-i18n'
import { connect } from 'react-redux'
import { profileNavigationOptions } from '../navigators/options'
import {
    loadData, saveData, setContactNumber, setName, setPathNumber, setPatronymic,
    setSurname
} from '../actions/profile'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import VersionNumber from 'react-native-version-number';

const styles = StyleSheet.create({
    item: {
        marginTop: 15,
    },
    input: {
        paddingLeft: 0,
        paddingBottom: 0,
        marginTop: 16,
        marginBottom: 10
    },
    container: {
        backgroundColor: 'white'
    },
    placeholder: {
        color: '#b4b4b4'
    }
})

class ProfileScene extends Component {

    static navigationOptions = ({navigation}) => profileNavigationOptions(navigation)

    constructor() {
        super()
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

    async componentDidMount() {
        console.log('profile componentDidMount')

        this.props.navigation.setParams({
            saveData: this.props.saveData,
            hasChanges: this.props.hasChanges
        })

        await this.props.loadData();
    }

    componentWillReceiveProps(props) {
        if (this.props.hasChanges !== props.hasChanges) {
            this.props.navigation.setParams({
                hasChanges: props.hasChanges
            })
        }
    }

    onChangeSurname = (text) => {
        this.props.setSurname(text)
    }

    onChangeName = (text) => {
        this.props.setName(text)
    }

    onChangePatronymic = (text) => {
        this.props.setPatronymic(text)
    }

    onChangePathNumber = (text) => {
        this.props.setPathNumber(text)
    }

    render() {

        const {pins, pin} = this.props;
        const name = pins[pin].name

        return (
            <KeyboardAwareScrollView extraScrollHeight={100} style={styles.container} enableOnAndroid={true}>
                <View style={{flex: 1, padding: 16}}>
                    <Item floatingLabel style={styles.item}>
                        <Label style={{color: '#b4b4b4'}}>{I18n.t('settings.surname')}</Label>
                        <Input style={styles.input} onChangeText={this.onChangeSurname} value={this.props.surname}/>
                    </Item>

                    <Item floatingLabel style={styles.item}>
                        <Label style={{color: '#b4b4b4'}}>{I18n.t('settings.name')}</Label>
                        <Input style={styles.input} onChangeText={this.onChangeName} value={this.props.name}/>
                    </Item>

                    <Item floatingLabel style={styles.item}>
                        <Label style={{color: '#b4b4b4'}}>{I18n.t('settings.patronymic')}</Label>
                        <Input style={styles.input} onChangeText={this.onChangePatronymic}
                               value={this.props.patronymic}/>
                    </Item>

                    <Item floatingLabel style={styles.item}>
                        <Label style={{color: '#b4b4b4'}}>{I18n.t('settings.path_number')}</Label>
                        <Input style={styles.input} onChangeText={this.onChangePathNumber}
                               value={this.props.pathNumber}/>
                    </Item>
                    <Text style={{
                        color: '#b4b4b4',
                        marginTop: 16
                    }}>{`${I18n.t('settings.build')} ${VersionNumber.buildVersion}`}</Text>
                    <Text style={{
                        color: '#b4b4b4',
                        marginTop: 16
                    }}>{name}</Text>
                </View>
            </KeyboardAwareScrollView>
        )
    }
}

const mapStateToProps = state => ({
    name: state.profile.name,
    pins: state.auth.pins,
    pin: state.auth.pin,
    surname: state.profile.surname,
    patronymic: state.profile.patronymic,
    pathNumber: state.profile.pathNumber,
    contactNumber: state.profile.contactNumber,
    hasChanges: state.profile.hasChanges
})

export default connect(mapStateToProps, {
    saveData,
    loadData,
    setName,
    setSurname,
    setPatronymic,
    setPathNumber,
    setContactNumber
})(ProfileScene)


