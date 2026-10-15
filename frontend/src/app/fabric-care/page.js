import React, { Suspense } from 'react';
import { FabricCareContent } from '@/components/editorial/FabricCareContent';

export const metadata = {
  title: 'Fabric Care & Shrinkage Protocols | Nakaam (ناکام)',
  description: 'Master care instructions for fine lawn, raw silk, handspun khaddar, and embroidered velvet. Stain rescue guides and preservation protocols.',
};

export default function FabricCarePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <FabricCareContent />
    </Suspense>
  );
}
