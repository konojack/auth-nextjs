import { connectToDatabase } from '../../../lib/db';
import Joi from 'joi';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { hashPassword, verifyPassword } from '../../../lib/auth';

const schema = Joi.object({
  oldPassword: Joi.string().min(7),
  newPassword: Joi.string().min(7),
});

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return;
  }

  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: 'NOT AUTHENTICATED!' });
    return;
  }

  const userEmail = session.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  let client;
  try {
    client = await connectToDatabase();
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, err: 'CANNOT CONNECT TO DB!' });
  }

  let data;
  try {
    data = await schema.validateAsync({ oldPassword, newPassword });
  } catch (err) {
    console.log(err);
    client.close();
    return res
      .status(422)
      .json({ success: false, err: err.details[0].message });
  }

  const db = client.db();

  var users = db.collection('users');
  const existingUser = await users.findOne({ email: userEmail });
  console.log(existingUser);

  if (existingUser) {
    const isValidPassword = await verifyPassword(
      data.oldPassword,
      existingUser.password
    );

    if (!isValidPassword) {
      res.status(403).json({ success: false, err: 'Bad old password' });
      client.close();
      return;
    }

    const hashedPassword = await hashPassword(data.newPassword);
    const result = await users.updateOne(
      { email: existingUser.email },
      { $set: { password: hashedPassword } }
    );
  }

  client.close();
  return res.status(201).json({ message: 'Updated password!' });
}

export default handler;
