import React, {Component} from 'react';
import {ActivityIndicator, View, StyleSheet,TextInput} from 'react-native';
import {
    Container,
    Header,
    Item,
    Input,
    Text,
    Content,
    Left,
    Label,
    Body,
    Right,
    Icon,
    Title,
    Subtitle,
    Button,
    Fab,Form
} from 'native-base';
import {connect} from 'react-redux';
import {back, goToSettings} from '../actions/navigation'
import I18n from 'react-native-i18n'

export class CreateVisitScene extends Component {
    renderHeader() {
        return (
            <Header>
                <Left>
                    <Button transparent onPress={() => this.props.back()}>
                        <Icon name='arrow-back'/>
                    </Button>
                </Left>
                <Body>
                <Title>{I18n.t('CreateVisit.title')}</Title>
                </Body>
                <Right>
                    <Button transparent
                            onPress={() => this.props.goToSettings()}
                    >
                        <Icon name='settings'/>
                    </Button>

                </Right>
            </Header>
        )
    }

    render() {
        return (
            <Container>
                {this.renderHeader()}

                <View style={{
                    flex: 1,  padding:15, justifyContent: 'center', backgroundColor:'white'
                }}>
                    <Form>
                        <Item floatingLabel>
                            <Label>{I18n.t('CreateVisit.label')}</Label>
                            <Input/>
                        </Item>

                            <Button block success style={{marginTop:20}}>
                                <Text>{I18n.t('CreateVisit.createAction')}</Text>
                            </Button>
                    </Form>
                </View>
            </Container>
        )
    }
}

export default connect(null, {goToSettings, back})(CreateVisitScene)
