'use client';

import Image from "next/image";
import Link from "next/link";
import Menu from "./menu";
import useUserStore from "@/store/user.store";
import { PlusCircleIcon } from "@heroicons/react/16/solid";

const routes = [
    { path: '/', name: 'Home' },
    { path: '/marketplace', name: 'Marketplace' },
    // { path: '/transactions', name: 'Transactions', auth: true },
    { path: '/property/create-update', name: 'New Property', icon: <PlusCircleIcon className="w-6 h-6" />, auth: true },
]

const Header: React.FC = () => {
    const user = useUserStore((state) => state.user);

    return (
        <header className="bg-gray-50 shadow">
            <div className="mx-auto py-2 px-4 sm:px-6 lg:px-16 flex justify-between">
                <div className="t-50">
                    <Image src="https://i.ibb.co/mz1ZrXv/rel-u.png" alt="Co Estate" width={100} height={100} />
                </div>

                <nav className="py-6">
                    <ul className="flex">
                        {routes.map((r, i) => {
                            if (!r.auth) {
                                return (
                                    <li className="pl-5" key={i}>
                                        <Link href={r.path} className="flex transform transition duration-300 hover:scale-105 hover:font-bold">
                                            {r.name}
                                            <span className="ml-2 text-gray-700">{ r.icon ? r.icon : null }</span>
                                        </Link>
                                    </li>
                                );
                            }
                        })}
                        {
                            routes.map((r, i) => {
                                if (r.auth && user?.id) {
                                    return (
                                        <li className="pl-5" key={i}>
                                            <Link href={r.path} className="flex transform transition duration-300 hover:scale-105 hover:font-bold">
                                                {r.name}
                                                <span className="ml-2 text-gray-700">{ r.icon ? r.icon : null }</span>
                                            </Link>
                                        </li>
                                    );
                                }
                            })
                        }
                    </ul>
                </nav>

                <div className="py-6">
                    <Menu />
                </div>
            </div>
        </header>
    );
}
export default Header;