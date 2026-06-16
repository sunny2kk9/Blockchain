'use client';

import { useEffect, useState } from "react";
import useLoadingStore from "@/store/LoadingStore";
import { getAllOrders } from "@/core/api/orders";
import { getProductById } from "@/core/api/menu";
import OrderCard from "./orderCard";

const DisplayAllOrdersComp: React.FC = () => {
    const loadingStore = useLoadingStore();
    const [allOrders, setAllOrders] = useState<any[]>([]);

    useEffect(() => {
        onGetAllOrders();
    }, []);

    const onGetAllOrders = async () => {
        loadingStore.setIsLoading(true);

        try {
            // Get all orders
            const resProp = await getAllOrders();
            console.log('Response:', resProp);
            const orders = resProp?.output || [];
            const finalOrders: any = [];

            // Iterate over each property
            await Promise.all(orders.map(async (order: any) => {
                // Get all transactions for the current property
                const resProd: any = await getProductById(order.productId);
                const product = resProd?.output || "";
                console.log('Product Details:', product);

                finalOrders.push({ ...order, product });
            }));

            setAllOrders(finalOrders);
            console.log('Response:', allOrders);

            loadingStore.setIsLoading(false);

        } catch (error) {
            console.error('Error:', error);
        }
    };


    return (
        <section className="bg-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                    {
                        allOrders.map((p, i) => {
                            console.log('Order:', p);
                            return (
                                <div key={i}>
                                    <OrderCard data={p} />
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </section>
    );
}
export default DisplayAllOrdersComp;