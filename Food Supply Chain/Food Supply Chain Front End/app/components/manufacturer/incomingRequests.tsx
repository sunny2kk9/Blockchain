import React from 'react';
import Link from 'next/link';
import { IPurchaseOrder } from '@/interfaces/purchase-order.interface';
import { PlusCircleIcon } from '@heroicons/react/16/solid';

const IncomingRequestsComp: React.FC = () => {
    const purchaseOrders: IPurchaseOrder[] = [
        {
            category: "Electronics",
            productName: "Laptop",
            quantity: 5,
            price: 1200,
            reqDate: "2024-02-23",
            startDate: "2024-02-25",
            endDate: "2024-03-25",
            frequency: "1 weekly",
            attachmentUrl: "https://example.com/attachment1.pdf"
        },
        {
            category: "Clothing",
            productName: "T-Shirt",
            quantity: 10,
            price: 25,
            reqDate: "2024-02-24",
            startDate: "2024-02-26",
            endDate: "2024-03-26",
            frequency: "2 weekly",
            attachmentUrl: "https://example.com/attachment2.pdf"
        },
        {
            category: "Books",
            productName: "Book",
            quantity: 3,
            price: 15,
            reqDate: "2024-02-25",
            startDate: "2024-02-27",
            endDate: "2024-03-27",
            frequency: "Monthly",
            attachmentUrl: "https://example.com/attachment3.pdf"
        },
        {
            category: "Books",
            productName: "Book",
            quantity: 3,
            price: 15,
            reqDate: "2024-02-25",
            startDate: "2024-02-27",
            endDate: "2024-03-27",
            frequency: "Monthly",
            attachmentUrl: "https://example.com/attachment3.pdf"
        }
    ];

    return (
        <div className='bg-white p-20'>
            <h2 className='text-base sm:text-lg lg:text-xl text-center font-bold'>Purchase Orders</h2>

            <div className='my-8 flex justify-center'>
                <Link href={'/manufacturer/backed-inventory'} className="bg-teal-500 mr-4 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex">
                    <span>Add Backed Inventory</span>
                        <PlusCircleIcon className="w-5 h-5 ml-2 mt-0.5" />
                </Link>
                <button className="bg-purple-500 mr-4 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex">
                    <span>Send Approvals</span>
                    <PlusCircleIcon className="w-5 h-5 ml-2 mt-0.5" />
                </button>
            </div>

            <div className='flex'>
                {purchaseOrders.map((order, index) => (
                    <div key={index} className="bg-gray-100 p-6 rounded-lg mb-4 mr-3 w-1/4">
                        <h3 className="text-lg font-bold mb-4">Purchase Order {index + 1}</h3>
                        <p><strong>Category:</strong> {order.category}</p>
                        <p><strong>Product Name:</strong> {order.productName}</p>
                        <p><strong>Quantity:</strong> {order.quantity}</p>
                        <p><strong>Price:</strong> ${order.price}</p>
                        <p><strong>Requested Date:</strong> {order.reqDate}</p>
                        <p><strong>Start Date:</strong> {order.startDate}</p>
                        <p><strong>End Date:</strong> {order.endDate}</p>
                        <p><strong>Frequency:</strong> {order.frequency}</p>
                        <p><strong>Attachment:</strong> <a className='text-blue-500' href={order.attachmentUrl}>Download</a></p>

                        <div className='mt-4'>
                            <button className="bg-blue-500 mr-4 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                Accept
                            </button>
                            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IncomingRequestsComp;
