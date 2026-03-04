import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router";
import { MovieProvider } from './context/movieContext.jsx';


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <StrictMode>
    <MovieProvider>
    <App />
    </MovieProvider>
  </StrictMode>
  </BrowserRouter>
)
