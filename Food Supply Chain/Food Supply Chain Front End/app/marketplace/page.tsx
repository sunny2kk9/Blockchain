import { Metadata } from 'next'
import MarketplaceComp from '../components/property/marketplace';
 
export const metadata: Metadata = {
  title: 'Marketplace',
}
 
export default function Marketplace() {
  return (
    <main className="min-h-screen">
      <MarketplaceComp />
    </main>
  );
}