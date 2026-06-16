'use client';

import { useEffect, useState } from "react";
import PropertyCard from "./propertyCard";
import { getAllProperties } from "@/core/api/property";
import { getAllPropertyTransactions } from "@/core/api/transactions";
import useLoadingStore from "@/store/LoadingStore";
import useUserStore from "@/store/user.store";
import { getStatusText } from "@/helpers/getStatusText";

const MarketplaceComp: React.FC = () => {
    const loadingStore = useLoadingStore();
    const user = useUserStore((state) => state.user);
    const [finalizedProperties, setFinalizedProperties] = useState<any[]>([]);
    const [alltransactions, setAlltransactions] = useState<any[]>([]);

    useEffect(() => {
        getProperties();
    }, []);

    const getProperties = async () => {
        loadingStore.setIsLoading(true);

        try {
            const finalProperties: any = [];
            const allPropertyTransactions: any = [];
    
            // Get all properties
            const resProp = await getAllProperties();
            console.log('Response:', resProp);
    
            const properties = resProp?.output || [];
    
            // Iterate over each property
            await Promise.all(properties.map(async (property: any) => {
                // Get all transactions for the current property
                const resTrans = await getAllPropertyTransactions(property.tokenId);
                console.log('AllPropertyTransactions:', resTrans);
    
                let status = "1"; // Default status if no transactions found

                if (resTrans && resTrans.output.length > 0) {
                    allPropertyTransactions.push(...resTrans.output);

                    const lastTrans = resTrans.output[resTrans.output.length - 1];
                    status = lastTrans.status;
                }
    
                // Add the property with its status to finalProperties
                finalProperties.push({ ...property, status });
            }));
    
            setAlltransactions(allPropertyTransactions);
            setFinalizedProperties(finalProperties);
            loadingStore.setIsLoading(false);

        } catch (error) {
            console.error('Error:', error);
        }
    };
    
    
    return (
        <section className="bg-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                    {
                        finalizedProperties.map((p, i) => {
                            return(
                                <div key={i}>
                                    <PropertyCard data={p} isOwned={false} />
                                </div>
                            );
                        })
                    }
                </div>

                <div className="pt-32">
                    <h2 className="text-3xl font-extrabold text-gray-900 text-center">My Transactions</h2>
                    <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
                        {
                            alltransactions.map((trans, i) => {
                                if (user?.id == trans.buyerAddress || user?.id == trans.sellerAddress || user?.id == trans.channlePartnerAddress) {
                                    return(
                                        <div className="shadow-lg p-4" key={i}>
                                            <p><strong>Escrow Account:</strong> {trans.escrowAccount}</p>
                                            <p><strong>Status:</strong> {getStatusText(Number(trans.status))}</p>
                                            <p><strong>Legal Approved:</strong> {trans.legalApproved ? <span className="font-bold text-green-600">True</span> : <span className="font-bold text-red-600">False</span>}</p>
                                            <p><strong>Token Amount:</strong> {trans.tokenAmount}</p>
                                            <p><strong>Final Amount:</strong> {trans.finalAmount}</p>
                                        </div>
                                    );
                                }
                            })
                        }
                    </div>
                </div>
            </div>
        </section>
    );
}
export default MarketplaceComp;