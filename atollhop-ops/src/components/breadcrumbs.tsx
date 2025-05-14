'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter((segment) => segment !== '');

  return (
    <nav aria-label="Breadcrumb" className="px-4 py-2">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">
            Dashboard
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          if (segment === 'dashboard') return null;
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const formattedSegment =
            segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <li key={path} className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href={path} className="text-gray-600 hover:text-gray-800">
                {formattedSegment}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
