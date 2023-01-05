import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { hashPassword, verifyPassword } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/db';

export default NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        console.log(credentials);
        const client = await connectToDatabase();

        const usersCollection = client.db().collection('users');
        const user = await usersCollection.findOne({
          email: credentials.email,
        });

        if (!user) {
          client.close();
          throw new Error('No user found!');
        }

        console.log(credentials.password);
        console.log(user.password);
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
});
