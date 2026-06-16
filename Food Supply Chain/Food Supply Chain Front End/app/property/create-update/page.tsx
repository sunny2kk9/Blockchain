import { Metadata } from 'next'
import CreateUpdatePropertyForm from '@/app/components/property/createUpdateForm';

export const metadata: Metadata = {
  title: 'Create & Update Property',
}
 
const CreateUpdateProperty: React.FC = () => {
  return (
    <main className="min-h-screen">
      <CreateUpdatePropertyForm />
    </main>
  );
}
export default CreateUpdateProperty;