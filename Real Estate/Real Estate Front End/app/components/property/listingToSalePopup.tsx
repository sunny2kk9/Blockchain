'use client';

import React, { useState } from 'react';

interface Props {
    setPopupOpen: (status: boolean) => void;
}

const ListingToSalePopup: React.FC<Props> = ({ setPopupOpen }) => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [durationOfPayment, setDurationOfPayment] = useState('');
    const [dealTimePeriod, setDealTimePeriod] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({
            paymentMethod,
            durationOfPayment,
            dealTimePeriod
        });
    };

    const setListingToSale = (status: boolean) => {
        console.log('status popup', status);
        setPopupOpen(status);
    };

    return (
        <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg text-center font-medium leading-6 text-gray-900" id="modal-title">
                                    Listing to Sale
                                </h3>
                                <div className="mt-8">
                                    {/* Payment method dropdown */}
                                    <div className="mb-4">
                                        <label className="w-full block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentMethod">
                                            Payment Method
                                        </label>
                                        <select
                                            id="paymentMethod"
                                            name="paymentMethod"
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Payment Method</option>
                                            <option value="Credit Card">Credit Card</option>
                                            <option value="Bank Transfer">Bank Transfer</option>
                                            <option value="PayPal">PayPal</option>
                                        </select>
                                    </div>
                                    {/* Iniital Amount */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="durationOfPayment">
                                            Iniital Amount
                                        </label>
                                        <input
                                            type="text"
                                            id="durationOfPayment"
                                            name="durationOfPayment"
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            placeholder="Iniital Amount"
                                            value={durationOfPayment}
                                            onChange={(e) => setDurationOfPayment(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {/* Agreement deadline */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dealTimePeriod">
                                            Agreement deadline
                                        </label>
                                        <input
                                            type="text"
                                            id="dealTimePeriod"
                                            name="dealTimePeriod"
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            placeholder="Agreement deadline"
                                            value={dealTimePeriod}
                                            onChange={(e) => setDealTimePeriod(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            onClick={(e) => handleSubmit(e)}
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setListingToSale(false)}
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingToSalePopup;

