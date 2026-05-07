'use client';
import FragmentPage from '@/components/FragmentPage';
import StripeAddFunds from '@/components/StripeAddFunds';

export default function AddFundsPage() {
  return (
    <div className="min-h-screen bg-white">
      <FragmentPage fragmentName="addfunds" />
      <StripeAddFunds />
    </div>
  );
}
