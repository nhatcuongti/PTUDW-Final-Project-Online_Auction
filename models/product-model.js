import mongoClient from '../utils/db.js'
import { ObjectId } from "mongodb";


async function findTopExpirationFunc(collection, now) {
  return await collection.find({ proEndDate: {$gt: now} }).sort({proEndDate: -1}).limit(5).toArray();
}

async function findTopBidFunc(collection, now) {
  return await collection.find({ proEndDate: {$gt: now} }).sort({proBidQuantity: -1}).limit(5).toArray();
}

async function findTopPriceFunc(collection, now) {
  return await collection.find({ proEndDate: {$gt: now} }).sort({proCurBidPrice: -1}).limit(5).toArray();
}

async function findByIdFunc(collection, id) {
  return await collection.find({ _id: new ObjectId(id) }).toArray();
}

async function findByCategoryFunc(collection, cat) {
  return await collection.find({ proType: cat }).limit(5).toArray();
}

async function countTotalProductFunc(collection) {
  return await collection.count();
}

async function searchByTypeFunc(collection, keyword, type, limit, offset) {
  if (type === 'name') {
    //collection.createIndex({proName: 'text'});
    //return await collection.find({$text: {$search: keyword}}).skip(offset).limit(limit).toArray();
    return await collection.aggregate([
      {
        '$search':{
          'index': 'custom',
          'text': {
            'query': keyword,
            'path': 'proName',
            'fuzzy': {}
          }
        }
      }]).skip(offset).limit(limit).toArray();
  }
  else {
    //collection.createIndex({proType: 'text'});
    //return await collection.find({$text: {$search: keyword}}).skip(offset).limit(limit).toArray();
    return await collection.aggregate([
      {
        '$search':{
          'index': 'custom',
          'text': {
            'query': keyword,
            'path': 'proType',
            'fuzzy': {}
          }
        }
      }]).skip(offset).limit(limit).toArray();
  }
}

async function getAllFunc(collection){
  return await collection.find().toArray();
}

async function insertDataFunc(collection, data){
  var idImageInsert;
  await collection.insertOne(data);
  return data._id;
}

async function updateDescriptionFunc(collection, ProID, description){
  return await collection.updateMany({_id : ProID}, {$set: {proDescription: description}});
}



export default {
  async findTopExpiration(now) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await findTopExpirationFunc(collection, now);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async findTopBid(now) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await findTopBidFunc(collection, now);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async findTopPrice(now) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await findTopPriceFunc(collection, now);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async findById(id) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await findByIdFunc(collection, id);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async findByCategory(cat) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await findByCategoryFunc(collection, cat);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async countTotalProduct() {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await countTotalProductFunc(collection);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async searchByType(keyword, type, limit, offset) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      const result = await searchByTypeFunc(collection, keyword, type, limit, offset);
      //await collection.dropIndexes();
      return result;
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
      const collection = db.collection('product');
      return await getAllFunc(collection);
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
      const collection = db.collection('product');
      return await insertDataFunc(collection, data);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },

  async updateDescription(ProID, description){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await updateDescriptionFunc(collection, ProID, description);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  }
};