import axios from "axios";
import apiCall from "./api";

const axiosInstanceProperty = axios.create({
    baseURL: `https://u0zegq6xjp-u0kz8fuj6e-connect.us0-aws.kaleido.io/instances/${process.env.NEXT_PUBLIC_KALEIDO_INSTANCE_MENU}`,
    timeout: 10000,
});

export const getAllCategories = () => {
    return apiCall<any>(axiosInstanceProperty, 'get', `/getAllCategories?kld-from=${process.env.NEXT_PUBLIC_KID}`);
}

export const getProductsByCategory = (categoryId: any) => {
    return apiCall<any>(axiosInstanceProperty, 'get', `/getProductsByCategory?_categoryId=${categoryId}&kld-from=${process.env.NEXT_PUBLIC_KID}`);
}

export const getProductById = (productId: any) => {
    return apiCall<any>(axiosInstanceProperty, 'get', `/getProduct?_id=${productId}&kld-from=${process.env.NEXT_PUBLIC_KID}`);
}

export const getAllIngredients = () => {
    return apiCall<any>(axiosInstanceProperty, 'get', `/getAllIngredients?kld-from=${process.env.NEXT_PUBLIC_KID}`);
}


