import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { hashPassword, verifyPassword } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/db';

export const authOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const client = await connectToDatabase();

        const usersCollection = client.db().collection('users');
        const user = await usersCollection.findOne({
          email: credentials.email,
        });

        if (!user) {
          client.close();
          throw new Error('No user found!');
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValid) {
          client.close();
          throw new Error('Could not log you in!');
        }

        client.close();
        return {
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      console.log('SESSION TOKEN', token);
      let userData;
      if (token) {
        userData = {
          email: token.email,
          expires: session.expires,
          superUser: token.superUser,
        };
      }

      return userData;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.superUser = true;
      }

      return token;
    },
  },
};

export default NextAuth(authOptions);
