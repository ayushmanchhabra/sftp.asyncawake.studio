import axios from 'axios';

const http = axios.create({
    baseURL: 'https://api.asyncawake.studio',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export default {
    http,
}