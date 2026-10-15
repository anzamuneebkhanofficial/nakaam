import React, { Suspense } from 'react';
import { ContactContent } from '@/components/editorial/ContactContent';

export const metadata = {
  title: 'Contact & Customer Support | Nakaam (ناکام)',
  description: 'Reach our Lahore studio on MM Alam Road, Gulberg III. WhatsApp assistance, phone support, and tailoring consultations.',
};

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <ContactContent />
    </Suspense>
  );
}
