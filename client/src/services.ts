import axios from 'axios';

const http = axios.create({
    baseURL: `http://${import.meta.env.VITE_SERVER_HOST}:${import.meta.env.VITE_SERVER_PORT}`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export default {
    http,
}