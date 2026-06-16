import { Metadata } from 'next'
import PropertyDetailsComp from '@/app/components/property/details/detailPage';
 
export const metadata: Metadata = {
  title: 'Property Details',
}
 
export default function PropertyDetails() {
  return (
    <main className="min-h-screen bg-white pt-5">
      <PropertyDetailsComp />
    </main>
  );
}