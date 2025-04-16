'use client';
import { notFound, usePathname } from 'next/navigation';
import Link from "next/link";

export default function AdminLayout({ children, params }) {
    const validTabs = ['tools', 'customers'];
    const tab = params.slug?.[0] ?? 'tools';
    const pathname = usePathname();

    if (!validTabs.includes(tab)) {
        notFound();
    }

    const navTab = pathname.split('/')[2] || 'tools'; 
    const linkClass = (key) =>
        `pb-1 ${navTab === key ? 'border-b-gray-500 border-b-2 text-black' : 'text-gray-500'}`;

    return (
        <div>
            <div className='bg-white w-[clamp(20rem,80vw,100dvh)] p-4 rounded-lg shadow-lg '>
                <nav className='text-gray-500 text-xl font-semibold flex gap-4 p-4'>
                    <Link href='/admin/tools' className={linkClass('tools')}>TOOLS</Link>
                    <Link href='/admin/customers' className={linkClass('customers')}>CUSTOMERS</Link>
                </nav>

                <div>{children}</div>
            </div>
        </div>
    );
}
