import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://sa:finalproject123@onlineauction.rbo27.mongodb.net';
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export default mongoClient;
