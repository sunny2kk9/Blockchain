'use client';

import { getRandomImage } from "@/helpers/getImageUrlRandom";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getOrderStatusText } from "@/helpers/getOrderStatusText";
import { OrderStatusText } from "@/enums/order.enum";
import { getProductImage } from "@/helpers/getProductImage";

interface Props {
    data: any
}

const OrderCard: React.FC<any> = ({ data }: Props) => {
    const [randomImage, setRandomImage] = useState('');

    useEffect(() => {
        setRandomImage(getRandomImage())
    }, []);

    return (
        <div className="bg-white shadow-xl rounded-lg transform hover:scale-105 transition duration-500">
            <div className="aspect-w-3 aspect-h-2">
                <img className="object-cover shadow-lg rounded-t-lg h-48 w-full" src={getProductImage(data?.product?.name)} alt="Order" />
            </div>
            <div className="p-6 relative">
                <div className="bg-pink-700 text-white absolute top-5 right-0 p-2">
                    <p>{data.status ? getOrderStatusText(Number(data.status)) : OrderStatusText.ORDERED}</p>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Product: {data.product.name}</h3>
                <p><small>Quantity: <b>{data.quantity}</b></small></p>
                <p><small>Amount: <b>{data.amount}</b></small></p>
                <p><small>Requested Date: <b>{data.requestDate}</b></small></p>
                <p><small>Description: <b>{data.description}</b></small></p>
                <Link href={{ pathname: '/orders/details', query: { orderId: data?.orderId } }} className="block w-full text-center p-3 mt-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    View Details
                </Link>

            </div>
        </div>
    );
}
export default OrderCard;