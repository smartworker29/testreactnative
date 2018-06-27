import {AsyncStorage} from "react-native";

export default class AsyncStorageQueue {
    static queue = [];
    static processing = false;

    static async push(key, val) {
        AsyncStorageQueue.queue.push({key, val});
        await AsyncStorageQueue.next()
    }

    static async next() {
        if (AsyncStorageQueue.processing === true) {
            return;
        }
        if (AsyncStorageQueue.queue.length === 0) {
            return;
        }
        AsyncStorageQueue.processing = true;
        const item = AsyncStorageQueue.queue.pop();
        try {
            await AsyncStorage.setItem(item.key, item.val);
        } catch (error) {
            console.log(error)
        }
        AsyncStorageQueue.processing = false;
        await AsyncStorageQueue.next()
    }
}

