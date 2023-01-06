import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import AuthForm from '../components/auth/auth-form';

function AuthPage() {
  const router = useRouter();
  useEffect(() => {
    getSession().then(session => {
      if (session) {
        router.replace('/profile');
      }
    });
  }, []);

  return <AuthForm />;
}

export default AuthPage;
