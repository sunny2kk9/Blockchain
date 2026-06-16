'use client';

import { USER_ADDRESSES } from "@/constants/users";
import { completeTransaction } from "@/core/api/transactions";
import GetUserName from "@/helpers/getUserNameById";
import useLoadingStore from "@/store/LoadingStore";
import useUserStore from "@/store/user.store";

interface Prop {
    propertyDetails: any, 
    propertyTrasnsaction: any, 
    processTrigger: () => void
}

const RegistrationFinal: React.FC<any> = ({ propertyDetails, propertyTrasnsaction, processTrigger }: Prop) => {
    const user = useUserStore((state) => state.user);
    const loadingStore = useLoadingStore();

    const onRegister = () => {
        loadingStore.setIsLoading(true);
        
        const payload = {
            "_amount": propertyTrasnsaction.tokenAmount,
            "_buyerAddress": USER_ADDRESSES.buyer,
            "_channelPartnerAddress": USER_ADDRESSES.channelPartner,
            "_finalAmount": propertyTrasnsaction.finalAmount,
            "_fromAddress": user.id,
            "_propertyTokenId": propertyDetails.tokenId,
            "_sellerAddress": propertyDetails.owner
        }

        completeTransaction(payload)
            .then(response => {
                console.log('legalToDisApprove:', response);
                processTrigger();
            })
            .catch(error => {
                console.error('Error:', error);
            });

        loadingStore.setIsLoading(false);
    }

    return (
        <div>
            <h3 className="font-bold mb-4">Legal To Approve</h3>

            <p className="mb-4"><strong>Channel Partner:</strong> <GetUserName id={propertyTrasnsaction.channlePartnerAddress} /></p>
            <p className="mb-4"><strong>Seller:</strong> <GetUserName id={propertyTrasnsaction.sellerAddress} /></p>
            <p className="mb-4"><strong>Buyer:</strong> <GetUserName id={propertyTrasnsaction.buyerAddress} /></p>
            <p className="mb-4"><strong>Escrow Account Number:</strong> {propertyTrasnsaction.escrowAccount}</p>
            <p className="mb-4"><strong>Registration Amount:</strong> {propertyTrasnsaction.tokenAmount}</p>
            <p className="mb-4"><strong>Final Amount:</strong> {propertyTrasnsaction.finalAmount}</p>

            <button
                className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => onRegister()}
            >
                Complete Registration
            </button>
        </div>
    );
}
export default RegistrationFinal;