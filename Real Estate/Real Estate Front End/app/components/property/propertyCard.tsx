'use client';

import { makePropertyForNoSale, makePropertyForSale } from "@/core/api/property";
import { PropertyStatusText } from "@/enums/property.enum";
import { getRandomImage } from "@/helpers/getImageUrlRandom";
import { getStatusText } from "@/helpers/getStatusText";
import { TruncateText } from "@/helpers/truncateText";
import useUserStore from "@/store/user.store";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
    data: any,
    isOwned: boolean
}

const PropertyCard: React.FC<any> = ({ data, isOwned }: Props) => {
    const user = useUserStore((state) => state.user);
    const [randomImage, setRandomImage] = useState('');

    useEffect(() => {
        setRandomImage(getRandomImage())
    }, []);

    const onListForSale = () => {
        let payload = {
            "_id": data?.tokenId,
            "_owner": user?.id
        }

        makePropertyForSale(payload)
            .then(response => {
                console.log('Response:', response);
                window.location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    const onUnListForSale = () => {
        let payload = {
            "_id": data?.tokenId,
            "_owner": user?.id
        }

        makePropertyForNoSale(payload)
            .then(response => {
                console.log('Response:', response);
                window.location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    return (
        <div className="bg-white shadow-xl rounded-lg transform hover:scale-105 transition duration-500">
            <div className="aspect-w-3 aspect-h-2">
                <img className="object-cover shadow-lg rounded-t-lg h-48 w-full" src={randomImage} alt="Property" />
            </div>
            <div className="p-6 relative">
                <div className="bg-pink-700 text-white absolute top-5 right-0 p-2">
                    {!isOwned && <p>{data.status ? getStatusText(Number(data.status)) : PropertyStatusText.FOR_SALE}</p>}
                    {isOwned && <p>{data.forSale ? PropertyStatusText.FOR_SALE : PropertyStatusText.FOR_SALE}</p>}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
                <p><small>{data.location}</small></p>
                <p className="mt-2 text-sm text-gray-500">
                    <TruncateText text={data?.description} maxLength={150} />
                </p>
                <Link href={{ pathname: '/property/details', query: { propertyId: data?.tokenId } }} className="block w-full text-center p-3 mt-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    View Details
                </Link>
                {
                    isOwned ?
                        <div>
                            {
                                data.forSale ?
                                    <button
                                        className="w-full p-3 mt-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        onClick={() => onUnListForSale()}>
                                        Unlist for Sale
                                    </button>
                                    :
                                    <button
                                        className="w-full p-3 mt-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                        onClick={() => onListForSale()}>
                                        List for Sale
                                    </button>
                            }
                        </div>
                        : null
                }

            </div>
        </div>
    );
}
export default PropertyCard;