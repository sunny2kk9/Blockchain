'use client';

import React, { useEffect, useState } from 'react';
import { getAllCategories, getProductsByCategory } from '@/core/api/menu';
import useLoadingStore from "@/store/LoadingStore";
import { getProductImage } from '@/helpers/getProductImage';

const MenuComp: React.FC = () => {
    const loadingStore = useLoadingStore();
    const [categoryDetails, setCategoryDetails] = useState<any>({});
    const [productsByCategory, setProductsByCategory] = useState<any>({});

    useEffect(() => {
        onGetAllCategories();
    }, []);

    const onGetAllCategories = async () => {
        loadingStore.setIsLoading(true);
        const resCat = await getAllCategories();
        let categories = resCat?.output;

        if (categories) {
            setCategoryDetails(categories);

            const productsData: any = {};
            for (const category of categories) {
                const productResult = await getProductsByCategory(category.id);
                let products = productResult?.output;
                productsData[category.id] = products;
            }
            console.log("productsData", productsData);
            setProductsByCategory(productsData);
        }
        loadingStore.setIsLoading(false);
    }

    return (
        <div className='bg-white p-20'>
            <h2 className='text-base sm:text-lg lg:text-xl text-center font-bold mb-5'>Menu</h2>

            <div className='flex'>
                {categoryDetails.length > 0 && categoryDetails.map((category: any) => (
                    <div key={category.id} className="bg-gray-100 p-6 rounded-lg mb-4 mr-3 w-1/4">
                        <h3 className="text-lg font-bold mb-4">{category.name}</h3>
                        <ul>
                            {productsByCategory && productsByCategory[category.id]?.map((product: any) => (
                                <li key={product.id} className="flex items-center mb-2">
                                    <img src={getProductImage(product.name)} alt={product.name} className="w-8 h-8 mr-2 rounded" />
                                    <span>{product.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MenuComp;
