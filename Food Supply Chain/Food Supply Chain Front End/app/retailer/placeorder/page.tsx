import { Metadata } from 'next'
import PlaceOrderForm from '@/app/components/retailer/PlaceOrder';

export const metadata: Metadata = {
  title: 'Retailer Requisition',
}

const RetailerRequisition: React.FC = () => {
  return (
    <main className="min-h-screen">
      <PlaceOrderForm />
    </main>
  );
}
export default RetailerRequisition;