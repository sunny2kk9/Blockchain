import { Metadata } from 'next'
import BackedInventoryForm from '@/app/components/manufacturer/backedInventoryForm';

export const metadata: Metadata = {
  title: 'Add Backed Inventory',
}
 
const BackedInventory: React.FC = () => {
  return (
    <main className="min-h-screen">
      <BackedInventoryForm />
    </main>
  );
}
export default BackedInventory;