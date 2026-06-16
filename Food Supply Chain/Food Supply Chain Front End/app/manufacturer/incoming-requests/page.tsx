import { Metadata } from 'next'
import IncomingRequestsComp from '@/app/components/manufacturer/incomingRequests';

export const metadata: Metadata = {
  title: 'Incoming Requests',
}
 
const IncomingRequests: React.FC = () => {
  return (
    <main className="min-h-screen">
      <IncomingRequestsComp />
    </main>
  );
}
export default IncomingRequests;