'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Tags } from 'lucide-react';

export type AdminView = 'products' | 'categories';

const ITEMS: { view: AdminView; label: string; href: string; icon: React.ElementType }[] = [
    { view: 'products', label: 'Products', href: '/admin/products', icon: Package },
    { view: 'categories', label: 'Categories', href: '/admin/categories', icon: Tags },
];

// The dashboard page shown for the current URL (/admin/products or /admin/categories).
export function useAdminView(): AdminView {
    return usePathname()?.startsWith('/admin/categories') ? 'categories' : 'products';
}

// Links between the dashboard pages. Sits under the top bar; on mobile the
// tabs share the width equally.
export const AdminTabs: React.FC = () => {
    const active = useAdminView();
    return (
        <nav aria-label="Admin" className="bg-white border-b border-neutral-200">
            <ul className="max-w-[1600px] mx-auto px-4 lg:px-8 flex">
                {ITEMS.map(({ view, label, href, icon: Icon }) => (
                    <li key={view} className="flex-1 sm:flex-none">
                        <Link
                            href={href}
                            aria-current={active === view ? 'page' : undefined}
                            className={`w-full flex items-center justify-center gap-2 px-5 py-3 font-medium border-b-2 -mb-px transition-colors ${
                                active === view
                                    ? 'border-primary-500 text-primary-800'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
                            }`}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};
