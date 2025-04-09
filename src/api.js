import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_URL } from '@env'; 

const api = axios.create({
    baseURL: APP_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userInfo');
        if (token) {
            const parsedToken = JSON.parse(token);
            config.headers.Authorization = `Bearer ${parsedToken.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API error: ', error);
        return Promise.reject(error);
    }
);

export default api;
