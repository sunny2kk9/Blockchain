import axios from "axios";
import apiCall from "./api";

const axiosInstanceProperty = axios.create({
    baseURL: `https://u0n4eimxc2-u0r2he3aeq-connect.us0-aws.kaleido.io/instances/${process.env.NEXT_PUBLIC_KALEIDO_INSTANCE_PROPERTY}`, 
    timeout: 10000,
});

export const enrollProperty = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/enrollProperty?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const getAllProperties = () => {
    return apiCall<any>(axiosInstanceProperty, 'get', `/getAllPropertiesForSale?kld-from=${process.env.NEXT_PUBLIC_KID}`);
}

export const getOwnedProperties = (ownerId: any) => {
    return apiCall<any>(axiosInstanceProperty, 'get', `/getAllOwnedProperties?_owner=${ownerId}&kld-from=${process.env.NEXT_PUBLIC_KID}`);
}

export const makePropertyForSale = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/makePropertyForSale?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const makePropertyForNoSale = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/makePropertyForNoSale?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const getSinglePropertyDetails = (perpertyId: any) => {
    return apiCall<any>(axiosInstanceProperty, 'get', `/getSinglePropertyDetails?_id=${perpertyId}&kld-from=${process.env.NEXT_PUBLIC_KID}`);
}