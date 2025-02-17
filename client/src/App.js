import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';  
import { BrowserRouter , Routes, Route} from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import VideoUploadForm from './components/VideoUploadForm';
import PromptToImage from './components/promptToImage';


function App() {
  return (
    
          <Routes>
            <Route path="/sign-in" element={<SignIn />} />
            {/* <Route path="/sign-in/sso-callback" element={<RedirectToSignIn />} /> */}
            {/* <Route path="/sign-up" element={<SignedOut><SignUp /></SignedOut>} /> */}
            <Route
              path="/"
              element={
                <SignedIn>
                  <VideoUploadForm />
                  {/*  <PromptToImage /> */}
                 </SignedIn>
              }
            />
          </Routes>
       
  );
}

export default App;
