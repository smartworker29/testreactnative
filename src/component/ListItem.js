import React, {Component, PureComponent} from 'react';
import {StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import I18n from 'react-native-i18n'
import PropTypes from 'prop-types';


export default class ListItem extends PureComponent {
    render() {
        const {visit} = this.props
        if(visit.tmp) {
            return (
                <TouchableOpacity {...this.props} onPress={this.props.onPress}>
                    <View style={styles.item}>
                        <Text style={styles.bold}>{`${I18n.t('visitDetail.title')}  ${visit.id} ${I18n.t('visitDetail.offline')}`}</Text>
                        <Text style={styles.bold}>{`${I18n.t('visitDetail.agent')} ${visit.agent ? visit.agent : ''}`}</Text>
                        <Text style={styles.bold}>{`${I18n.t('visitDetail.shop')} ${visit.shop ? visit.shop : ''}`}</Text>
                        <Text style={styles.bold}>{`${I18n.t('visitDetail.started_date')} ${visit.local_date}`}</Text>
                    </View>
                </TouchableOpacity>
            )
        }
        return (
            <TouchableOpacity {...this.props} onPress = {this.props.onPress}>
                <View style={styles.item}>
                    <Text >{`${I18n.t('visitDetail.title')}  ${visit.id}`}</Text>
                    <Text>{`${I18n.t('visitDetail.agent')} ${visit.agent ? visit.agent : ''}`}</Text>
                    <Text>{`${I18n.t('visitDetail.shop')} ${visit.shop ? visit.shop : ''}`}</Text>
                    <Text>{`${I18n.t('visitDetail.started_date')} ${visit.started_date}`}</Text>
                </View>
            </TouchableOpacity>
        )


    }
}

ListItem.propTypes = {
    /**
     * The data of visit
     */
    visit: PropTypes.object,
    /**
     * action for when pressing the item
     */
    onPress: PropTypes.func,

}

ListItem.defaultProps = {
    visit: {}
}

const styles = StyleSheet.create({
    item: {
        height: 100,
        backgroundColor: 'white',
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft:16,
        paddingRight:16,
        marginBottom: 1,
        shadowOffset: {
            width: 0,
            height: 0.1
        },
        shadowRadius: 0.5,
        shadowOpacity: 1.0
    },
    bold:{fontWeight: 'bold',}
});
