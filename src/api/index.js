// import { base_url } from '../utils/api'
import axios from 'axios'
import { AsyncStorage } from "react-native";

// DEVELOP
//export const base_url = 'https://mobile-app.inspector-cloud-staging.ru/api/v1.5'
//const token = '5969cde32ee95eaa406baffefe9f6f899c2a8eec'

// PAPSICO
// export const base_url = 'https://pepsico.inspector-cloud.ru/api/v1.5'
// const token = 'f93b66438bc5bb80dcfed7d1e69466077bb13652'

// DELIKATESES
// export const base_url = 'https://delikateses.inspector-cloud.ru/api/v1.5'
// const token = 'f18ca23121bbc0cbfee0da81c4b4bec36e61a546'

getAuth = async () => {
    const url = await AsyncStorage.getItem("@url");
    const token = await AsyncStorage.getItem("@token");
    return {url, token}
}

export const getPins = async () => {
    try {
        return await axios({
            method: 'get',
            url: `https://app.inspector-cloud.ru/befda61b-95be-4f1e-8297-ae5ed7c8b3ce/instanse.json`,
            headers: {
                'user-Agent': 'okhttp/3.6.0'
            },
            // url: `https://cloud-inspector-dev.firebaseio.com/instance.json`,
            timeout: 10000
        })
    } catch (error) {
        return null
    }
}

export const createAgent = async (data) => {
    try {
        const {url, token} = await getAuth();
        return await axios({
            method: 'post',
            url: `${url}/agents/`,
            timeout: 10000,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            data
        })
    } catch (error) {
        return null
    }
}

export const makeVisit = async (id = 1, data, timeout) => {

    const {url, token} = await getAuth();
    const options = {
        method: 'post',
        url: `${url}/agents/${id}/visits/`,
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        },
        data
    }

    if (timeout) {
        options.timeout = timeout;
    }

    try {
        return await axios(options)
    } catch (error) {
        console.log("makeVisit error");
        console.log(error);
        return null
    }
}

export const getVisitDetails = async (id) => {
    try {
        const {url, token} = await getAuth();
        return await axios({
            method: 'get',
            url: `${url}/visits/${id}/`,
            //validateStatus: null,
            timeout: 10000,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
        })
    } catch (error) {
        console.log("getVisitDetails error");
        console.log(error);
        return null
    }
}

export const getAgents = async (id) => {
    try {
        const {url, token} = await getAuth();
        return await axios({
            method: 'get',
            url: `${url}/agents`,
            timeout: 10000,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
        })
    } catch (error) {
        console.log("getAgents error");
        console.log(error);
        return null
    }
}

export const updateAgent = async (id, name) => {
    try {
        const {url, token} = await getAuth();
        return await axios({
            method: 'put',
            url: `${url}/agents/${id}/`,
            timeout: 10000,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            data: {name}
        })
    } catch (error) {
        console.log(error);
        return null
    }
}

export const getAgentUpdates = async (id = 1) => {
    try {
        const {url, token} = await getAuth();
        return await axios({
            method: 'get',
            url: `${url}/agents/${id}/updates/`,
            timeout: 10000,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
        })
    } catch (error) {
        console.log("getAgentUpdates error");
        console.log(error);
        return null
    }
}

export const getVisitsByAgent = async (id = 1) => {
    try {
        const {url, token} = await getAuth();
        return await axios({
            method: 'get',
            url: `${url}/agents/${id}/visits/`,
            timeout: 10000,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
        })
    }
    catch (error) {
        console.log("getVisitsByAgent");
        throw error
    }
}

export const uploadPhoto = async (id, data) => {
    try {
        const {url, token} = await getAuth();
        return await axios({
            method: 'post',
            url: `${url}/visits/${id}/scene/0/upload/`,
            headers: {
                'Authorization': `Token ${token}`
            }, data,
        })
    } catch (error) {
        console.log("uploadPhoto error");
        throw error
    }
}

export default {
    makeVisit, getVisitDetails, getAgents, getAgentUpdates, uploadPhoto, getVisitsByAgent
}