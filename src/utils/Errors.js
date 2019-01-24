import moment from 'moment';
import AsyncStorageQueue from "./AsyncStorageQueue";
import _ from "lodash";

class ErrorLogging {

    static maxValue = 20;
    static errors = [];
    static redux = [];
    static deletedPhotos = [];

    static push(name, data) {
        ErrorLogging.errors.push({name, date: moment().format('D MMMM, HH:mm'), text: String(data)});
        ErrorLogging.errors = _.takeRight(ErrorLogging.errors, ErrorLogging.maxValue);
    }

    static storeReduxAction(action) {
        const _action = {...action};
        _action.date = moment().format('D MMMM, HH:mm');
        ErrorLogging.redux.push(_action);
        if (ErrorLogging.redux.length > 200) {
            ErrorLogging.redux.shift();
        }
    }

    static deletePhotoLog(uri, from) {
        const date = moment().format('D MMMM, HH:mm');
        ErrorLogging.deletedPhotos.push({uri, from, date});
        if (ErrorLogging.deletedPhotos.length > 200) {
            ErrorLogging.deletedPhotos.shift();
        }
    }

    static save() {
        AsyncStorageQueue.push(`errors`, JSON.stringify(ErrorLogging.errors)).then();
        AsyncStorageQueue.push(`deletePhotoHistory`, JSON.stringify(ErrorLogging.deletedPhotos)).then();
    }

}

export default ErrorLogging;