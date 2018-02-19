import React, {Component} from 'react';
import {StyleSheet, Text, View, ActivityIndicator, FlatList} from 'react-native';
import {Button, Container, Fab, Header, Icon, Left, ListItem, Right, Title} from 'native-base';
import {connect} from 'react-redux';
import {goToPhoto, backTo} from '../actions/navigation'
import {getVisitDetails,} from '../actions/visitDetails'
import I18n from 'react-native-i18n'
import Toolbar from '../component/Toolbar'
import ImageView from '../component/ImageView'

export class VisitDetailScene extends Component {

    componentDidMount = () => {
        const id = this.props.navigation.state.params.id
        console.log('id', id)
        this.props.getVisitDetails(id)
    }

    render() {
        const {visit, isFetch, photos} = this.props
        const {id} = this.props.navigation.state.params
        const ids = photos[id] ? Object.keys(photos[id]) : []
        // ids[0]=1
        // ids[1]=1
        // ids[2]=1
        // ids[3]=1
        // console.log('id/', id, 'ids', ids,)
        // console.log('photos[id]', photos)
        // console.log('photos[id]', photos[id],)
        // console.log('ids#', ids,)
        return (
            <Container>
                <Toolbar
                    leftButton={
                        <Button transparent onPress={()=>this.props.backTo('VisitList')}>
                            <Icon name='arrow-back'/></Button>
                    }
                    title={I18n.t('photo.title')}
                />
                <View style={{flex: 1, padding: 16}}>
                    <Text>{`${I18n.t('visitDetail.title')}  ${id}`}</Text>
                    <Text>{`${I18n.t('visitDetail.agent')} ${visit.agent ? visit.agent : ''}`}</Text>
                    <Text>{`${I18n.t('visitDetail.shop')} ${visit.shop ? visit.shop : ''}`}</Text>
                    <Text>{`${I18n.t('visitDetail.started_date')} ${visit.started_date ? visit.started_date : ''}`}</Text>
                    {isFetch ? <ActivityIndicator/> : null}

                    <FlatList style={{ position: 'absolute',
                        bottom: 0,}}
                        data={ids}
                        keyExtractor={item => {
                            return item
                        }}
                        showsHorizontalScrollIndicator={true}

                        horizontal={true}
                        renderItem={({item}) => {
                            // return (<ImageView photo={{}}/>)
                             return (<ImageView photo={photos[id][item]}/>)
                        }}
                    />

                    <Fab position="bottomRight"
                         onPress={() => this.props.goToPhoto(id)}>
                        <Icon name="camera"/>
                    </Fab>

                </View>
            </Container>
        );
    }

}

export default connect(state => {
    const {nav, visitDetails, photo} = state
    return {
        nav: nav,
        visit: visitDetails.visit,
        isFetch: visitDetails.isFetch,
        photos: photo.urisByVisit

    }
}, {
    getVisitDetails, goToPhoto,backTo
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