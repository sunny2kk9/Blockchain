'use client';

import { useState } from "react";
import useLoadingStore from "@/store/LoadingStore";
import useUserStore from "@/store/user.store";
import { paymentStaus } from "@/core/api/orders";

const Payment: React.FC<any> = ({ orderDetails, productDetails, orderProcessedDetails, processTrigger }) => {

    const user = useUserStore((state) => state.user);
    const loadingStore = useLoadingStore();

    console.log("orderDetails", orderDetails);
    console.log("productDetails", productDetails);
    console.log("orderProcessedDetails", orderProcessedDetails);
    console.log("processTrigger", processTrigger);

    const onAccept = () => {
        loadingStore.setIsLoading(true);

        const payload = {
            "_orderId": orderDetails.orderId,
            "_status": 11
        }

        paymentStaus(payload)
            .then(response => {
                console.log('paymentStaus Response:', response);

                processTrigger();
            })
            .catch(error => {
                console.error('Error:', error);
            });

        loadingStore.setIsLoading(false);
    }

    const onReject = () => {
        loadingStore.setIsLoading(true);

        const payload = {
            "_orderId": orderDetails.orderId,
            "_status": 12
        }

        paymentStaus(payload)
            .then(response => {
                console.log('paymentStaus Response:', response);

                processTrigger();
            })
            .catch(error => {
                console.error('Error:', error);
            });

        loadingStore.setIsLoading(false);
    }


    return (
        <div>
            {
                user?.userType == "RT" ?
                    <>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={() => onAccept()}
                        >
                            Payment in Tokens
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={() => onReject()}
                        >
                            Payment Hold/Failed
                        </button>
                    </>
                    :
                    null
            }
        </div>
    );
}
export default Payment;