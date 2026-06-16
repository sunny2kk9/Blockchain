import { Metadata } from 'next'
import AddInventoryForm from '../../components/supplier/addInventoryForm';

export const metadata: Metadata = {
  title: 'Supplier',
}
 
const AddInventory: React.FC = () => {
  return (
    <main className="min-h-screen">
      <AddInventoryForm />
    </main>
  );
}
export default AddInventory;