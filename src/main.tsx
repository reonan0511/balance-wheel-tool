import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import './index.css';
import BalanceWheel from './BalanceWheel';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BalanceWheel />
    <Analytics />
  </StrictMode>
);
