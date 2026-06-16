'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Item } from '@/interfaces/item.interface';
import { getAllCategories, getProductsByCategory } from "@/core/api/menu";
import { createOrder } from '@/core/api/orders';
import useLoadingStore from "@/store/LoadingStore";
import { getProductImage, placeholderImage, productImageList } from '@/helpers/getProductImage';

const PlaceOrderForm: React.FC = () => {
    const router = useRouter();
    const loadingStore = useLoadingStore();

    const [category, setCategory] = useState("");
    const [itemName, setItemName] = useState("");
    const [itemImage, setItemImage] = useState(placeholderImage);
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [qty, setQty] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [requestedDate, setRequestedDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    useEffect(() => {
        loadingStore.setIsLoading(true);
        const fetchCategories = async () => {
            try {
                const res = await getAllCategories();
                if (res?.output && Array.isArray(res.output)) {
                    setCategories(res.output);
                } else {
                    // Handle error or empty response
                }
                loadingStore.setIsLoading(false);
            } catch (error) {
                // Handle error
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryChange = async (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedCategoryId = e.target.value;
        setCategory(selectedCategoryId);
        if (selectedCategoryId) {
            try {
                const res = await getProductsByCategory(selectedCategoryId);
                if (res?.output && Array.isArray(res.output)) {
                    setItems(res.output);
                } else {
                    // Handle error or empty response
                }
            } catch (error) {
                // Handle error
            }
        } else {
            setItems([]);
        }
    };

    const onProductChange = (value: any) => {
        const selectedItemId = value;
        setItemName(selectedItemId);

        const selectedItemName = productImageList.find(item => item.id == selectedItemId)?.name as string;
        const productImage = getProductImage(selectedItemName) ? getProductImage(selectedItemName) : placeholderImage;
        setItemImage(productImage);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        loadingStore.setIsLoading(true);
        try {
            if (!itemName) {
                throw new Error("Item name is required");
            }

            const formData = {
                _amount: amount,
                _desc: description, // Assuming 'description' is the value of your textarea input
                _productId: itemName, // Assuming 'itemName' is the selected product ID
                _qty: qty,
                _requestDate: requestedDate,
            };

            // Call makeCreateOrder function with formData
            const response = await createOrder(formData);

            loadingStore.setIsLoading(false);
            // Handle success response
            console.log("Order created successfully", response);
            router.push('/orders/list');
        } catch (error) {
            // Handle error
            console.error("Error creating order:", error);
        }
    };

    return (
        <div className='bg-white p-20'>
            <h2 className='text-base sm:text-lg lg:text-xl text-center font-bold mb-16'>Place Order</h2>
            <div className="flex">
                <div className='w-1/2'>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 flex items-center">
                            <label htmlFor="Category" className="w-1/4">Category:</label>
                            <select
                                id="category"
                                name="category"
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={category}
                                onChange={handleCategoryChange}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((category: any) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4 flex items-center">
                            <label htmlFor="Category" className="w-1/4">Product:</label>
                            <select
                                id="itemName"
                                name="itemName"
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={itemName}
                                onChange={(e) => onProductChange(e.target.value)}
                                required
                            >
                                <option value="">Select Product</option>
                                {items.map((item: any) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4 flex items-center">
                            <label htmlFor="name" className="w-1/4">Quantity:</label>
                            <input
                                type="number"
                                id="quantity"
                                min="1"
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Quantity"
                                value={qty}
                                onChange={(e) => setQty(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4 flex items-center">
                            <label htmlFor="name" className="w-1/4">Amount:</label>
                            <input
                                type="number"
                                id="amount"
                                min="1"
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4 flex items-center">
                            <label htmlFor="name" className="w-1/4">Requested Date:</label>
                            <input
                                type="date"
                                id="requestedDate"
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={requestedDate}
                                onChange={(e) => setRequestedDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4 flex items-center">
                            <label htmlFor="message" className="w-1/4">Description:</label>
                            <textarea
                                id="description"
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <div className="mb-4 flex justify-end">
                            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Submit</button>
                        </div>
                    </form>
                </div>
                <div className='w-1/2'>
                    <img className='p-16' style={{ height: '500px', objectFit: 'cover' }} src={itemImage} width={500} height={500} alt={itemName} />
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderForm;
