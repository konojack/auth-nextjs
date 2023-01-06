import { unstable_getServerSession } from 'next-auth';
import UserProfile from '../components/profile/user-profile';
import { authOptions } from './api/auth/[...nextauth]';

export async function getServerSideProps({ req, res }) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    };
  }
  return {
    props: {
      userSession: session,
    },
  };
}

function ProfilePage({ userSession }) {
  console.log('PROFILE PAGE', userSession);
  return <UserProfile />;
}

export default ProfilePage;
