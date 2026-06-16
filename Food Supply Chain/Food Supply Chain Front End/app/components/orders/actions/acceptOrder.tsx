'use client';

import useLoadingStore from "@/store/LoadingStore";
import useUserStore from "@/store/user.store";
import { processOrder } from "@/core/api/orders";

interface Prop {
    orderDetails: any,
    processTrigger: () => void
}

const AcceptOrder: React.FC<any> = ({ orderDetails, processTrigger }: Prop) => {
    const user = useUserStore((state) => state.user);
    const loadingStore = useLoadingStore();

    console.log('orderDetails', orderDetails);
    console.log('userDetails', user);

    const onAccept = () => {
        loadingStore.setIsLoading(true);

        const payload = {
            "_orderId": orderDetails.orderId,
            "_status": 2
        }

        processOrder(payload)
            .then(response => {
                console.log('acceptOrder Response:', response);

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
            "_status": 3
        }

        processOrder(payload)
            .then(response => {
                console.log('rejectOrder Response:', response);

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
                            onClick={() => onAccept()}
                        >
                            Accept Order
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={() => onReject()}
                        >
                            Reject Order
                        </button>
                    </>
                    :
                    null
            }
        </div>
    );
}
export default AcceptOrder;