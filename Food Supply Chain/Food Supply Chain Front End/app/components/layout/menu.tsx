import useUserStore from '@/store/user.store';
import Link from 'next/link';
import React, { useState } from 'react';

const Menu = () => {
    const userStore = useUserStore();
    const user = useUserStore((state) => state.user);

    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        setIsOpen(!isOpen);
    };

    const logout = () => {
        userStore.removeUser();
        setIsOpen(!isOpen);
    };

    return (
        user?.id ?
            <div className="relative">
                <button
                    className="px-3 py-2 rounded bg-gray-900 text-white hover:bg-gray-700 focus:outline-none"
                    onClick={handleClick}
                >
                    {user?.name || 'Account'}
                </button>
                {isOpen && (
                    <div className="absolute right-0 z-10 bg-white shadow-md w-48 mt-1 rounded">
                        <ul className="list-none py-1">
                            <li className="px-3 py-2 hover:bg-gray-200">
                                <a onClick={() => logout()}>Logout</a>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            :
            <Link href='/auth/login'>Login</Link>
    );
};

export default Menu;