import axios from 'axios';

const fetchAPI = (options = {}) => {
  const defaultConfig = {
    method: 'get',
    timeout: 10000,
    data: null,
    url: '/',
    baseURL: 'http://localhost:8000/',
  };

  const axiosConfig = {
    ...defaultConfig,
    ...options,
  };

  return axios(axiosConfig);
};

export default fetchAPI;
