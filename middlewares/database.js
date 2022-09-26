import { MongoClient } from 'mongodb';

const client = new MongoClient("mongodb+srv://Admin:admin123@nextldcrud.5nhms3d.mongodb.net/Authenticate?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
export async function setUpDb(db) {
  db.collection('users').createIndex({ email: 1 }, { unique: true });
}

export default async function database(req, res, next) {
  if (!client.isConnected()) await client.connect();
  req.dbClient = client;
  req.db = client.db("User-Manage");
  await setUpDb(req.db);
  return next();
}
