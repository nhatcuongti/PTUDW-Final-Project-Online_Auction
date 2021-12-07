import mongoClient from '../utils/db.js'
import { ObjectId } from "mongodb";

async function addFunc(collection) {
  let product = {
    name: 'Giày nike',
    price: 1000000
  }
  await collection.insertOne(product);
}
async function findFunc(collection) {
  const product = await collection.find({ _id: new ObjectId("61af33d39c3762ee4dbe05f8") }).toArray();
  return product[0];
}


export default {
  async add() {
    try {
      await mongoClient.connect();
      console.log("Connected correctly to server");
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      await addFunc(collection);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async find() {
    try {
      await mongoClient.connect();
      console.log("Connected correctly to server");
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await findFunc(collection);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  }
};