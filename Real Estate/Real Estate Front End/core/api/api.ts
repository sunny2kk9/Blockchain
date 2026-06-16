import { AxiosInstance, AxiosRequestConfig } from 'axios';

const headers = {
    'Authorization': `Basic ${process.env.NEXT_PUBLIC_AUTHORIZATION}`,
    'Content-Type': 'application/json'
}

const apiCall = async <T>(
    axiosInstance: AxiosInstance,
    method: AxiosRequestConfig['method'],
    url: string,
    data: any = null,
    customHeader: any = null
): Promise<T> => {
    try {
        const response = await axiosInstance.request<T>({
            method,
            url,
            data,
            headers: {
                ...headers,
                ...customHeader
            },
        });
        return response.data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};

export default apiCall;
