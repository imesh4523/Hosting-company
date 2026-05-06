'use client';
export const dynamic = 'force-dynamic';
import FragmentPage from '@/components/FragmentPage';
import { useParams } from 'next/navigation';

export default function Page() { 
    const params = useParams();
    const id = params.slug?.[0]; // or subSlug
    return <FragmentPage fragmentName="ticket_view" slug={String(id)} />; 
}
