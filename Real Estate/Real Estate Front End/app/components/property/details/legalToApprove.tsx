'use client';

import { USER_ADDRESSES } from "@/constants/users";
import { legalToApprove, legalToDisApprove } from "@/core/api/transactions";
import GetUserName from "@/helpers/getUserNameById";
import useLoadingStore from "@/store/LoadingStore";
import useUserStore from "@/store/user.store";

interface Prop {
    propertyDetails: any, 
    propertyTrasnsaction: any, 
    processTrigger: () => void
}

const LegalToApprove: React.FC<any> = ({ propertyDetails, propertyTrasnsaction, processTrigger }: Prop) => {
    const user = useUserStore((state) => state.user);
    const loadingStore = useLoadingStore();
    
    console.log('Property Trasnsaction', propertyTrasnsaction);

    const onLegalApprove = () => {
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

        legalToApprove(payload)
            .then(response => {
                console.log('onLegalApprove:', response);

                processTrigger();
            })
            .catch(error => {
                console.error('Error:', error);
            });
        
        loadingStore.setIsLoading(false);
    }

    const onLegalDisApprove = () => {
        const payload = {
            "_amount": propertyTrasnsaction.tokenAmount,
            "_buyerAddress": USER_ADDRESSES.buyer,
            "_channelPartnerAddress": USER_ADDRESSES.channelPartner,
            "_finalAmount": propertyTrasnsaction.finalAmount,
            "_fromAddress": user.id,
            "_propertyTokenId": propertyDetails.tokenId,
            "_sellerAddress": propertyDetails.owner
        }

        legalToDisApprove(payload)
            .then(response => {
                console.log('legalToDisApprove:', response);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    
    return (
        <div>
            <h3 className="font-bold mb-4">Legal To Approve</h3>

            <p className="mb-4"><strong>Channel Partner:</strong> <GetUserName id={propertyTrasnsaction.channlePartnerAddress} /></p>
            <p className="mb-4"><strong>Seller:</strong> <GetUserName id={propertyTrasnsaction.sellerAddress} /></p>
            <p className="mb-4"><strong>Buyer:</strong> <GetUserName id={propertyTrasnsaction.buyerAddress} /></p>
            <p className="mb-4"><strong>Escrow Account Number:</strong> {propertyTrasnsaction.escrowAccount}</p>
            <p className="mb-4"><strong>Token Amount:</strong> {propertyTrasnsaction.tokenAmount}</p>
            <p className="mb-4"><strong>Final Amount:</strong> {propertyTrasnsaction.finalAmount}</p>

            {
                user?.id == USER_ADDRESSES.buyer || user?.id == USER_ADDRESSES.channelPartner ?
                    <>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={() => onLegalApprove()}
                        >
                            Legal Approve
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={() => onLegalDisApprove()}
                        >
                            Legal Disapprove
                        </button>
                    </>
                :
                null
            }
        </div>
    );
}
export default LegalToApprove;