import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { startSyncEngine } from "./local/sync/syncEngine"
  


startSyncEngine("acme-inc") // ✅ start sync engine with default workspace slug
createRoot(document.getElementById('root')!).render(
  
  <StrictMode>
    <App />
  </StrictMode>,
)
