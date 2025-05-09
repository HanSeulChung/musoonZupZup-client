// src/libs/axios.js
import axios from 'axios'
import router from '@/router' 

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
})

instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 403) {
        alert('접근 권한이 없습니다.')
        router.push('/')
        }
        return Promise.reject(error)
    }
)

export default instance
