import axios from 'axios'
const baseUrl = '/api/blogs'

let token = null

const setToken = (newToken) => {
  token = newToken ? `bearer ${newToken}` : null; // Ensure it's prefixed with "bearer"
};
const getAll = () => {
  const config = {
    headers: { Authorization: token }, // Include token in request headers
};
  const request = axios.get(baseUrl, config)
  return request.then(response => response.data)
}

const create = async newObject =>{
  const config = {
    headers: { Authorization: token},
  }
  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = (id, newObject) => {
  const config = {
    headers: { Authorization: token},
  }
  const request = axios.put(`${ baseUrl }/${id}`, newObject, config)
  return request.then(response => response.data)
}

const remove = async(id) =>{
  const config = {
    headers: {Authorization: token},
  }
  const response = await axios.delete(`${ baseUrl }/${id}`, config)
  return response.data
}


// Export the new function
export default { getAll, create, update, setToken, remove };

