import { Metadata } from 'next'
import RetailerRequisitionForm from '@/app/components/retailer/RetailerRequisitionForm';

export const metadata: Metadata = {
  title: 'Retailer Requisition',
}
 
const RetailerRequisition: React.FC = () => {
  return (
    <main className="min-h-screen">
      <RetailerRequisitionForm />
    </main>
  );
}
export default RetailerRequisition;