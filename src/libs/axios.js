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
        if (error.response) {
            if (error.response.status === 403) {
                alert('이 요청은 거부되었습니다.')
                router.push('/') 
            } else if (error.response.status === 401) {
                alert('접근이 허용되지 않았습니다.')
                router.push('/') 
            } 
        }
        return Promise.reject(error)
    }
)

export default instance
