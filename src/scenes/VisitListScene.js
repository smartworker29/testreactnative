import React, {Component} from 'react';
import {ActivityIndicator, View, Modal,Text, StyleSheet, } from 'react-native';
import {Container, Header, Left, Body, Right, Icon, Title, Subtitle , Button,  Fab} from 'native-base';
import {isIphoneX} from '../utils/util'
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {goToCreateVisit, goToSettings} from '../actions/navigation'
import I18n from 'react-native-i18n'

export class VisitListScene extends Component {

    renderHeader(){
        return(
            <Header>
                <Left>
                    {/*<Button transparent>*/}
                    {/*<Icon name='arrow-back' />*/}
                    {/*</Button>*/}
                </Left>
                <Body>
                <Title>{I18n.t('visits_list.title')}</Title>
                </Body>
                <Right>
                    <Button transparent
                      onPress={()=>this.props.goToSettings()}
                    >
                        <Icon name='settings' />
                    </Button>

                </Right>
            </Header>
        )
    }
    render() {
        console.log(I18n)
        // console.log(I18n.t('hello'))
        return (
            <Container>
                {this.renderHeader()}
                <View style={{flex: 1, }}>
                    <Fab
                        direction="up"
                        containerStyle={{}}
                        style={{backgroundColor: '#5067FF', marginBottom:isIphoneX()?20:5}}
                        position="bottomRight"
                        onPress={() => this.props.goToCreateVisit()}>
                        <Icon name="add"/>
                    </Fab>
                </View>
            </Container>
        );
    }
}
export default connect(null, {goToSettings, goToCreateVisit})(VisitListScene)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'grey',
    },
    innerContainer: {
        alignItems: 'center',
    },
});