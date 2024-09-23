import axios from 'axios';

const baseUrl = 'http://localhost:3001/persons';  // Ensure this is correct
 // Adjust the URL as per your backend

const getAll = () => {
  return axios.get(baseUrl).then((response) => response.data);
};

const create = (newPerson) => {
  return axios
    .post(baseUrl, newPerson)
    .then((response) => response.data)
    .catch((error) => {
      console.error('Failed to create a new person:', error);
      throw error;
    });
};

const update = (id, updatedPerson) => {
  return axios
    .put(`${baseUrl}/${id}`, updatedPerson)
    .then((response) => response.data)
    .catch((error) => {
      console.error('Failed to update person:', error);
      throw error;
    });
};

const remove = (id) => {
  return axios
    .delete(`${baseUrl}/${id}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error('Failed to delete person:', error);
      throw error;
    });
};

export default { getAll, create, update, remove };
