import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './app/App'
import './styles/index.css'

const Loading = () => (
  <div className="min-h-screen bg-[#050805] flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-[#c5f82a]/30 border-t-[#c5f82a] rounded-full animate-spin"></div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <React.Suspense fallback={<Loading />}>
        <App />
      </React.Suspense>
    </HelmetProvider>
  </React.StrictMode>,
)
