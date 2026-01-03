import axios from 'axios';

const http = axios.create({
    baseURL: import.meta.env.VITE_CLIENT_HOST,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export default {
    http,
}