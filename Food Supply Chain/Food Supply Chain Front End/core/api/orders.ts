import axios from "axios";
import apiCall from "./api";

const axiosInstanceProperty = axios.create({
    baseURL: `https://u0zegq6xjp-u0kz8fuj6e-connect.us0-aws.kaleido.io/instances/${process.env.NEXT_PUBLIC_KALEIDO_INSTANCE_ORDER}`,
    timeout: 10000,
});

export const getAllOrders = () => {
    return apiCall<any>(axiosInstanceProperty, 'get', `/getAllOrders?kld-from=${process.env.NEXT_PUBLIC_KID}`);
}

export const getOrderDetails = (orderId: any) => {
    return apiCall<any>(axiosInstanceProperty, 'get', `/getOrderDetails?_orderId=${orderId}&kld-from=${process.env.NEXT_PUBLIC_KID}`);
}

export const getOrderProcessingDetails = (orderId: any) => {
    return apiCall<any>(axiosInstanceProperty, 'get', `/getOrderProcessingDetails?_orderId=${orderId}&kld-from=${process.env.NEXT_PUBLIC_KID}`);
}

export const getProductsByCategory = (categoryId: any) => {
    return apiCall<any>(axiosInstanceProperty, 'get', `/getProductsByCategory?_categoryId=${categoryId}&kld-from=${process.env.NEXT_PUBLIC_KID}`);
}

export const processOrder = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/processOrder?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const prepareOrder = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/prepareOrder?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const submitToQA = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/submitToQA?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const qaUpdate = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/qaUpdate?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const orderDispatch = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/orderDispatch?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const retailerAcceptance = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/retailerAcceptance?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const paymentStaus = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/paymentStaus?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const createOrder = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/createOrder?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const logisticsPickup = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/logisticsPickup?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const destinationPort = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/destinationPort?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}


