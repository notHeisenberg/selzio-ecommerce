"use client"

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import ComboDetail from '@/components/combos/ComboDetail';

export default function ComboPage() {
  const { comboCode } = useParams();

  // Generate breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Combos", href: "/combos" },
    { label: comboCode, href: `/combos/${comboCode}` }
  ];

  return (
    <>
      <PageHeader breadcrumbItems={breadcrumbItems} />
      <ComboDetail comboCode={comboCode} />
    </>
  );
} 