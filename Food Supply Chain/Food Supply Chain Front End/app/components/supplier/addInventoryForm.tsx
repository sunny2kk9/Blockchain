'use client';

import React, { useState } from 'react';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/16/solid';
import { Item } from '@/interfaces/item.interface';



const AddInventoryForm: React.FC = () => {
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

    const [selectedItems, setSelectedItems] = useState<Item[]>([{ id: 0, name: '', quantity: 0 }]);

    const handleAddItem = () => {
        setSelectedItems([...selectedItems, { id: 0, name: '', quantity: 0 }]);
    };

    const handleItemChange = (index: number, field: string, value: string) => {
        const updatedItems: any = [...selectedItems];
        updatedItems[index][field] = value;
        setSelectedItems(updatedItems);
    };

    const handleRemoveItem = (index: number) => {
        const updatedItems = [...selectedItems];
        updatedItems.splice(index, 1);
        setSelectedItems(updatedItems);
    };

    return (
        <div className='bg-white p-20'>
            <h2 className='text-base sm:text-lg lg:text-xl text-center font-bold mb-16'>Add Supplier Inventory Form</h2>

            {selectedItems.map((item, index) => (
                <div key={index} className="mb-4 flex">
                    <div className='w-1/2 mr-4'>
                        <label className="w-full block text-gray-700 text-sm font-bold mb-2" htmlFor={`category${index}`}>
                            Category
                        </label>
                        <select
                            id={`category${index}`}
                            name={`category${index}`}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={item.id}
                            onChange={(e) => handleItemChange(index, 'id', e.target.value)}
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

                    <div className='w-1/2 mr-4'>
                        <label className="w-full block text-gray-700 text-sm font-bold mb-2" htmlFor={`itemName${index}`}>
                            Item Name
                        </label>
                        <select
                            id={`itemName${index}`}
                            name={`itemName${index}`}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={item.id}
                            onChange={(e) => handleItemChange(index, 'id', e.target.value)}
                            required
                        >
                            <option value="">Select Item Name</option>
                            {ITEMS.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='w-1/2'>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Quantity
                        </label>
                        <input
                            type="number"
                            min="1"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            required
                        />
                    </div>

                    {index > 0 && (
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold px-2 rounded focus:outline-none focus:shadow-outline mt-4 ml-4"
                            onClick={() => handleRemoveItem(index)}
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            ))}

            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex"
                onClick={handleAddItem}
            >
                <PlusCircleIcon className="w-6 h-6 mr-2" />
                <span>Add Item</span>
            </button>
        </div>
    );
};

export default AddInventoryForm;