import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';  
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import VideoUploadForm from './components/VideoUploadForm';
import PromptToImage from './components/promptToImage';


// App.js
function App() {
  return (

        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <VideoUploadForm />
                </SignedIn>
                <SignedOut>
                  <VideoUploadForm />
                </SignedOut>
              </>
            }
          />
        </Routes>
  );
}

export default App;