import { base_url } from '../utils/api'
import axios from 'axios'

const token = '5969cde32ee95eaa406baffefe9f6f899c2a8eec'

export const getVisitDetail = async (id) => {
  try {
    return await axios({
      method: 'get',
      url: `${base_url}/visits/${id}`,
      timeout: 2000,
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
    })
  } catch (error) {
    return null
  }
}

export const createAgent = async (data) => {
  try {
    return await axios({
      method: 'post',
      url: `${base_url}/agents/`,
      timeout: 2000,
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

export const makeVisit = async (id = 1, data) => {
  try {
    return await axios({
      method: 'post',
      // url: `${base_url}/agents/${7}/visits/`,
      url: `${base_url}/agents/${id}/visits/`,
      timeout: 2000,
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

export const getVisitDetails = async (id) => {
  try {
    return await axios({
      method: 'get',
      url: `${base_url}/visits/${id}/`,
      timeout: 2000,
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
    })
  } catch (error) {
    return null
  }
}

export const getAgents = async (id) => {
  try {
    return await axios({
      method: 'get',
      url: `${base_url}/agents`,
      timeout: 2000,
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
    })
  } catch (error) {
    return null
  }
}

export const getAgentUpdates = async (id = 1) => {
  try {
    return await axios({
      method: 'get',
      url: `${base_url}/agents/${id}/updates/`,
      timeout: 2000,
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
    })
  } catch (error) {
    return null
  }
}

export const getVisitsByAgent = async (id = 1) => {
  try {
    return await axios({
      method: 'get',
      url: `${base_url}/agents/${id}/visits/`,
      timeout: 2000,
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
    })
  }
  catch (error) {
    throw error
  }
}

export const uploadPhoto = async (id, data) => {
  try {
    return await axios({
      method: 'post',
      url: `${base_url}/visits/${id}/scene/0/upload/`,
      timeout: 1000,
      headers: {
        'Authorization': `Token ${token}`
      }, data,
    })
  } catch (error) {
    throw error
  }
}

export default {
  getVisitDetail, makeVisit, getVisitDetails, getAgents, getAgentUpdates, uploadPhoto, getVisitsByAgent
}