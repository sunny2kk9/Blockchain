'use client';

import { useState } from "react";
import useLoadingStore from "@/store/LoadingStore";
import useUserStore from "@/store/user.store";
import { destinationPort } from "@/core/api/orders";

const LogisticOrderDelivered: React.FC<any> = ({ orderDetails, productDetails, orderProcessedDetails, processTrigger }) => {

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
            "_status": 9
        }

        destinationPort(payload)
            .then(response => {
                console.log('acceptDelivery Response:', response);

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
                user?.userType == "LG" ?
                    <>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={() => onAccept()}
                        >
                            Deliver Order
                        </button>
                    </>
                    :
                    null
            }
        </div>
    );
}
export default LogisticOrderDelivered;