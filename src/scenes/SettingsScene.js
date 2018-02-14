import React, {Component} from 'react';
import {View,} from 'react-native';
import {Button, Container, Fab, Header, Icon, Left, ListItem, Right, Title} from 'native-base';
import I18n from 'react-native-i18n'
import Toolbar from '../component/Toolbar'


export default class SettingsScene extends Component {

    render() {
        return (
            <Container>
                <Toolbar
                    title={I18n.t('settings.title')}
                    rightButton={null}
                />
                <View style={{flex: 1, padding:16}}>
                </View>
            </Container>
        );
    }

}