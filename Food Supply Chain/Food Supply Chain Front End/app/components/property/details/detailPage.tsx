'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'
import TokenToPay from './tokenToPay';
import TokenToApprove from './tokenToApprove';
import LegalToApprove from './legalToApprove';
import Agreement from './agreement';
import useUserStore from '@/store/user.store';
import Link from 'next/link';
import { getAllPropertyTransactions } from '@/core/api/transactions';
import { getStatusText } from '@/helpers/getStatusText';
import LegalToDisApprove from './legalToDisApprove';
import RegistrationFinal from './registrationFinal';
import { getSinglePropertyDetails } from '@/core/api/property';
import { getRandomImage } from '@/helpers/getImageUrlRandom';

const PropertyDetailsComp: React.FC = () => {
    const user = useUserStore((state) => state.user);
    const [randomImage, setRandomImage] = useState('');
    const [propertyDetails, setPropertyDetails] = useState<any>({});
    const [allPropertyTransactions, setAllPropertyTransactions] = useState<any>({});
    const [lastPropertyTransaction, setLastPropertyTransaction] = useState<any>([]);

    const searchParams = useSearchParams()
    const propertyId = searchParams.get('propertyId');

    useEffect(() => {
        onGetPropertyDetails();
        setRandomImage(getRandomImage())
    }, []);

    const onTriggerProcessDone = () => {
        onGetPropertyDetails();
    }

    const onGetPropertyDetails = async () => {
        const resProp = await getSinglePropertyDetails(propertyId);
        let property = resProp?.output;

        if (property) {
            setPropertyDetails(property);

            getAllPropertyTransactions(property.tokenId)
                .then(response => {
                    let res = response.output;
                    console.log('All Property Transactions:', res);

                    setAllPropertyTransactions(res);
                    if (res.length > 0) {
                        setLastPropertyTransaction(res[res.length - 1]);
                    } else {

                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }

    return (
        <div className='container mx-auto'>
            <div className='px-4 pt-4'>
                <h2 className="text-xl font-bold mb-2">{propertyDetails.name}</h2>
                <h2 className="text-xl mb-2">{propertyDetails.propertyAddress}</h2>
            </div>
            <div className="flex">
                <div className="w-3/5 p-4 relative">
                    <p className='absolute py-3 px-5 bg-gray-700 text-white m-1'>{getStatusText(Number(lastPropertyTransaction?.status) || 1)}</p>
                    <Image className="mb-4 w-full" src={randomImage} alt="Co Estate" width={1000} height={1000} />
                </div>

                <div className="w-2/5 p-4">
                    <div className='shadow-lg rounded p-8 mb-3 border border-gray-100'>
                        {
                            user?.id ?
                                <>
                                    <h2 className="text-xl font-bold mb-4 pb-4 border-b">Property Action</h2>
                                    {
                                        lastPropertyTransaction.length == 0 ?
                                            <TokenToPay propertyDetails={propertyDetails} processTrigger={onTriggerProcessDone} />
                                            : null
                                    }
                                    {
                                        lastPropertyTransaction?.status == 2 ?
                                            <TokenToApprove propertyDetails={propertyDetails} propertyTrasnsaction={lastPropertyTransaction} processTrigger={onTriggerProcessDone} />
                                            : null
                                    }
                                    {
                                        lastPropertyTransaction?.status == 3 ?
                                            <LegalToApprove propertyDetails={propertyDetails} propertyTrasnsaction={lastPropertyTransaction} processTrigger={onTriggerProcessDone} />
                                            : null
                                    }
                                    {
                                        lastPropertyTransaction?.status == 4 ?
                                            <Agreement propertyDetails={propertyDetails} propertyTrasnsaction={lastPropertyTransaction} processTrigger={onTriggerProcessDone} />
                                            : null
                                    }
                                    {
                                        lastPropertyTransaction?.status == 5 ?
                                            <LegalToDisApprove propertyDetails={propertyDetails} propertyTrasnsaction={lastPropertyTransaction} />
                                            : null
                                    }
                                    {
                                        lastPropertyTransaction?.status == 6 ?
                                            <RegistrationFinal propertyDetails={propertyDetails} propertyTrasnsaction={lastPropertyTransaction} processTrigger={onTriggerProcessDone} />
                                            : null
                                    }

                                    {
                                        lastPropertyTransaction?.status == 7 ?
                                            <h2 className='p-4 text-2xl bg-green-700 text-white text-center'>Property Sold</h2>
                                            : null
                                    }
                                </>
                                :
                                <p>
                                    <Link href='/auth/login'>Login</Link> to Purchase
                                </p>
                        }
                    </div>
                    <div className='shadow-lg rounded p-4 border border-gray-100'>
                        <div className="flex">
                            <div className='w-1/2 text-center'>
                                <h3 className='font-bold'>Property Type</h3>
                                <p>Retail</p>
                            </div>
                            <div className='w-1/2 text-center'>
                                <h3 className='font-bold'>Property Class</h3>
                                <p>Class A</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='p-4'>
                <h3 className='font-bold text-2xl pb-4'>Description</h3>
                <p className='pb-4'>{propertyDetails.description}</p>
            </div>

            <div className='p-4'>
                <h3 className='font-bold text-2xl pb-4'>Size</h3>
                <p className='pb-4'>{propertyDetails.size}</p>
            </div>
        </div>
    );
};

export default PropertyDetailsComp;
