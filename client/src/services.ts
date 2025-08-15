import axios from 'axios';

const http = axios.create({
    baseURL: import.meta.env.DEV ? `https://${import.meta.env.VITE_SERVER_HOST}:${import.meta.env.VITE_SERVER_PORT}` : 'https://api.asyncawake.studio',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export default {
    http,
}