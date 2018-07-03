// import { base_url } from '../utils/api'
import axios from 'axios'
import {AsyncStorage} from "react-native";
import ErrorLogging from "../utils/Errors";
import {UPLOAD_PROGRESS, UPLOAD_PROGRESS_END} from "../actions/photo";
import * as URI from "uri-js";

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
    let url = await AsyncStorage.getItem("@url");
    let token = await AsyncStorage.getItem("@token");
    return {url, token}
};

export const getPins = async () => {
    const source = axios.CancelToken.source();
    setTimeout(() => {
        source.cancel("getPins Timeout by timer");
    }, 7000);
    try {
        return await axios({
            method: 'get',
            url: `https://app.inspector-cloud.ru/befda61b-95be-4f1e-8297-ae5ed7c8b3ce/instanse.json`,
            headers: {
                'user-Agent': 'okhttp/3.6.0',
                'Cache-Control': 'no-cache'
            },
            // url: `https://cloud-inspector-dev.firebaseio.com/instance.json`,
            cancelToken: source.token,
        })
    } catch (error) {
        ErrorLogging.push("getPins", error);
        return null
    }
};

export const getRatioExceptions = async () => {
    const source = axios.CancelToken.source();
    setTimeout(() => {
        source.cancel("getRatioExceptions Timeout by timer");
    }, 2000);
    try {
        return await axios({
            method: 'get',
            url: `https://app.inspector-cloud.ru/befda61b-95be-4f1e-8297-ae5ed7c8b3ce/app_models.json`,
            cancelToken: source.token,
        })
    } catch (error) {
        ErrorLogging.push("getRatioExceptions", error);
        return null
    }
};

export const getStats = async (id) => {
    const source = axios.CancelToken.source();
    try {
        const {url, token} = await getAuth();
        setTimeout(() => {
            source.cancel("getStats Timeout by timer");
        }, 7000);
        return await axios({
            method: 'get',
            validateStatus: null,
            url: `${url}/agents/${id}/stats/`,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            cancelToken: source.token,
        })
    } catch (error) {
        ErrorLogging.push("getStats", error);
        return null
    }
};

export const getTasks = async () => {
    const source = axios.CancelToken.source();
    try {
        const {url, token} = await getAuth();
        setTimeout(() => {
            source.cancel("getTasks Timeout by timer");
        }, 7000);
        return await axios({
            method: 'get',
            url: `${url}/visit_task/`,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            cancelToken: source.token,
        })
    } catch (error) {
        ErrorLogging.push("getTasks", error);
        return null
    }
};

export const getTasksFetch = async (data) => {
    try {
        const {url, token} = await getAuth();
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
    const source = axios.CancelToken.source();
    try {
        const {url, token} = await getAuth();
        setTimeout(() => {
            source.cancel("createAgent Timeout by timer");
        }, 10000);
        return await axios({
            method: 'post',
            url: `${url}/agents/`,
            cancelToken: source.token,
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
    const source = axios.CancelToken.source();
    try {
        const {url, token} = await getAuth();
        setTimeout(() => {
            source.cancel("updateVisit Timeout by timer");
        }, 7000);
        return await axios({
            method: 'patch',
            url: `${url}/visits/${id}/`,
            cancelToken: source.token,
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
    const source = axios.CancelToken.source();
    try {
        const {url, token} = await getAuth();
        setTimeout(() => {
            source.cancel("patchAgent Timeout by timer");
        }, 15000);
        return await axios({
            method: 'patch',
            url: `${url}/agents/${id}/`,
            cancelToken: source.token,
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
    const source = axios.CancelToken.source();
    const {url, token} = await getAuth();
    if (timeout) {
        setTimeout(() => {
            source.cancel("makeVisit Timeout by timer");
        }, 5000);
    }
    try {
        return await axios({
            method: 'post',
            url: `${url}/agents/${id}/visits/`,
            cancelToken: source.token,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            data
        })
    } catch (error) {
        ErrorLogging.push("makeVisit", error);
        return null
    }
};

export const getVisitDetails = async (id) => {
    const source = axios.CancelToken.source();
    try {
        const {url, token} = await getAuth();
        setTimeout(() => {
            source.cancel("getVisitDetails Timeout by timer");
        }, 5000);
        return await axios({
            method: 'get',
            url: `${url}/visits/${id}/`,
            validateStatus: null,
            cancelToken: source.token,
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
    const source = axios.CancelToken.source();
    try {
        const {url, token} = await getAuth();
        setTimeout(() => {
            source.cancel("getAgents Timeout by timer");
        }, 5000);
        return await axios({
            method: 'get',
            url: `${url}/agents`,
            cancelToken: source.token,
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
    const source = axios.CancelToken.source();
    try {
        const {url, token} = await getAuth();
        setTimeout(() => {
            source.cancel("updateAgent Timeout by timer");
        }, 5000);
        return await axios({
            method: 'put',
            url: `${url}/agents/${id}/`,
            cancelToken: source.token,
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
    const source = axios.CancelToken.source();
    try {
        const {url, token} = await getAuth();
        setTimeout(() => {
            source.cancel("getAgentUpdates Timeout by timer");
        }, 5000);
        return await axios({
            method: 'get',
            url: `${url}/agents/${id}/updates/`,
            cancelToken: source.token,
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
    const source = axios.CancelToken.source();
    try {
        const {url, token} = await getAuth();
        setTimeout(() => {
            source.cancel("getVisitsByAgent Timeout by timer");
        }, 7000);
        return await axios({
            method: 'get',
            url: `${url}/agents/${id}/visits/`,
            cancelToken: source.token,
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

export const uploadPhoto = async (id, data, dispatch, uri) => {
    const payload = {uri};
    try {
        const {url, token} = await getAuth();
        return await axios({
            method: 'post',
            url: `${url}/visits/${id}/scene/0/upload/`,
            onUploadProgress: function (progressEvent) {
                payload.data = {
                    loaded: progressEvent.loaded,
                    total: progressEvent.total
                };
                dispatch({type: UPLOAD_PROGRESS, payload})
            },
            headers: {
                'Authorization': `Token ${token}`
            }, data,
        })
    } catch (error) {
        ErrorLogging.push("uploadPhoto", error);
        payload.error = error;
        dispatch({type: UPLOAD_PROGRESS_END, payload});
        throw error
    }
};

export const deleteImage = async (id) => {
    const source = axios.CancelToken.source();
    try {
        let {url, token} = await getAuth();
        const parsed = URI.parse(url);
        url = parsed.scheme + ":\\\\" + parsed.host;
        setTimeout(() => {
            source.cancel("deleteImage Timeout by timer");
        }, 10000);
        return await axios({
            method: 'delete',
            cancelToken: source.token,
            url: `${url}/api/internal/images/${id}/`,
            headers: {
                'Authorization': `Token ${token}`
            }
        })
    } catch (error) {
        console.log(error);
        ErrorLogging.push("deleteImage", error);
        return null;
    }
};

export const sendFeedback = async (id, data) => {
    const source = axios.CancelToken.source();
    try {
        let {url, token} = await getAuth();
        setTimeout(() => {
            source.cancel("sendFeedback Timeout by timer");
        }, 10000);
        return await axios({
            method: 'post',
            url: `${url}/agents/${id}/helpdesk/`,
            cancelToken: source.token,
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