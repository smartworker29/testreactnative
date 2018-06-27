import {AsyncStorage} from "react-native";
import moment from 'moment';

class ErrorLogging {

    static maxValue = 10;
    static errors = [];

    static push(name, data) {
        console.log(`${name} error`, data);
        ErrorLogging.errors.push({name, date: moment().format('D MMMM, HH:mm'), text: String(data)});
        ErrorLogging.errors = _.takeRight(ErrorLogging.errors, ErrorLogging.maxValue);
    }

    static save() {
        AsyncStorage.setItem("errors", JSON.stringify(ErrorLogging.errors)).then();
    }

}

export default ErrorLogging;