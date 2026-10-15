import React, { Suspense } from 'react';
import { NewComplaintContent } from '@/components/account/NewComplaintContent';

export const instant = false;

export const metadata = {
  title: 'New Support Inquiry | Nakaam Store',
  description: 'Submit an inquiry or consultation ticket to our tailoring and customer support team.',
};

export default function UserNewComplaintPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading ticket form...</div>}>
      <NewComplaintContent />
    </Suspense>
  );
}
