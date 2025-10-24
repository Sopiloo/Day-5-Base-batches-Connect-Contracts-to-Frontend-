import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function Home() {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
              Bienvenue sur DecentraVote
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
              Une application de vote décentralisée sécurisée sur le réseau Base
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="/proposals"
                className="btn btn-primary px-8 py-4 text-lg"
              >
                Voir les propositions
              </Link>
              <Link 
                href="/create"
                className="btn btn-secondary px-8 py-4 text-lg"
              >
                Créer une proposition
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Comment ça marche ?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">1. Connectez votre wallet</h3>
                  <p className="text-gray-600 dark:text-gray-300">Utilisez MetaMask ou un autre portefeuille compatible</p>
                </div>
                <div className="card p-6">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">✍️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">2. Créez ou votez</h3>
                  <p className="text-gray-600 dark:text-gray-300">Proposez des idées ou votez pour vos préférées</p>
                </div>
                <div className="card p-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">3. Sécurisé et transparent</h3>
                  <p className="text-gray-600 dark:text-gray-300">Toutes les transactions sont enregistrées sur la blockchain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
