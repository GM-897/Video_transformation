import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuthContext();
  const navigate = useNavigate();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    console.log("not signed in")
    navigate('/sign-in');
    console.log("signed in")
    return null;
  }
  console.log("signed in",isSignedIn);
  return children;
}

export default ProtectedRoute; 