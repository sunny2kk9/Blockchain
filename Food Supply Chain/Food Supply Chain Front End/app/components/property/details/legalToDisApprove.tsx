'use client';

import GetUserName from "@/helpers/getUserNameById";
import useUserStore from "@/store/user.store";

interface Prop {
    propertyDetails: any, 
    propertyTrasnsaction: any
}

const LegalToDisApprove: React.FC<any> = ({ propertyDetails, propertyTrasnsaction }: Prop) => {
    const user = useUserStore((state) => state.user);
    
    return (
        <div>
            <h3 className="font-bold mb-4">Legal To DisApprove</h3>

            <p className="mb-4"><strong>Channel Partner:</strong> <GetUserName id={propertyTrasnsaction.channlePartnerAddress} /></p>
            <p className="mb-4"><strong>Seller:</strong> <GetUserName id={propertyTrasnsaction.sellerAddress} /></p>
            <p className="mb-4"><strong>Buyer:</strong> <GetUserName id={propertyTrasnsaction.buyerAddress} /></p>
            <p className="mb-4"><strong>Escrow Account Number:</strong> {propertyTrasnsaction.escrowAccount}</p>
            <p className="mb-4"><strong>Token Amount:</strong> {propertyTrasnsaction.tokenAmount}</p>
            <p className="mb-4"><strong>Final Amount:</strong> {propertyTrasnsaction.finalAmount}</p>
        </div>
    );
}
export default LegalToDisApprove;