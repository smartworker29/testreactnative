import React, {Component} from 'react';
import {StyleSheet, Text, View, WebView,} from 'react-native';
import {Button, Container, Fab, Header, Icon, Left, ListItem, Right, Title} from 'native-base';
import {connect} from 'react-redux';
import {goToPhoto,goToVisitList} from '../actions/navigation'
import {getVisitDetails,} from '../actions/visist'
import I18n from 'react-native-i18n'
import Toolbar from '../component/Toolbar'


export class VisitDetailScene extends Component {

    componentDidMount = () => {
        const id = this.props.navigation.state.params.id
        console.log('id', id)
        this.props.getVisitDetails(id)
    }

    render() {
        const { entities} = this.props
        const {id} = this.props.navigation.state.params
        return (
            <Container>
                <Toolbar
                    leftButton={<Button
                        transparent
                        onPress={() =>{
                            this.props.goToVisitList()}}
                    >
                        <Icon name="arrow-back"/>
                    </Button>}

                    title={I18n.t('photo.title')}
                    rightButton={<Button transparent
                                         onPress={() => this.props.goToPhoto(id)}>
                        <Icon name="camera"/></Button>}
                />
                <View style={{flex: 1, padding:16}}>
                    <Text>{`${I18n.t('visitDetail.title')}  ${id}`}</Text>
                    <Text>{`${I18n.t('visitDetail.agent')} ${entities[id]!==undefined?entities[id].agent:''}`}</Text>
                    <Text>{`${I18n.t('visitDetail.shop')} ${entities[id]!==undefined?entities[id].shop:''}`}</Text>
                    <Text>{`${I18n.t('visitDetail.started_date')} ${entities[id]!==undefined?entities[id].started_date:''}`}</Text>
                </View>
            </Container>
        );
    }

}

export default connect(state => {
    const {nav, visits} = state
    return {
        nav: nav,
        result: visits.result,
        entities: visits.entities.visit,
        isFetch: visits.isFetch,

    }
}, {
    getVisitDetails,goToPhoto, goToVisitList
})(VisitDetailScene)
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
    empty: {flex: 1, justifyContent: 'center', alignItems: 'center'}
});