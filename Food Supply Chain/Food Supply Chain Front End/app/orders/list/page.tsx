import { Metadata } from 'next'
import DisplayAllOrdersComp from '@/app/components/orders/displayOrders';

export const metadata: Metadata = {
  title: 'Incoming Requests',
}

const IncomingRequests: React.FC = () => {
  return (
    <main className="min-h-screen">
      <DisplayAllOrdersComp />
    </main>
  );
}
export default IncomingRequests;