'use client';

import { useState } from "react";
import useLoadingStore from "@/store/LoadingStore";
import useUserStore from "@/store/user.store";
import { orderDispatch } from "@/core/api/orders";

const Dispatch: React.FC<any> = ({ orderDetails, productDetails, orderProcessedDetails, processTrigger }) => {

    const user = useUserStore((state) => state.user);
    const loadingStore = useLoadingStore();

    console.log("orderDetails", orderDetails);
    console.log("productDetails", productDetails);
    console.log("orderProcessedDetails", orderProcessedDetails);
    console.log("processTrigger", processTrigger);

    const onDispatch = () => {
        loadingStore.setIsLoading(true);

        const payload = {
            "_orderId": orderDetails.orderId
        }

        orderDispatch(payload)
            .then(response => {
                console.log('orderDispatch Response:', response);

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
                user?.userType == "MD" ?
                    <>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={() => onDispatch()}
                        >
                            Dispatch Order
                        </button>
                    </>
                    :
                    null
            }
        </div>
    );
}
export default Dispatch;