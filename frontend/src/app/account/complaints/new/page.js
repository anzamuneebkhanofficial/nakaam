import React, { Suspense } from 'react';
import { NewComplaintContent } from '@/components/account/NewComplaintContent';

export const metadata = {
  title: 'New Support Inquiry | Nakaam',
  description: 'Submit an inquiry or consultation ticket to our tailoring and customer support team.',
};

export default function NewComplaintPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <NewComplaintContent />
    </Suspense>
  );
}
