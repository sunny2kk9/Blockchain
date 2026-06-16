import { Metadata } from 'next'
import MenuComp from '@/app/components/manufacturer/menuDisplay';

export const metadata: Metadata = {
  title: 'Incoming Requests',
}

const IncomingRequests: React.FC = () => {
  return (
    <main className="min-h-screen">
      <MenuComp />
    </main>
  );
}
export default IncomingRequests;