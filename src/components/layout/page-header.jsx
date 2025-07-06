"use client"

import { Navbar } from './navbar';
import { Breadcrumbs } from './breadcrumbs';

export function PageHeader({ breadcrumbItems = [] }) {
  return (
    <>
      <Navbar />
      <Breadcrumbs items={breadcrumbItems} />
    </>
  );
} 