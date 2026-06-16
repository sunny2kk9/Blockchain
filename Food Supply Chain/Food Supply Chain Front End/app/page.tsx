import { Metadata } from 'next'
import { GlobeAltIcon, ShieldCheckIcon, RocketLaunchIcon } from '@heroicons/react/16/solid';
import OwnedProperties from './components/property/ownedProperties';

export const metadata: Metadata = {
  title: 'Home',
}

const Home: React.FC = () => {
  return (
    <main className="min-h-screen">
      <div className="bg-gray-100">
        <main className="mt-0">
          <section className="bg-gray-800 py-16 relative h-1/2">
            <div className="absolute inset-0 bg-cover bg-center z-0 h-full" style={{ backgroundImage: "url('https://i.ibb.co/4sFXVfS/fg.png')", mixBlendMode: "difference" }}></div>
            <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                The #1 end-to-end food traceability solution on blockchain
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                All components you need to tell the story of your product. In one place.
              </p>
              <div className="mt-8">
                <a href="#" className="inline-block bg-indigo-500 border border-transparent rounded-md py-3 px-8 font-medium text-white hover:bg-indigo-600">
                  Get Started
                </a>
              </div>
            </div>
          </section>

          <section className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-extrabold text-gray-900 text-center">Why Choose Us?</h2>
              <div className="mt-12 grid grid-cols-1 gap-y-12 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                <div className="flex flex-col text-center items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <GlobeAltIcon className='h-7 w-7' />
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">Efficiency</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Improve operational efficiency. Analyze and optimize your supply chain processes.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col text-center items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <RocketLaunchIcon className='h-7 w-7' />
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">Quicker</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Automate your product recalls, and narrow down the scope to the affected batches.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col text-center items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <ShieldCheckIcon className='h-7 w-7' />
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">Secure Transactions</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Utilize blockchain technology for secure and transparent transactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </main>
  );
}

export default Home;