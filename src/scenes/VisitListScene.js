import React, {Component} from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    View,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Text,
    StyleSheet,
} from 'react-native';
import {Container, Header, Left, Body, Right, Icon, Title, Button, Fab} from 'native-base';
import {isIphoneX} from '../utils/util'
import PropTypes from 'prop-types';
import ListItem from '../component/ListItem'
import {connect} from 'react-redux';
import {goToCreateVisit, goToSettings, goToVisitDetails} from '../actions/navigation'
import {syncPhoto} from '../actions/photo'
import {getVisitsList, refreshVisitsList, syncVisitList} from '../actions/visist'
import I18n from 'react-native-i18n'
import Toolbar from '../component/Toolbar'

const heightCenter = Dimensions.get('window').height * 0.5


export class VisitListScene extends Component {

    componentDidMount = () => {
        this.props.refreshVisitsList(false)
        this.props.syncVisitList()
        console.log('urisByVisit', this.props.urisByVisit)
        if (Object.keys(this.props.urisByVisit).length === 0) {
            this.props.syncPhoto()

        }

    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isFetch && !nextProps.isFetch && nextProps.error !== null && nextProps.error.connection == false) {
        }
    }

    renderEmptyComponent = () => {
        if (this.props.result.length === 0 && !this.props.isFetch) {
            return (
                <View style={styles.empty}>
                    <TouchableOpacity onPress={() => this.props.goToCreateVisit()}>
                        <Text style={{
                            fontSize: 20,
                            marginTop: heightCenter,
                            color: "#369ad6"
                        }}>{I18n.t('visits_list.emptyListMessage')}</Text>
                    </TouchableOpacity>
                </View>
            )
        }
        return (
            <View
                style={{
                    paddingVertical: 20,
                    borderTopWidth: 1,
                    borderColor: "#CED0CE"
                }}
            >
                <ActivityIndicator animating size="large"/>
            </View>
        );
    };

    _loadMore = () => {
        console.log('_loadMore')
        if (this.props.hasMore) {
            this.props.getVisitsList()
        }
    }

    render() {
        const {result, entities} = this.props

        // const ids = result.sort((a,b)=>b-a)
        return (
            <Container>
                <Toolbar
                    leftButton={
                        <Button transparent>
                            <Icon ios='ios-menu' android="md-menu"/></Button>
                    }
                    title={I18n.t('visits_list.title')}
                />
                <View style={{flex: 1,}}>
                    <FlatList
                        data={result}
                        renderItem={({item}) => (
                            <ListItem visit={entities[item]} onPress={() => this.props.goToVisitDetails(item)}/>

                        )}
                        keyExtractor={item => `visit_${item}`}
                        ListEmptyComponent={this.renderEmptyComponent}
                        onEndReached={this._loadMore}
                        onEndReachedThreshold={0.5}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.props.refresh}

                                onRefresh={() => this.props.refreshVisitsList()}
                                // title="Pull to refresh"
                                tintColor="#fff"
                                titleColor="#fff"
                            />
                        }                        // onRefresh={this.props.refreshVisitsList()}
                        refreshing={this.props.refresh}
                    />
                    <Fab position="bottomRight"
                         onPress={() => this.props.goToCreateVisit()}
                    >
                        <Icon name="add"/>
                    </Fab>
                </View>
            </Container>
        );
    }

}

export default connect(state => {
    const {nav, visits, photo} = state
    console.log(state)
    return {
        nav: nav,
        result: visits.result,
        entities: visits.entities.visit,
        isFetch: visits.isFetch,
        refresh: visits.refresh,
        hasMore: visits.hasMore,
        error: visits.error,
        urisByVisit: photo.urisByVisit

    }
}, {
    goToSettings,
    goToCreateVisit,
    getVisitsList,
    refreshVisitsList,
    goToVisitDetails,
    syncVisitList,
    syncPhoto
})(VisitListScene)
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
    item: {
        // shadowColor: '#000000',
        backgroundColor: 'white',
        padding: 8,
        marginBottom: 1,
        shadowOffset: {
            width: 0,
            height: 0.1
        },
        shadowRadius: 0.5,
        shadowOpacity: 1.0
    },
    empty: {flex: 1, justifyContent: 'center', alignItems: 'center'}
});

/**<TouchableOpacity onPress={() => {
    // console.log('item', item)
    this.props.goToVisitDetails(item)}}
 >
 <View style={styles.item}>
 <View>
 <Text>{entities[item].id}</Text></View>

 <Text note>{entities[item].started_date}</Text>
 </View>
 </TouchableOpacity>*/
