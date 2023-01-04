import { connectToDatabase } from '../../../lib/db';
import Joi from 'joi';
import { hashPassword } from '../../../lib/auth';

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(7),
});

async function handler(req, res) {
  let data = req.body;
  const { email, password } = data;

  let client;
  try {
    client = await connectToDatabase();
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, err: 'CANNOT CONNECT TO DB!' });
  }

  try {
    data = await schema.validateAsync({ email, password });
  } catch (err) {
    client.close();
    return res
      .status(422)
      .json({ success: false, err: err.details[0].message });
  }

  const db = client.db();
  const hashedPassword = hashPassword(data.password);

  const result = await db
    .collection('users')
    .insertOne({ email: data.email, password: hashedPassword });

  res.status(201).json({ message: 'Created user!' });
}

export default handler;
