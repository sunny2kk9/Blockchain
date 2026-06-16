'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ListingToSalePopup from './listingToSalePopup';
import { enrollProperty } from '@/core/api/property';
import { generatePropertyToken, ownerTokens } from '@/core/api/transactions';
import { getUsers } from '@/core/api/auth';
import User from '@/interfaces/user.interface';
import useUserStore from '@/store/user.store';
import useLoadingStore from '@/store/LoadingStore';

const CreateUpdatePropertyForm: React.FC = () => {
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const loadingStore = useLoadingStore();

    const [users, setUsers] = useState<User[]>([]);
    const [image, setImage] = useState<File[] | null>([]);
    const [propertyName, setPropertyName] = useState('Tuwaiq Apartments ');
    const [propertyDesc, setPropertyDesc] = useState('Excellent location, very quiet, close to all services and a mosque All guarantees, including electricity, plumbing, insulation, and engineering supervision');
    const [location, setLocation] = useState('24.8993006, 67.1552004');
    const [size, setSize] = useState('300 SQM');
    const [features, setFeatures] = useState<string[]>([]);
    const [otherFeatures, setOtherFeatures] = useState('');
    const [propertyOwnerId, setPropertyOwnerId] = useState('0x4c441e2c9ca861f337701777beba2cdd356682f9');
    const [propertyAddress, setPropertyAddress] = useState('Tuwaiq, West Riyadh, Riyadh, Riyadh Region');
    const [forSale, setForSale] = useState(false);

    const [propertyToken, setPropertyToken] = useState('');
    // const [listingToSale, setListingToSale] = useState(false);

    useEffect(() => {
        getUsers()
            .then(response => {
                console.log('Response:', response);
                setUsers(response?.output);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    const handleCheckboxChange = (feature: string) => {
        if (features.includes(feature)) {
            setFeatures(features.filter(item => item !== feature));
        } else {
            setFeatures([...features, feature]);
        }
    };

    const onImagesSelect = (e: any) => {
        const fileList = e.target.files;

        if (fileList) {
            const filesArray = Array.from(fileList) as File[];
            setImage(filesArray.length > 0 ? filesArray : null);
        }
        else {
            setImage(null);
        }
    }

    const onChangeOwner = (e: any) => {
        setPropertyOwnerId(e)
        onGeneratePropertyToken();
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (propertyOwnerId && propertyToken) {
            loadingStore.setIsLoading(true);

            let payload = {
                "_description": propertyDesc,
                "_features": [features.toString(), otherFeatures].toString(),
                "_forSale": forSale,
                "_ipfsUrls": "",
                "_location": location,
                "_name": propertyName,
                "_owner": propertyOwnerId,
                "_propertyAddress": propertyAddress,
                "_size": size,
                "_tokenId": propertyToken
            }

            enrollProperty(payload)
                .then(response => {
                    console.log('Response:', response);
                    router.push('/marketplace');
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            loadingStore.setIsLoading(false);
        } else {
            console.log('Owner is not selected.');
        }
    };

    const onGeneratePropertyToken = async () => {
        try {
            const generateTokenPayload = {
                "_owner": user?.id,
                "propertyData": "0x1"
            };
            const generateTokenResponse = await generatePropertyToken(generateTokenPayload);
            console.log('generatePropertyToken:', generateTokenResponse);

            // Get owner tokens
            const ownerTokensResponse = await ownerTokens(user?.id);
            console.log('ownerTokens:', ownerTokensResponse);

            // Set property token
            if (ownerTokensResponse?.output?.length > 0) {
                const propertyToken = ownerTokensResponse.output[ownerTokensResponse.output.length - 1];
                setPropertyToken(propertyToken);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    return (
        <div className="w-full mx-auto bg-white rounded px-16 lg:px-32 pt-6 pb-8 mb-4">
            <h2 className='text-base sm:text-lg lg:text-xl text-center font-bold'>Create / Update Property</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Property Images
                    </label>
                    <input type="file" onChange={(e) => onImagesSelect(e)} multiple />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Property Name
                    </label>
                    <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Property Name"
                        value={propertyName}
                        onChange={(e) => setPropertyName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Property Description
                    </label>
                    <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Property Description"
                        value={propertyDesc}
                        onChange={(e) => setPropertyDesc(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Location
                    </label>
                    <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Area
                    </label>
                    <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Size"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Features
                    </label>
                    <div>
                        <label className="inline-flex items-center mr-4">
                            <input type="checkbox" className="form-checkbox text-indigo-600" value="Parking" onChange={() => handleCheckboxChange('Parking')} />
                            <span className="ml-2">Parking</span>
                        </label>
                        <label className="inline-flex items-center mr-4">
                            <input type="checkbox" className="form-checkbox text-indigo-600" value="Lounge" onChange={() => handleCheckboxChange('Lounge')} />
                            <span className="ml-2">Lounge</span>
                        </label>
                        <label className="inline-flex items-center mr-4">
                            <input type="checkbox" className="form-checkbox text-indigo-600" value="Park Facing" onChange={() => handleCheckboxChange('Park Facing')} />
                            <span className="ml-2">Park Facing</span>
                        </label>
                        <input
                            type="text"
                            className="inline-flex items-center mr-4 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Other Features"
                            value={otherFeatures}
                            onChange={(e) => setOtherFeatures(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Property Owner ID
                    </label>
                    <select
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        onChange={(e: any) => onChangeOwner(e.target.value)}
                    >
                        <option value="">Select Owner</option>
                        {
                            users.map((u, i) => {
                                return (
                                    <option value={u.id} key={i}>{u.name}</option>
                                );
                            })
                        }
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Property Address
                    </label>
                    <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Property Address"
                        value={propertyAddress}
                        onChange={(e) => setPropertyAddress(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="flex items-center">
                        <input type="checkbox" className="form-checkbox text-indigo-600" checked={forSale} onChange={(e) => setForSale(e.target.checked)} />
                        <span className="ml-2 text-gray-700 text-sm font-bold">
                            List to Sale
                        </span>
                    </label>
                </div>
                {/* <div className="mb-4">
                    <label className="flex items-center">
                        <input type="checkbox" className="form-checkbox text-indigo-600" checked={listingToSale} onChange={(e) => setListingToSale(e.target.checked)} />
                        <span className="ml-2 text-gray-700 text-sm font-bold">
                            Listing to Sale (View to all buyers)
                        </span>
                    </label>
                </div> */}
                <div className="flex items-center justify-between mt-16">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Create Property
                    </button>
                </div>

                {/* Popup for Listing to Sale */}
                {/* {listingToSale && (
                    <ListingToSalePopup setPopupOpen={setListingToSale} />
                )} */}
            </form>
        </div>
    );
};

export default CreateUpdatePropertyForm;