import ReactDOM from 'react-dom/client'
import React from 'react'; // Add React import
import './index.css'

const App = React.lazy(() => import('./App.tsx')); // Implement dynamic import for App component

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.Suspense fallback={<div>Loading...</div>}>
   
    <App />
  </React.Suspense>,
)
