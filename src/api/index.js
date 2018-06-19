// import { base_url } from '../utils/api'
import axios from 'axios'
import {AsyncStorage} from "react-native";
import ErrorLogging from "../utils/Errors";


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
};

export const getPins = async () => {
    try {
        return await axios({
            method: 'get',
            url: `https://app.inspector-cloud.ru/befda61b-95be-4f1e-8297-ae5ed7c8b3ce/instanse.json`,
            headers: {
                'user-Agent': 'okhttp/3.6.0',
                'Cache-Control': 'no-cache'
            },
            // url: `https://cloud-inspector-dev.firebaseio.com/instance.json`,
            timeout: 5000
        })
    } catch (error) {
        ErrorLogging.push("getPins", error);
        return null
    }
};

export const getRatioExceptions = async () => {
    try {
        return await axios({
            method: 'get',
            url: `https://app.inspector-cloud.ru/befda61b-95be-4f1e-8297-ae5ed7c8b3ce/app_models.json`,
            timeout: 10000
        })
    } catch (error) {
        ErrorLogging.push("getRatioExceptions", error);
        return null
    }
};

export const getStats = async (id) => {
    try {
        const {url, token} = await getAuth();
        return await axios({
            method: 'get',
            validateStatus: null,
            url: `${url}/agents/${id}/stats/`,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        })
    } catch (error) {
        ErrorLogging.push("getStats", error);
        return null
    }
};

export const getTasks = async () => {
    try {
        const {url, token} = await getAuth();
        return await axios({
            method: 'get',
            url: `${url}/visit_task/`,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        })
    } catch (error) {
        ErrorLogging.push("getTasks", error);
        return null
    }
};

export const getTasksFetch = async (data) => {
    const {url, token} = await getAuth();
    try {
        return await fetch(`${url}/visit_task/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        ErrorLogging.push("getTasksFetch", err);
    }
};

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
        ErrorLogging.push("createAgent", error);
        return null
    }
};

export const updateVisit = async (id, data) => {
    try {
        const {url, token} = await getAuth();
        return await axios({
            method: 'patch',
            url: `${url}/visits/${id}/`,
            timeout: 10000,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            data
        })
    } catch (error) {
        ErrorLogging.push("updateVisit", error);
        return null
    }
};

export const patchAgent = async (id, data) => {
    try {
        const {url, token} = await getAuth();
        console.log(url, token);
        console.log(data);
        console.log("url", `${url}/agents/${id}/`);
        return await axios({
            method: 'patch',
            url: `${url}/agents/${id}/`,
            timeout: 10000,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            data
        })
    } catch (error) {
        ErrorLogging.push("patchAgent", error);
        return null
    }
};

export const makeVisit = async (id = 1, data, timeout) => {

    const {url, token} = await getAuth();
    const options = {
        method: 'post',
        url: `${url}/agents/${id}/visits/`,
        timeout: 10000,
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        },
        data
    };

    if (timeout) {
        options.timeout = timeout;
    }

    try {
        return await axios(options)
    } catch (error) {
        ErrorLogging.push("makeVisit", error);
        return null
    }
};

export const getVisitDetails = async (id) => {
    try {
        const {url, token} = await getAuth();
        return await axios({
            method: 'get',
            url: `${url}/visits/${id}/`,
            validateStatus: null,
            timeout: 10000,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
        })
    } catch (error) {
        ErrorLogging.push("getVisitDetails", error);
        return null
    }
};

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
        ErrorLogging.push("getAgents", error);
        return null
    }
};

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
        ErrorLogging.push("updateAgent", error);
        return null
    }
};

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
        ErrorLogging.push("getAgentUpdates", error);
        return null
    }
};

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
        ErrorLogging.push("getVisitsByAgent", error);
        throw error
    }
};

export const uploadPhoto = async (id, data) => {
    try {
        const {url, token} = await getAuth();
        return await axios({
            method: 'post',
            url: `${url}/visits/${id}/scene/0/upload/`,
            timeout: 10000,
            headers: {
                'Authorization': `Token ${token}`
            }, data,
        })
    } catch (error) {
        ErrorLogging.push("uploadPhoto", error);
        throw error
    }
};

export const deleteImage = async (id) => {
    try {
        let {url, token} = await getAuth();
        url = url.substr(0, url.length - 5);
        return await axios({
            method: 'delete',
            timeout: 10000,
            url: `${url}/internal/images/${id}/`,
            headers: {
                'Authorization': `Token ${token}`
            }
        })
    } catch (error) {
        ErrorLogging.push("deleteImage", error);
        return null;
    }
};

export const sendFeedback = async (id, data) => {
    try {
        let {url, token} = await getAuth();
        return await axios({
            method: 'post',
            url: `${url}/agents/${id}/helpdesk/`,
            timeout: 10000,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            data
        })
    } catch (error) {
        ErrorLogging.push("sendFeedback", error);
        return null;
    }
};

export default {
    makeVisit,
    getVisitDetails,
    getAgents,
    getAgentUpdates,
    uploadPhoto,
    getVisitsByAgent,
    deleteImage,
    sendFeedback
}