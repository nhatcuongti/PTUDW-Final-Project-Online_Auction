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

async function findByCategoryParentFunc(collection, cat, numberProduct) {
  if (numberProduct === undefined)
    return await collection.find({ proType: cat }).toArray();
  else
    return await collection.find({ proType: cat }).limit(numberProduct).toArray();
}

async function findByCategoryFunc(collection, catID, catChildType) {
  return await collection.find({ proType: catID, catChildType: catChildType}).toArray();
}

async function countTotalSearchProductFunc(collection, keyword, type) {
  if (type === 'name') {
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
      },
      {
        $count: 'total'
      }]).toArray();
  }
  else if (type === 'category') {
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
      },
      {
        $count: 'total'
      }]).toArray();
  }

}

async function searchByTypeFunc(collection, keyword, type, limit, offset, sort) {
  if (type === 'name') {
    if(sort === 'price-ascending')
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
        }]).sort({proCurBidPrice: 1}).skip(offset).limit(limit).toArray();
    else if(sort === 'time-descending')
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
        }]).sort({proEndDate: -1}).skip(offset).limit(limit).toArray();
  }
  else if (type === 'category') {
    //collection.createIndex({proType: 'text'});
    //return await collection.find({$text: {$search: keyword}}).skip(offset).limit(limit).toArray();
    if(sort === 'price-ascending')
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
        }]).sort({proCurBidPrice: 1}).skip(offset).limit(limit).toArray();
    else if(sort === 'time-descending')
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
        }]).sort({proEndDate: -1}).skip(offset).limit(limit).toArray();
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
  async findByCategoryParent(cat, numberProduct) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await findByCategoryParentFunc(collection, cat, numberProduct);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async findByCategory(catID, catChildType){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      const id = new ObjectId(catID);
      return await findByCategoryFunc(collection, id, catChildType);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async countTotalSearchProduct(keyword, type) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await countTotalSearchProductFunc(collection, keyword, type);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },

  async searchByType(keyword, type, limit, offset, sort) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      const result = await searchByTypeFunc(collection, keyword, type, limit, offset, sort);
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