'use client';
import FragmentPage from '@/components/FragmentPage';
import StripePaymentMethods from '@/components/StripePaymentMethods';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_live_51TSotXGXMorGW5X8sHJWDCeTleA27pQrdgi21q6WIxZV5QHrXVSRjV4HSGnmTol3skCzg5LAD21yetRjGKo3ABO500lkucLtEI');

export default function PaymentMethodsPage() {
  return (
    <div className="min-h-screen bg-white">
      <FragmentPage fragmentName="paymentmethods" />
      <Elements stripe={stripePromise}>
        <StripePaymentMethods />
      </Elements>
    </div>
  );
}
