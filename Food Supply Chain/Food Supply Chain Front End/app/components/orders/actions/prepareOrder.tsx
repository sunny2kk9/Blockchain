'use client';

import { useState } from "react";
import useLoadingStore from "@/store/LoadingStore";
import useUserStore from "@/store/user.store";
import { prepareOrder } from "@/core/api/orders";

const PrepareOrder: React.FC<any> = ({ orderDetails, productDetails, processTrigger }) => {
    const user = useUserStore((state) => state.user);
    const loadingStore = useLoadingStore();

    const [manufactureDate, setManufactureDate] = useState('');
    const [useByDate, setUseByDate] = useState('');
    const [minTemp, setMinTemp] = useState('');
    const [maxTemp, setMaxTemp] = useState('');
    const [humidity, setHumidity] = useState('');
    const [orderId, setOrderId] = useState(orderDetails.orderId);
    const [productId, setProductId] = useState(orderDetails.productId);

    console.log("orderDetails", orderDetails);
    console.log("productDetails", productDetails);
    console.log("processTrigger", processTrigger);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadingStore.setIsLoading(true);

        const payload = {
            "_humidity": humidity,
            "_ingredientsIds": [],
            "_manufacturedDate": manufactureDate,
            "_maxTemp": maxTemp,
            "_minTemp": minTemp,
            "_orderId": orderId,
            "_productId": productId,
            "_useByDate": useByDate
        }

        prepareOrder(payload)
            .then(response => {
                console.log('prepareOrder Response:', response);

                processTrigger();
            })
            .catch(error => {
                console.error('Error:', error);
            });

        loadingStore.setIsLoading(false);
    }

    return (
        <div>
            <h3 className="font-bold mb-4">Enter Manufacture Details</h3>

            <div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Manufactured Date
                        </label>
                        <input
                            type="date"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Date"
                            value={manufactureDate}
                            onChange={(e) => setManufactureDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Use By Date
                        </label>
                        <input
                            type="date"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Date"
                            value={useByDate}
                            onChange={(e) => setUseByDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Minimum Temperature
                        </label>
                        <input
                            type="number"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Minimum Temperature"
                            value={minTemp}
                            onChange={(e) => setMinTemp(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Maximum Temperature
                        </label>
                        <input
                            type="number"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Maximum Temperature"
                            value={maxTemp}
                            onChange={(e) => setMaxTemp(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Humidity
                        </label>
                        <input
                            type="number"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Humidity"
                            value={humidity}
                            onChange={(e) => setHumidity(e.target.value)}
                            required
                        />
                    </div>

                    {
                        user?.userType == "MD" ?
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit"
                            >
                                Order Prepared
                            </button>
                            :
                            null
                    }
                </form>
            </div>
        </div>
    );
}
export default PrepareOrder;