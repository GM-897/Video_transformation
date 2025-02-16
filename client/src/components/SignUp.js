import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import styles from './Auth.module.css';

function SignUp() {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Create Account</h1>
        <ClerkSignUp 
          appearance={{
            elements: {
              formButtonPrimary: styles.authButton,
              card: styles.clerkCard,
            }
          }}
          routing="path"
          path="/sign-up"
          redirectUrl="http://localhost:3001/"
          signInUrl="/sign-in"
          />

      </div>
    </div>
  );
}

export default SignUp; 