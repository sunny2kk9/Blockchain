import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transactions',
}
 
const Transactions: React.FC = () => {
  return (
    <main className="min-h-screen">
      <h1 className='text-center'>Transaction params needs to be finalized</h1>
    </main>
  );
}
export default Transactions;