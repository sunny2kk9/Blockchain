'use client';

import { useState } from "react";
import { USER_ADDRESSES } from "@/constants/users";
import { payTokenAmount } from "@/core/api/transactions";
import useLoadingStore from "@/store/LoadingStore";
import useUserStore from "@/store/user.store";
import GetUserName from "@/helpers/getUserNameById";

const TokenToPay: React.FC<any> = ({ propertyDetails, processTrigger }) => {
    const user = useUserStore((state) => state.user);
    const loadingStore = useLoadingStore();

    const [amount, setAmount] = useState('');
    const [finalAmount, setFinalAmount] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadingStore.setIsLoading(true);

        const payload = {
            "_amount": amount,
            "_buyerAddress": USER_ADDRESSES.buyer,
            "_channelPartnerAddress": USER_ADDRESSES.channelPartner,
            "_finalAmount": finalAmount,
            "_fromAddress": user.id,
            "_propertyTokenId": propertyDetails.tokenId,
            "_sellerAddress": propertyDetails.owner
        }

        payTokenAmount(payload)
            .then(response => {
                console.log('Response:', response);

                processTrigger();
            })
            .catch(error => {
                console.error('Error:', error);
            });

            loadingStore.setIsLoading(false);
    }

    return (
        <div>
            <h3 className="font-bold mb-4">Token To Pay</h3>

            <div>
                <p className="mb-4"><strong>Channel Partner Name:</strong> <GetUserName id={USER_ADDRESSES.channelPartner} /></p>
                <p className="mb-4"><strong>Owner:</strong> <GetUserName id={propertyDetails.owner} /></p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Amount
                        </label>
                        <input
                            type="text"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Final Amount
                        </label>
                        <input
                            type="text"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Final Amount"
                            value={finalAmount}
                            onChange={(e) => setFinalAmount(e.target.value)}
                            required
                        />
                    </div>

                    {
                        user?.id == USER_ADDRESSES.buyer ?
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit"
                            >
                                Pay Token
                            </button>
                        :
                        null
                    }
                </form>
            </div>
        </div>
    );
}
export default TokenToPay;