'use client';

import { useEffect, useState } from "react";
import PropertyCard from "./propertyCard";
import { getOwnedProperties } from "@/core/api/property";
import useUserStore from "@/store/user.store";

const OwnedProperties: React.FC = () => {
    const user = useUserStore((state) => state.user);
    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        fetchOwnedProperties();
    }, []);

    const fetchOwnedProperties = () => {
        if (user.id) {
            getOwnedProperties(user.id)
                .then(response => {
                    console.log('Response:', response);
                    setProperties(response?.output);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } else {
            console.log('Owner is not logged in!');

        }
    }

    return (
        user?.id && properties ? (
            <>
                <section className="bg-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 text-center">My Properties</h2>
                        <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                            {properties.map((p, i) => (
                                <div key={i}>
                                    <PropertyCard data={p} isOwned={true} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </>
        ) : null
    );
}
export default OwnedProperties;