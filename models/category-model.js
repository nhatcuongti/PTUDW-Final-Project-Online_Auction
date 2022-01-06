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

async function insertCatParentFunc(collection, name) {
  const result = await collection.find({catParent:{$regex: new RegExp(`^${name}$`),$options: 'i'}}).toArray();
  if (result.length === 0)
    return await collection.insertOne({
      catParent: name,
      quantity: 0,
      catChild: []
    });
  return {};
}

async function insertCatChildFunc(collection, catParentId, name) {
  const result = await collection.find({
    _id:new ObjectId(catParentId),
    catChild:{$elemMatch:{
        name:{$regex: new RegExp(`^${name}$`),$options: 'i'}
    }}}).toArray();
  if (result.length === 0)
      return await collection.updateOne(
          {_id :new ObjectId(catParentId)},
          {$push:{catChild: {
              _id: new ObjectId(),
              name,
              quantity: 0
          }}}
      );
  return {};
}

async function deleteCatChildFunc(collection, catParentId, catChildId) {
  const result = await collection.find({
    _id:new ObjectId(catParentId),
    catChild:{$elemMatch:{
        _id: new ObjectId(catChildId),
        quantity: 0
      }}}).toArray();
  if (result.length !== 0)
    return await collection.updateOne(
        { _id : new ObjectId(catParentId)},
        { $pull: {catChild: {_id:new ObjectId(catChildId)}}}
    );
  return {};
}

async function editCatChildFunc(collection, catParentId, catChildId, name) {
  const result = await collection.find({
    _id:new ObjectId(catParentId),
    catChild:{$elemMatch:{
        name:{$regex: new RegExp(`^${name}$`),$options: 'i'}
      }}}).toArray();
  if (result.length === 0)
    return await collection.findOneAndUpdate({
          _id: new ObjectId(catParentId),
          'catChild._id': new ObjectId(catChildId)},
        {$set: {'catChild.$.name': name}}
    );
  return {};
}

async function editCatParentFunc(collection, catParentId, name) {
  const result = await collection.find({catParent:{$regex: new RegExp(`^${name}$`),$options: 'i'}}).toArray();
  if (result.length === 0)
    return await collection.findOneAndUpdate({
          _id: new ObjectId(catParentId)},
        {$set: {catParent: name}}
    );
  return {};
}

async function deleteCatParentFunc(collection, catParentId) {
  const result = await collection.findOneAndDelete({
    _id: new ObjectId(catParentId),
    quantity: 0
  });
  if (result.value === null)
    return {};
  return result;
}

async function countTotalCategoryFunc(collection, keyword) {
  if(keyword) {
    const result = await collection.aggregate([
      {
        '$search':{
          'index': 'custom2',
          'text': {
            'query': keyword,
            'path': ['catParent', 'catChild.name'],
            'fuzzy': {}
          }
        }
      },
      {
        $count: 'total'
      }]).toArray();
    if(result.length === 0)
      return 0;
    return result[0].total;
  }
  else
    return await collection.find().count();
}

async function getLimitCategoryFunc(collection, limit, offset, keyword) {
  if(keyword) {
    return await collection.aggregate([
      {
        '$search':{
          'index': 'custom2',
          'text': {
            'query': keyword,
            'path': ['catParent', 'catChild.name'],
            'fuzzy': {}
          }
        }
      }]).skip(offset).limit(limit).toArray();
  }
  else
    return await collection.find().skip(offset).limit(limit).toArray()
}

async function removeProductFromCatFunc(collection, catParent, catChild) {
  return await collection.findOneAndUpdate({
        catParent: catParent,
        'catChild.name': catChild},
      {$inc: {quantity: -1, 'catChild.$.quantity': -1}}
      //{$set: {'catChild.$.quantity': 10}}
  );
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
  },
  async insertCatParent(name){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('category');
      return await insertCatParentFunc(collection, name);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async insertCatChild(catParentId, name){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('category');
      return await insertCatChildFunc(collection, catParentId, name);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async deleteCatChild(catParentId, catChildId){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('category');
      return await deleteCatChildFunc(collection, catParentId, catChildId);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async editCatChild(catParentId, catChildId, name){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('category');
      return await editCatChildFunc(collection, catParentId, catChildId, name);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async editCatParent(catParentId, name){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('category');
      return await editCatParentFunc(collection, catParentId, name);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async deleteCatParent(catParentId){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('category');
      return await deleteCatParentFunc(collection, catParentId);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async countTotalCategory(keyword){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('category');
      return await countTotalCategoryFunc(collection, keyword);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async getLimitCategory(limit, offset, keyword){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('category');
      return await getLimitCategoryFunc(collection, limit, offset, keyword);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async removeProductFromCat(catParent, catChild){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('category');
      return await removeProductFromCatFunc(collection, catParent, catChild);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
};