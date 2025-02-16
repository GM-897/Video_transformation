import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';  
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import VideoUploadForm from './components/VideoUploadForm';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
console.log("Clerk Publishable Key:", clerkPubKey);


function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey} afterSignOutUrl='/sign-in'>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/sign-in" element={<SignedOut><SignIn /></SignedOut>} />
            {/* <Route path="/sign-in/sso-callback" element={<RedirectToSignIn />} /> */}
            <Route path="/sign-up" element={<SignedOut><SignUp /></SignedOut>} />
            <Route
              path="/"
              element={
                <SignedIn>
                  <VideoUploadForm />
                </SignedIn>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ClerkProvider>
  );
}

export default App;
