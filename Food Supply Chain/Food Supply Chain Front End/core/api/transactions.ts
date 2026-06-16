import axios from "axios";
import apiCall from "./api";

const axiosInstanceProperty = axios.create({
    baseURL: `https://u0n4eimxc2-u0r2he3aeq-connect.us0-aws.kaleido.io/instances/${process.env.NEXT_PUBLIC_KALEIDO_INSTANCE_TRANSACTIONS}`, 
    timeout: 10000,
});

export const getAllPropertyTransactions = (tokenId: any) => {
    return apiCall<any>(axiosInstanceProperty, 'get', `/getAllPropertyTransactions?_tokenId=${tokenId}&kld-from=${process.env.NEXT_PUBLIC_KID}`);
}

export const payTokenAmount = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/payTokenAmount?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const approveTokenAmount = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/approveTokenAmount?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const legalToApprove = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/legalApproved?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const legalToDisApprove = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/legalDisApproved?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const onAgreementAmount = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/agreementAmount?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const completeTransaction = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/completeTransaction?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const generatePropertyToken = <T>(data: T) => {
    return apiCall<any>(axiosInstanceProperty, 'post', `/generatePropertyToken?kld-from=${process.env.NEXT_PUBLIC_KID}&kld-sync=true`, data, null);
}

export const ownerTokens = (ownerId: any) => {
    return apiCall<any>(axiosInstanceProperty, 'get', `/ownerTokens?_owner=${ownerId}&kld-from=${process.env.NEXT_PUBLIC_KID}`);
}