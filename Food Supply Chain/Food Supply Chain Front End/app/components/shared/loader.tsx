'use client';

import useLoadingStore from '@/store/LoadingStore';
import Image from 'next/image';

const Loader: React.FC<any> = () => {
    const isLoading = useLoadingStore((state) => state.isLoading);
    
    return (
        <>
            {
                isLoading ?
                    <div className='bg-gray-100 w-full h-screen fixed top-0 left-0 z-10 opacity-75 flex justify-center items-center'>
                        <Image
                            src="https://i.ibb.co/mtCZ2hL/loader.gif"
                            alt="Co Estate"
                            width={500}
                            height={500}
                        />
                    </div>
                    :
                    null
            }
        </>
    );
}
export default Loader;