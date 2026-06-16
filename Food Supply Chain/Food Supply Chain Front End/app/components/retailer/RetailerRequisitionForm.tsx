'use client';

import React, { useState } from 'react';
import { Item } from '@/interfaces/item.interface';

const RetailerRequisitionForm: React.FC = () => {
    const ITEMS: Item[] = [
        { id: 1, name: "Sliced bread" },
        { id: 2, name: "burger buns" },
        { id: 3, name: "pita bread" }
    ];

    const CATEGORIES: Item[] = [
        { id: 1, name: "Bread" },
        { id: 2, name: "Cakes" },
        { id: 3, name: "Pastries" },
        { id: 4, name: "Tortillas" },
    ];

    const [category, setCategory] = useState('');
    const [itemName, setItemName] = useState('');
    const [qty, setQty] = useState('');
    const [requestedDate, setRequestedDate] = useState(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [frequency, setFrequency] = useState('weekly');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
    };

    return (
        <div className='bg-white p-20'>
            <h2 className='text-base sm:text-lg lg:text-xl text-center font-bold mb-16'>Add Retailer Requisition Form</h2>

            <form onSubmit={handleSubmit}>
                <div className='flex flex-wrap gap-4'>
                    <div className="mb-4 flex-grow w-1/5">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">Select Category</option>
                            {CATEGORIES.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4 flex-grow w-1/5">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="itemName">
                            Item Name
                        </label>
                        <select
                            id="category"
                            name="category"
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            required
                        >
                            <option value="">Select Category</option>
                            {ITEMS.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4 flex-grow w-1/5">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                            Quantity
                        </label>
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

                    <div className="mb-4 flex-grow w-1/5">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requestedDate">
                            Requested Date
                        </label>
                        <input
                            type="date"
                            id="requestedDate"
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={requestedDate}
                            onChange={(e) => setRequestedDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4 flex-grow w-1/5">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                            Start Date
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4 flex-grow w-1/5">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                            End Date
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4 flex-grow w-1/5">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="frequency">
                            Frequency
                        </label>
                        <select
                            id="frequency"
                            name="frequency"
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            required
                        >
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                </div>

                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                >
                    Create Retailer Requisition
                </button>
            </form>
        </div>
    );
};

export default RetailerRequisitionForm;
