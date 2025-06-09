import axios from "axios";

const fetchAPI = (options = {}) => {
  const defaultConfig = {
    method: "get",
    timeout: 5000,
    data: {},
    url: "/",
    baseURL: "http://localhost:8000/",
  };

  const axiosConfig = {
    ...defaultConfig,
    ...options,
  };

  return axios(axiosConfig);
};

<<<<<<< HEAD
export default fetchAPI;
=======
export { fetchAPI };
>>>>>>> 6d20355e57951d7fc0081343aee732ce15e82fa0
