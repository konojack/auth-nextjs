import { connectToDatabase } from '../../../lib/db';
import Joi from 'joi';
import { hashPassword } from '../../../lib/auth';

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(7),
});

async function handler(req, res) {
  if (req.method == 'POST') {
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

    var users = db.collection('users');
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      res.status(422).json({ success: false, err: 'User exists in DB!' });
      client.close();
      return;
    }

    const hashedPassword = await hashPassword(data.password);

    const result = await users.insertOne({
      email: data.email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'Created user!', id: result.insertedId });
    client.close();
  }
}

export default handler;
