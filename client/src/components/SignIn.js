import { SignIn as ClerkSignIn, SignedOut } from '@clerk/clerk-react';
import styles from './Auth.module.css';

function SignIn() {
  return (

    <div className={styles.authContainer}>
      <SignedOut>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Welcome Back</h1>
        <ClerkSignIn 
          appearance={{
            elements: {
              formButtonPrimary: styles.authButton,
              card: styles.clerkCard,
            }
          }}
          routing="path"
          path="/sign-in"
          // redirectUrl="http://localhost:3001/"
          signUpUrl="/sign-up"
          
          />
      </div>
          </SignedOut>
    </div>
  );
}

export default SignIn; 