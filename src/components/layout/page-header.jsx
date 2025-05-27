"use client"

import { Navbar } from './navbar';
import { Breadcrumbs } from './breadcrumbs';

export function PageHeader({ breadcrumbItems = [] }) {
  return (
    <div className="sticky top-0 z-50 w-full">
      <Navbar />
      <Breadcrumbs items={breadcrumbItems} />
    </div>
  );
} 