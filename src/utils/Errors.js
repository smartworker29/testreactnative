import moment from 'moment';
import AsyncStorageQueue from "./AsyncStorageQueue";

class ErrorLogging {

    static maxValue = 20;
    static errors = [];
    static redux = [];

    static push(name, data) {
        ErrorLogging.errors.push({name, date: moment().format('D MMMM, HH:mm'), text: String(data)});
        ErrorLogging.errors = _.takeRight(ErrorLogging.errors, ErrorLogging.maxValue);
    }

    static storeReduxAction(action) {
        ErrorLogging.redux.push(action);
        if (ErrorLogging.redux.length > 200) {
            ErrorLogging.redux.shift();
        }
    }

    static save() {
        AsyncStorageQueue.push(`errors`, JSON.stringify(ErrorLogging.errors)).then();
    }

}

export default ErrorLogging;