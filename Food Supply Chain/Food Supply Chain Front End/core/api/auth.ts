import axios from "axios";
import apiCall from "./api";

const axiosInstanceAuth = axios.create({
    baseURL: `https://u0zegq6xjp-u0kz8fuj6e-connect.us0-aws.kaleido.io/instances/${process.env.NEXT_PUBLIC_KALEIDO_INSTANCE}`, 
    timeout: 10000,
});

export const register = <T>(data: T) => {
    return apiCall<any>(axiosInstanceAuth, 'post', `/addUser?kld-from=${process.env.NEXT_PUBLIC_KID}`, data);
}

export const login = (id: string) => {
    return apiCall<any>(axiosInstanceAuth, 'get', `/getUser?_id=${id}&kld-from=${process.env.NEXT_PUBLIC_KID}`);
}

export const getUsers = () => {
    return apiCall<any>(axiosInstanceAuth, 'get', `/getAllUsers?kld-from=${process.env.NEXT_PUBLIC_KID}`);
}