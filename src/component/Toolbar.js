import React, {Component} from 'react';
import {isIphoneX} from '../utils/util'
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {back, goToSettings} from '../actions/navigation'
import {Container, Header, Left, Body, Subtitle, Right, Icon, Title, Button, Fab} from 'native-base';
import I18n from 'react-native-i18n'
import photo from "../reducer/photo";
import {ActivityIndicator, View} from 'react-native'
import {refreshVisitsList, syncVisitList} from "../actions/visist";
import {syncPhoto} from "../actions/photo";
import visits from "../reducer/visits";

class Toolbar extends Component {

    constructor() {
        super();
    }

    sync = async () => {
        await this.props.syncVisitList();
        await this.props.syncPhoto();
        await this.props.refreshVisitsList(false);
    };

    refreshButton() {
        return <Button transparent onPress={this.sync}>
            <Icon name="md-sync"/>
        </Button>
    }

    preloader() {
        return <ActivityIndicator size="small" color="#00ff00"/>
    }

    renderLeftIcon() {
        if (this.props.leftButton !== undefined) {
            return (this.props.leftButton)
        } else if (this.props.nav.index > 0) {
            return (<Button
                    transparent
                    onPress={() => this.props.back()}>
                    <Icon name="arrow-back"/>
                </Button>
            )
        }
    }

    renderRightIcon() {
        if (this.props.rightButton !== undefined) {
            return (this.props.rightButton)
        } else {
            const syncButton = (this.props.isSync) ? this.preloader() : this.refreshButton();
            return (
                <View style={{flexDirection: "row"}}>
                    {(this.props.needSyncVisit || this.props.needSyncPhoto) ? syncButton : null}
                    <Button transparent onPress={() => this.props.goToSettings()}>
                        <Icon name="settings"/>
                    </Button>
                </View>
            )
        }
    }

    render() {
        return (
            <Header>
                <Left>
                    {this.renderLeftIcon()}
                </Left>
                <Body>
                <Title>{this.props.title ? this.props.title : ''}</Title>

                {/*<View style={{*/}
                {/*flexDirection: 'row', justifyContent: 'center',*/}
                {/*}}><ActivityIndicator size="small"/><Subtitle>{I18n.t('photo.sync')}</Subtitle></View>*/}

                </Body>
                <Right>
                    {this.renderRightIcon()}
                </Right>
            </Header>
        )
    }
}

Toolbar.propTypes = {
    title: PropTypes.string,
    leftButton: PropTypes.node,
    rightButton: PropTypes.node,
};

const mapStateToProps = state => ({
    needSyncVisit: state.visits.needSync,
    needSyncPhoto: state.photo.needSync,
    nav: state.nav,
    isSync: state.visits.isSync
});

const mapDispatchToProps = dispatch => ({back, goToSettings, syncVisitList, syncPhoto, });
export default connect(mapStateToProps, {back, goToSettings, syncVisitList, syncPhoto, refreshVisitsList})(Toolbar)