import React, {Component} from "react";
import {QuestionnaireNavigationOptions} from "../navigators/options";
import {List, Map, Set} from "immutable";
import connect from "react-redux/es/connect/connect";
import {
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  barcode,
  check,
  checkSelected,
  closeIcon,
  radioSelected,
  radioUnselected
} from "../utils/images";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import _ from "lodash";
import {RNCamera} from "react-native-camera";
import I18n from "react-native-i18n";
import GradientButton from "../component/GradientButton";
import {
  saveQuestions,
  saveUuidValues,
  setAnswers,
  setRequiredQuestions,
  setSync
} from "../actions/questions";
import {back} from "../actions/navigation";

class QuestionnaireScene extends Component {
  static navigationOptions = ({navigation}) => QuestionnaireNavigationOptions(navigation);

  required = [];

  constructor() {
    super();
    this._isMounted = false;
    this.state = {
      answers: Map(),
      uuidValues: Map(),
      visitUuid: null,
      needSync: Map(),
      isCameraVisible: false,
      cameraUuid: null,
      required: Set()
    }
  }

  componentWillMount() {
    this.props.navigation.setParams({
      backHandler: () => dispatch => {
        this.parseFloatValues(this.state.answers);
        this.props.setAnswers(this.state.answers);
        this.props.saveUuidValues(this.state.uuidValues);
        this.props.setRequiredQuestions(this.state.required);
        const newSync = this.props.sync.merge(this.state.needSync);
        this.props.setSync(newSync);
        dispatch(back())
      }
    })
  }

  parseFloatValues = (map) => {
    map.forEach(answer => {
      if (answer && answer.number) {
        answer.number = !isNaN(parseFloat(answer.number)) ? String(parseFloat(answer.number)) : "";
      }
    });
  };

  componentDidMount() {
    this._isMounted = true;
    const visitUuid = this.props.navigation.getParam("visitUuid");
    const questions = this.props.navigation.getParam("questions");
    this.setState({visitUuid, answers: this.props.answers});
    this.parseGroups(visitUuid, questions)
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  selectButton(questionUuid, value) {
    this._isMounted && this.setState(state => {
      return {
        answers: state.answers.set(this.state.visitUuid + '_' + questionUuid, {
          question_uuid: questionUuid,
          visit_uuid: state.visitUuid,
          bool: value
        }),
        needSync: state.needSync.set(this.state.visitUuid + '_' + questionUuid, null)
      }
    })
  }

  renderButtonsQuestion(object, index, group) {
    const selected = this.state.answers.get(this.state.visitUuid + '_' + object.uuid, null);
    const yesButtonStyle = selected && selected.bool === true ? styles.buttonSelected : styles.buttonUnselected;
    const yesTextStyle = selected && selected.bool === true ? styles.buttonSelectedText : styles.buttonUnselectedText;
    const noButtonStyle = selected && selected.bool === false ? styles.buttonSelected : styles.buttonUnselected;
    const noTextStyle = selected && selected.bool === false ? styles.buttonSelectedText : styles.buttonUnselectedText;
    const objectUuid = object.uuid;
    const requiredMark = object.required === true ?
      <Text style={styles.requireMark}>*</Text> : null;
    return (
      <View style={styles.questionView} key={object.uuid}>
        <View style={styles.questionHead}>
          <Text style={styles.questionNumber}>{index}.</Text>
          <View style={{flexDirection: "column", marginLeft: 13, flex: 1}}>
            <Text style={styles.questionTitle}>{object.text} {requiredMark}</Text>
            <View style={styles.answerContainerButton}>
              <TouchableOpacity style={yesButtonStyle} onPress={() => {
                this.selectButton(objectUuid, true)
              }}>
                <Text style={yesTextStyle}>Да</Text>
              </TouchableOpacity>
              <TouchableOpacity style={noButtonStyle} onPress={() => {
                this.selectButton(objectUuid, false)
              }}>
                <Text style={noTextStyle}>Нет</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    )
  }

  changeText(questionUuid, text, valueType) {
    this._isMounted && this.setState(state => {
      let answers;
      let needSync = state.needSync.set(this.state.visitUuid + '_' + questionUuid, null);
      if (valueType === "text") {
        answers = state.answers.set(this.state.visitUuid + '_' + questionUuid, {
          question_uuid: questionUuid,
          visit_uuid: state.visitUuid,
          text: text
        })
      } else if (valueType === "number") {
        answers = state.answers.set(this.state.visitUuid + '_' + questionUuid, {
          question_uuid: questionUuid,
          visit_uuid: state.visitUuid,
          number: text
        });
      }
      return {answers, needSync}
    })
  }

  androidChangeText(questionUuid, valueType) {
    const answer = this.state.answers.get(this.state.visitUuid + '_' + questionUuid);
    if (!answer) {
      return;
    }

    if (valueType === "number") {
      answer.number = !isNaN(parseFloat(answer.number)) ? String(parseFloat(answer.number)) : "";
      this._isMounted && this.setState(state => {
        let answers = state.answers.set(this.state.visitUuid + '_' + questionUuid, answer);
        let needSync = state.needSync.set(this.state.visitUuid + '_' + questionUuid, null);
        return {answers, needSync}
      })
    }
  }

  renderInputQuestion(object, index, group, keyboardType, valueType) {
    const selected = this.state.answers.get(this.state.visitUuid + '_' + object.uuid, null);
    const value = selected && selected[valueType] ? selected[valueType] : "";
    const requiredMark = object.required === true ?
      <Text style={styles.requireMark}>*</Text> : null;
    return (
      <View style={styles.questionView} key={object.uuid}>
        <View style={styles.questionHead}>
          <Text style={styles.questionNumber}>{index}.</Text>
          <View style={{flexDirection: "column", marginLeft: 13, flex: 1}}>
            <Text style={styles.questionTitle}>{object.text} {requiredMark}</Text>
            {Platform.OS === "android" ?
              <TextInput keyboardType={keyboardType} style={styles.answerContainerInput}
                         value={value}
                         onChangeText={text => this.changeText(object.uuid, text, valueType)}
                         onEndEditing={() => this.androidChangeText(object.uuid, valueType)}/> :
              <View style={styles.answerContainerInput}>
                <TextInput keyboardType={keyboardType}
                           value={value}
                           onChangeText={text => this.changeText(object.uuid, text, valueType)}/>
              </View>}
          </View>
        </View>
      </View>
    )
  }

  selectOption(questionUuid, answerUuid, answerValue) {
    this._isMounted &&  this.setState(state => {
      return {
        answers: state.answers.set(this.state.visitUuid + '_' + questionUuid, {
          question_uuid: questionUuid,
          visit_uuid: state.visitUuid,
          select_one: answerUuid
        }),
        uuidValues: state.uuidValues.set(answerUuid, answerValue),
        needSync: state.needSync.set(this.state.visitUuid + '_' + questionUuid, null)
      }
    });

  }

  renderRadioQuestion(object, index, group) {
    const options = [];
    let optionIndex = 0;
    const requiredMark = object.required === true ?
      <Text style={styles.requireMark}>*</Text> : null;
    const selected = this.state.answers.get(this.state.visitUuid + '_' + object.uuid, null);
    for (const answer of object.answer_option) {
      const fontStyle = selected && selected.select_one === answer.uuid ? radioStyles.radioTextSelected : radioStyles.radioText;
      const icon = selected && selected.select_one === answer.uuid ? radioSelected : radioUnselected;
      const groupUuid = object.uuid;
      const answerUuid = answer.uuid;
      const answerValue = answer.value;
      options.push(
        <TouchableOpacity
          style={[radioStyles.radioElementTouch, optionIndex > 0 ? {marginTop: 16} : {}]}
          key={answer.id}
          onPress={() => {
            this.selectOption(groupUuid, answerUuid, answerValue)
          }}>
          <Image source={icon}/>
          <View style={radioStyles.radioButtonTextView}>
            <Text style={fontStyle}>{answer.value}</Text>
          </View>
        </TouchableOpacity>
      );
      optionIndex++;
    }
    return (
      <View style={styles.questionView} key={object.uuid}>
        <View style={styles.questionHead}>
          <Text style={styles.questionNumber}>{index}.</Text>
          <View style={{flexDirection: "column", marginLeft: 13, flex: 1}}>
            <Text style={styles.questionTitle}>{object.text} {requiredMark}</Text>
            <View style={{marginTop: 21}}>
              {options}
            </View>
          </View>
        </View>
      </View>
    )
  }

  selectCheck(questionUuid, answerUuid, answerValue) {
    this._isMounted && this.setState(state => {
      if (!state.answers.has(this.state.visitUuid + '_' + questionUuid)) {
        return {
          answers: state.answers.set(this.state.visitUuid + '_' + questionUuid, {
            question_uuid: questionUuid,
            visit_uuid: state.visitUuid,
            select_multiple: [answerUuid]
          }),
          uuidValues: state.uuidValues.set(answerUuid, answerValue),
          needSync: state.needSync.set(this.state.visitUuid + '_' + questionUuid, null)
        }
      } else {
        const object = state.answers.get(this.state.visitUuid + '_' + questionUuid);
        const answers = object.select_multiple;
        if (answers.includes(answerUuid)) {
          return {
            answers: state.answers.set(this.state.visitUuid + '_' + questionUuid, {
              question_uuid: questionUuid,
              visit_uuid: state.visitUuid,
              select_multiple: _.without(answers, answerUuid)
            }),
            uuidValues: state.uuidValues.remove(answerUuid, answerValue),
            needSync: state.needSync.set(this.state.visitUuid + '_' + questionUuid, null)
          }
        } else {
          return {
            answers: state.answers.set(this.state.visitUuid + '_' + questionUuid, {
              question_uuid: questionUuid,
              visit_uuid: state.visitUuid,
              select_multiple: [...answers, answerUuid]
            }),
            uuidValues: state.uuidValues.set(answerUuid, answerValue),
            needSync: state.needSync.set(this.state.visitUuid + '_' + questionUuid, null)
          }
        }
      }

    });
  }

  renderCheckQuestion(object, index, group) {
    const options = [];
    let optionIndex = 0;
    const selected = this.state.answers.get(this.state.visitUuid + '_' + object.uuid, null);
    for (const answer of object.answer_option) {
      const groupUuid = object.uuid;
      const answerUuid = answer.uuid;
      const answerValue = answer.value;
      const icon = selected && selected.select_multiple.includes(answerUuid) ? checkSelected : check;
      const textStyle = selected && selected.select_multiple.includes(answerUuid) ? checkStyle.textSelected : checkStyle.textUnselected;
      options.push(
        <TouchableOpacity
          onPress={() => this.selectCheck(groupUuid, answerUuid, answerValue)}
          style={[checkStyle.checkElementTouch, optionIndex > 0 ? {marginTop: 16} : {}]}
          key={answer.id}>
          <Image source={icon}/>
          <View style={checkStyle.checkButtonTextView}>
            <Text style={textStyle}>{answer.value}</Text>
          </View>
        </TouchableOpacity>
      );
      optionIndex++;
    }
    return (
      <View style={styles.questionView} key={object.uuid}>
        <View style={styles.questionHead}>
          <Text style={styles.questionNumber}>{index}.</Text>
          <View style={{flexDirection: "column", marginLeft: 13, flex: 1}}>
            <Text style={styles.questionTitle}>{object.text}</Text>
            <View style={{marginTop: 21}}>
              {options}
            </View>
          </View>
        </View>
      </View>
    )
  }

  showCamera = (uuid) => {
    this._isMounted && this.setState({
      isCameraVisible: true,
      cameraUuid: uuid
    })
  };

  setBarcode(questionUuid, barcode) {
    this._isMounted && this.setState(state => {
      return {
        answers: state.answers.set(this.state.visitUuid + '_' + questionUuid, {
          question_uuid: questionUuid,
          visit_uuid: state.visitUuid,
          text: barcode
        }),
        needSync: state.needSync.set(this.state.visitUuid + '_' + questionUuid, null)
      }
    });
  }

  renderBarcodeInput(question, index, group) {
    const selected = this.state.answers.get(this.state.visitUuid + '_' + question.uuid, null);
    const value = (selected && selected.text) || null;
    const borderStyle = Platform.OS === "ios" ? {
      borderBottomWidth: 1,
      borderBottomColor: "#bcbbc1"
    } : {};
    return (
      <View style={styles.questionView} key={question.uuid}>
        <View style={styles.questionHead}>
          <Text style={styles.questionNumber}>{index}.</Text>
          <View style={{flexDirection: "column", marginLeft: 13, flex: 1}}>
            <Text style={styles.questionTitle}>{question.text}</Text>
            <View style={[styles.answerBarcodeContainerInput, borderStyle]}>
              {Platform.OS === "android" ?
                <TextInput placeholder={"00000000000"} value={value} style={styles.answerInput}
                           editable={false}/> :
                <TextInput placeholder={"00000000000"}
                           value={value}
                           editable={false}
                           style={{
                             flex: 1,
                             fontSize: 17,
                             marginBottom: 20,
                             borderColor: "white"
                           }}/>
              }
              <TouchableOpacity onPress={() => this.showCamera(question.uuid)}>
                <Image source={barcode}/>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    )
  }

  renderQuestions(group) {
    const _questions = [];
    let index = 1;
    for (const question of group.question) {
      switch (String(question.type).toUpperCase()) {
        case "BOOL":
          _questions.push(this.renderButtonsQuestion(question, index, group));
          break;
        case "TEXT":
          _questions.push(this.renderInputQuestion(question, index, group, "default", "text"));
          break;
        case "NUMBER":
          _questions.push(this.renderInputQuestion(question, index, group, "decimal-pad", "number"));
          break;
        case "SELECT_ONE":
          _questions.push(this.renderRadioQuestion(question, index, group));
          break;
        case "SELECT_MULTIPLE":
          _questions.push(this.renderCheckQuestion(question, index, group));
          break;
        case "BARCODE":
          _questions.push(this.renderBarcodeInput(question, index, group));

      }
      index++;
    }
    return _questions
  }

  parseGroups(visitUuid, groups) {
    let questionsTree = List();
    for (const group of groups) {
      this.setState(state => ({uuidValues: state.uuidValues.set(group.uuid, group.name)}));
      let questions = List();
      for (const question of group.question) {
        this._isMounted && this.setState(state => ({
          uuidValues: state.uuidValues.set(question.uuid, question.text),
          required: question.required === true ? state.required.add(question.uuid) : state.required
        }));
        questions = questions.push(question.uuid);
      }
      questionsTree = questionsTree.push([group.uuid, questions])
    }
    this.props.saveQuestions(visitUuid, questionsTree);
  }

  renderGroups(groups) {
    const _groups = [];
    for (const group of groups) {
      _groups.push(
        <View key={group.uuid}>
          <Text style={styles.groupTitle}>{group.name}</Text>
          {this.renderQuestions(group)}
        </View>
      )
    }
    return (
      <View style={{flex: 1, backgroundColor: "white"}}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.isCameraVisible}>
          <View style={{flex: 1}}>
            <RNCamera
              style={{flex: 1}}
              onBarCodeRead={({data}) => {
                this._isMounted && this.setState({isCameraVisible: false});
                this.setBarcode(this.state.cameraUuid, data)
              }}
              barCodeTypes={[RNCamera.Constants.BarCodeType.ean13, RNCamera.Constants.BarCodeType.ean8]}
            />
            <SafeAreaView style={{position: "absolute"}}>
              <TouchableOpacity onPress={() => {
                this._isMounted && this.setState({isCameraVisible: false})
              }} style={{paddingLeft: 16, marginTop: 16}}
                                hitSlop={{top: 50, left: 50, bottom: 50, right: 50}}>
                <Image source={closeIcon} style={{tintColor: "white"}}/>
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        </Modal>
        <KeyboardAwareScrollView>
          <ScrollView style={styles.content}>
            {_groups}
            <GradientButton style={styles.saveAnswers} text={I18n.t("questions.saveAnswersButton")}
                            onPress={this.saveQuestions}/>
          </ScrollView>
        </KeyboardAwareScrollView>
      </View>
    )
  }

  saveQuestions = () => {
    for (const require of this.state.required) {
      if (this.state.answers.has(this.state.visitUuid + '_' + require) === false) {
        return Alert.alert(I18n.t("questions.haveRequireQuestions"), I18n.t("questions.requireText"), [
          {
            text: I18n.t("questions.ok"),
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
          },
        ]);
      }
    }
    this.props.saveUuidValues(this.state.uuidValues);
    this.parseFloatValues(this.state.answers);
    this.props.setAnswers(this.state.answers);
    this.props.setRequiredQuestions(this.state.required);
    let newSync = this.props.sync.merge(this.state.needSync);
    for (const answerUUID of this.state.answers.keys()) {
      if (newSync.get(answerUUID) === null) {
        newSync = newSync.set(answerUUID, false)
      }
    }
    this.props.setSync(newSync);
    this.props.navigation.dispatch(back())
  };

  render() {
    const questions = this.props.navigation.getParam("questions");
    return this.renderGroups(questions)
  }
}

const mapStateToProps = (state) => {
  return {
    answers: state.questions.answers,
    sync: state.questions.sync
  }
};


export default connect(mapStateToProps, {
  saveQuestions,
  saveUuidValues,
  setAnswers,
  setSync,
  setRequiredQuestions
})(QuestionnaireScene);


const checkStyle = StyleSheet.create({
  checkElementTouch: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkButtonTextView: {
    minHeight: 22,
    justifyContent: "center",
    marginLeft: 9,
    flex: 1
  },
  textSelected: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold"
  },
  textUnselected: {
    color: "black",
    fontSize: 16,
  }
});

const radioStyles = StyleSheet.create({
  radioText: {
    fontSize: 16,
    color: "black"
  },
  radioTextSelected: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold"
  },
  radioElementTouch: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  radioButtonTextView: {
    minHeight: 22,
    justifyContent: "center",
    marginLeft: 9,
    flex: 1
  }
});

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: "white",
  },
  saveAnswers: {
    paddingHorizontal: 0,
    marginVertical: 20
  },
  questionHead: {
    flexDirection: "row"
  },
  questionView: {
    marginTop: 30
  },
  questionNumber: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold"
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black"
  },
  buttonUnselected: {
    borderWidth: 2,
    borderColor: "#f5f5f7",
    alignItems: "center",
    justifyContent: "center",
    width: 126,
    height: 36,
    borderRadius: 22
  },
  buttonUnselectedText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#b4b4b4"
  },
  buttonSelected: {
    backgroundColor: "#ebebeb",
    alignItems: "center",
    justifyContent: "center",
    width: 126,
    height: 36,
    borderRadius: 22
  },
  buttonSelectedText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000"
  },
  answerContainerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20
  },
  answerContainerInput: {
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#bcbbc1"
  },
  answerBarcodeContainerInput: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'flex-start'
  },
  answerInput: {
    flex: 1,
    marginBottom: 21,
    fontSize: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#bcbbc1"
  },
  groupTitle: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold"
  },
  requireMark: {
    color: "#c40010"
  },

});