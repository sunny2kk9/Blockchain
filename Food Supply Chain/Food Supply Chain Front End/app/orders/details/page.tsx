import { Metadata } from 'next'
import OrderDetailsComp from '@/app/components/orders/orderDetails';

export const metadata: Metadata = {
  title: 'Incoming Requests',
}

const IncomingRequests: React.FC = () => {
  return (
    <main className="min-h-screen">
      <OrderDetailsComp />
    </main>
  );
}
export default IncomingRequests;