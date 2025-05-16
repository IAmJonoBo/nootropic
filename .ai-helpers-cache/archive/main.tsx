// @ts-expect-error TS(2305): Module '"react"' has no exported member 'StrictMod... Remove this comment to see the full error message
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// @ts-expect-error TS(2691): An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  <StrictMode>
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <App />
  </StrictMode>,
)
