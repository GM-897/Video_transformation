import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';  
import { BrowserRouter , Routes, Route} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if(!clerkPubKey){
  throw new Error("Missing Publishable Key");
}

console.log("Clerk Publishable Key:", clerkPubKey);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey} afterSignOutUrl='/sign-in'>
       <AuthProvider>
        <BrowserRouter>
    <App />
    </BrowserRouter>
      </AuthProvider>
     </ClerkProvider>
  </React.StrictMode>
);
