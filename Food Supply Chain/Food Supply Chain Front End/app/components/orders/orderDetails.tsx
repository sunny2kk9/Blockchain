'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'
import useUserStore from '@/store/user.store';
import Link from 'next/link';
import { getRandomImage } from '@/helpers/getImageUrlRandom';
import { getOrderDetails, getOrderProcessingDetails } from '@/core/api/orders';
import { getProductById, getAllIngredients } from '@/core/api/menu';
import { getOrderStatusText } from '@/helpers/getOrderStatusText';
import useLoadingStore from "@/store/LoadingStore";
import AcceptOrder from './actions/acceptOrder';
import PrepareOrder from './actions/prepareOrder';
import SubmitToQA from './actions/submitToQA';
import QAAnalyze from './actions/qaAnalyzeOrder';
import Dispatch from './actions/dispatch';
import Delivery from './actions/delivery';
import Payment from './actions/payment';
import { getProductImage } from '@/helpers/getProductImage';
import LogisticOrderPicked from './actions/logisticOrderPicked';
import LogisticOrderDelivered from './actions/logisticOrderDelivered';

const OrderDetailsComp: React.FC = () => {
    const loadingStore = useLoadingStore();
    const user = useUserStore((state) => state.user);
    const [randomImage, setRandomImage] = useState('');
    const [orderDetails, setOrderDetails] = useState<any>({});
    const [productDetails, setProductDetails] = useState<any>({});
    const [orderProcessedDetails, setOrderProcessedDetails] = useState<any>({});
    const [ingredients, setIngredients] = useState<any>({});
    const [ingredientsIds, setIngredientsIds] = useState<any>({});
    const [allOrderTransactions, setAllOrderTransactions] = useState<any>({});

    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        setRandomImage(getRandomImage());
        onGetOrderDetails();
    }, []);

    const onTriggerProcessDone = () => {
        onGetOrderDetails();
    }

    const onGetOrderDetails = async () => {
        loadingStore.setIsLoading(true);
        const resProp = await getOrderDetails(orderId);
        let order = resProp?.output;

        if (order) {
            setOrderDetails(order);

            getProductById(order.productId)
                .then(response => {
                    let res = response.output;
                    console.log('Product Details:', res);
                    console.log('Product Ingredients:', res.ingredientIds);

                    setProductDetails(res);
                    setIngredientsIds(res.ingredientIds)
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            getAllIngredients()
                .then(response => {
                    let res = response.output;
                    console.log('Ingredients List:', res);
                    setIngredients(res);
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            onGetOrderPreparedDetails();
        }
        loadingStore.setIsLoading(false);
    }

    const onGetOrderPreparedDetails = async () => {
        loadingStore.setIsLoading(true);
        const resProp = await getOrderProcessingDetails(orderId);
        let order = resProp?.output;
        console.log("order processing details output", order);
        if (order) {
            setOrderProcessedDetails(order);
        }
        loadingStore.setIsLoading(false);
    }

    return (
        <div className='container mx-auto'>
            <div className='px-4 pt-4'>
                <h2 className="text-xl font-bold mb-2">{productDetails.name}</h2>
            </div>
            <div className="flex">
                <div className="w-3/5 p-4 relative">
                    <p className='absolute py-3 px-5 bg-gray-700 text-white m-1'>{getOrderStatusText(Number(orderDetails?.status) || 1)}</p>
                    <Image className="mb-4 w-full" src={getProductImage(productDetails?.name)} alt="Food Supply Chain" width={1000} height={1000} />
                </div>

                <div className="w-2/5 p-4">
                    <div className='shadow-lg rounded p-8 mb-3 border border-gray-100 bg-white'>
                        {
                            user?.id ?
                                <>
                                    <h2 className="text-xl font-bold mb-4 pb-4 border-b">Order Action</h2>
                                    <div>
                                        <div>
                                            <p className="mb-4"><strong>Product Name:</strong> {productDetails?.name}</p>
                                            <p className="mb-4"><strong>Order Id:</strong> {orderDetails.orderId}</p>
                                            <p className="mb-4"><strong>Quantity:</strong> {orderDetails.quantity}</p>
                                            <p className="mb-4"><strong>Requested Date:</strong> {orderDetails.requestDate}</p>
                                            <p className="mb-4"><strong>Status:</strong> {getOrderStatusText(Number(orderDetails?.status) || 1)}</p>
                                            <p className="mb-4"><strong>Description:</strong> {orderDetails.description}</p>
                                            {
                                                orderDetails?.status != 1 && orderDetails?.status != 2 && orderDetails?.status != 3 ?
                                                    <>
                                                        <p className="mb-4"><strong>Manufactured Date:</strong> {orderProcessedDetails.manufacuredDate}</p>
                                                        <p className="mb-4"><strong>UseBy Date:</strong> {orderProcessedDetails.useByDate}</p>
                                                        <p className="mb-4"><strong>Maximum Temperature :</strong> {orderProcessedDetails.maxTemp}</p>
                                                        <p className="mb-4"><strong>Minimum Temperature:</strong> {orderProcessedDetails.minTemp}</p>
                                                        <p className="mb-4"><strong>Humidity:</strong> {orderProcessedDetails.humidity}</p>
                                                    </>
                                                    : null

                                            }
                                        </div>
                                    </div>
                                    {
                                        orderDetails?.status == 1 ?
                                            <AcceptOrder orderDetails={orderDetails} processTrigger={onTriggerProcessDone} />
                                            : null
                                    }
                                    {
                                        orderDetails?.status == 2 ?
                                            <PrepareOrder orderDetails={orderDetails} productDetails={productDetails} processTrigger={onTriggerProcessDone} />
                                            : null
                                    }
                                    {
                                        orderDetails?.status == 4 ?
                                            <SubmitToQA orderDetails={orderDetails} productDetails={productDetails} orderProcessedDetails={orderProcessedDetails} processTrigger={onTriggerProcessDone} />
                                            : null
                                    }
                                    {
                                        orderDetails?.status == 5 ?
                                            <QAAnalyze orderDetails={orderDetails} productDetails={productDetails} orderProcessedDetails={orderProcessedDetails} processTrigger={onTriggerProcessDone} />
                                            : null
                                    }
                                    {
                                        orderDetails?.status == 6 ?
                                            <Dispatch orderDetails={orderDetails} productDetails={productDetails} orderProcessedDetails={orderProcessedDetails} processTrigger={onTriggerProcessDone} />
                                            : null
                                    }
                                    {
                                        orderDetails?.status == 8 ?
                                            <LogisticOrderPicked orderDetails={orderDetails} productDetails={productDetails} orderProcessedDetails={orderProcessedDetails} processTrigger={onTriggerProcessDone} />
                                            : null
                                    }
                                    {
                                        orderDetails?.status == 13 ?
                                            <LogisticOrderDelivered orderDetails={orderDetails} productDetails={productDetails} orderProcessedDetails={orderProcessedDetails} processTrigger={onTriggerProcessDone} />
                                            : null
                                    }

                                    {
                                        orderDetails?.status == 14 ?
                                            <Delivery orderDetails={orderDetails} productDetails={productDetails} orderProcessedDetails={orderProcessedDetails} processTrigger={onTriggerProcessDone} />
                                            : null
                                    }
                                    {
                                        orderDetails?.status == 9 ?
                                            <Payment orderDetails={orderDetails} productDetails={productDetails} orderProcessedDetails={orderProcessedDetails} processTrigger={onTriggerProcessDone} />
                                            : null
                                    }

                                </>
                                :
                                <p>
                                    <Link href='/auth/login'>Login</Link> to Purchase
                                </p>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsComp;
