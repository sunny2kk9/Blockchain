'use client';

import { Item } from '@/interfaces/item.interface';
import { IBackedInventory } from '@/interfaces/manufacturer-backed-inventory';
import React, { useState } from 'react';

const initialFormValues: IBackedInventory = {
    category: '',
    productName: '',
    quantity: 0,
    ingredientsList: '',
    manufacturingDate: '',
    useByDate: '',
    suggestedTempRange: '',
    humidity: '',
    preOrderFlag: false,
    retailerName: '',
};

const BackedInventoryForm: React.FC = () => {
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

    const [formValues, setFormValues] = useState<IBackedInventory>(initialFormValues);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormValues(prevValues => ({ ...prevValues, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log(formValues);
        // Add your submission logic here
    };

    return (
        <div className="p-20 bg-white">
            <h2 className="text-base sm:text-lg lg:text-xl text-center font-bold mb-16">Backed Inventory Form</h2>

            <form onSubmit={handleSubmit}>
                <div className='flex flex-wrap gap-4'>
                    <div className="mb-4 flex-grow w-1/5">
                        <label htmlFor="category" className="w-full block text-gray-700 text-sm font-bold mb-2">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formValues.category}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                        <label htmlFor="productName" className="w-full block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                        <select
                            id="productName"
                            name="productName"
                            value={formValues.productName}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            <option value="">Select Item</option>
                            {ITEMS.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4 flex-grow w-1/5">
                        <label htmlFor="quantity" className="w-full block text-gray-700 text-sm font-bold mb-2">Quantity</label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={formValues.quantity}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4 flex-grow w-1/5">
                        <label htmlFor="ingredientsList" className="w-full block text-gray-700 text-sm font-bold mb-2">Ingredients List</label>
                        <input
                            type="text"
                            id="ingredientsList"
                            name="ingredientsList"
                            value={formValues.ingredientsList}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4 flex-grow w-1/5">
                        <label htmlFor="manufacturingDate" className="w-full block text-gray-700 text-sm font-bold mb-2">Manufacturing Date</label>
                        <input
                            type="date"
                            id="manufacturingDate"
                            name="manufacturingDate"
                            value={formValues.manufacturingDate}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4 flex-grow w-1/5">
                        <label htmlFor="useByDate" className="w-full block text-gray-700 text-sm font-bold mb-2">Use By Date</label>
                        <input
                            type="date"
                            id="useByDate"
                            name="useByDate"
                            value={formValues.useByDate}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4 flex-grow w-1/5">
                        <label htmlFor="suggestedTempRange" className="w-full block text-gray-700 text-sm font-bold mb-2">Suggested Temp Range</label>
                        <input
                            type="text"
                            id="suggestedTempRange"
                            name="suggestedTempRange"
                            value={formValues.suggestedTempRange}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4 flex-grow w-1/5">
                        <label htmlFor="humidity" className="w-full block text-gray-700 text-sm font-bold mb-2">Humidity</label>
                        <input
                            type="text"
                            id="humidity"
                            name="humidity"
                            value={formValues.humidity}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4 flex-grow w-1/5">
                        <label htmlFor="retailerName" className="w-full block text-gray-700 text-sm font-bold mb-2">Retailer Name</label>
                        <input
                            type="text"
                            id="retailerName"
                            name="retailerName"
                            value={formValues.retailerName}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4 mt-8 flex-grow">
                        <label className="flex items-center">
                            <input type="checkbox" className="form-checkbox text-indigo-600" id="preOrderFlag" name="preOrderFlag" checked={formValues.preOrderFlag} onChange={(e) => handleChange(e)} />
                            <span className="ml-2 text-gray-700 text-sm font-bold">
                                Pre-Order Flag
                            </span>
                        </label>
                    </div>
                </div>
                <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Add Backed Inventory
                </button>
            </form>
        </div>
    );
};

export default BackedInventoryForm;
