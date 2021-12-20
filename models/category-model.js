import mongoClient from '../utils/db.js'
import { ObjectId } from "mongodb";




async function findByIDFunc(collection, id) {
  return await collection.find({ _id: id }).toArray();
}

async function countProduct(collection) {
  return await collection.count();
}

async function getAllFunc(collection){
  return await collection.find().toArray();
}

async function getCatParentFunc(collection){
  return await collection.distinct('catParentName');
}

async function getCatChildFunc(collection, id){
  return await collection.find({_id : new ObjectId(id)}).toArray();
}


async function insertDataFunc(collection, data){
   await collection.insertOne(data);
}


export default {
  async findByID(id) {
    try {
      await mongoClient.connect();
      const db =  mongoClient.db('onlineauction');
      const collection = db.collection('category');
      const cat =  await findByIDFunc(collection, id);

      let prevPage = null;
      let nextPage = null;
      let curPage = null;

      if (cat.length === 0)
        return null;

      return cat;
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },

  async countProduct() {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('category');
      return await countProduct(collection);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },

  async getAll() {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('category');
      return await getAllFunc(collection);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },

  async getCatParent() {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('category');
      return await getCatParentFunc(collection);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },

  async getCatChild(id){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('category');
      return await getCatChildFunc(collection, id);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async insertData(data){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('category');
      await insertDataFunc(collection, data);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  }
};