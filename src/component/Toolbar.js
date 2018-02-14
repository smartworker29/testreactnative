import React, {Component} from 'react';
import {isIphoneX} from '../utils/util'
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {back, goToSettings} from '../actions/navigation'
import {Container, Header, Left, Body, Right, Icon, Title, Subtitle, Button, Fab} from 'native-base';

class Toolbar extends Component {
    renderLeftIcon() {
        if (this.props.leftButton !== undefined) {
            return (this.props.leftButton)
        } else if (this.props.nav.index > 0) {
            return ( <Button
                    transparent
                    onPress={() => this.props.back()}
                >
                    <Icon name="arrow-back"/>
                </Button>
            )
        }
    }

    renderRightIcon() {
        if (this.props.rightButton !== undefined) {
            return (this.props.rightButton)
        } else {
            return ( <Button
                    transparent
                    onPress={() => this.props.goToSettings()}>
                    <Icon name="settings"/>
                </Button>
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
}
const mapStateToProps = state => ({
    nav: state.nav,
});
export default connect(mapStateToProps, {back, goToSettings})(Toolbar)