import mongoClient from '../utils/db.js'
import { ObjectId } from "mongodb";


async function findTopExpirationFunc(collection, now) {
  return await collection.aggregate([
    {
      $lookup: {
        from: 'account',
        localField: 'sellerInfo',
        foreignField: '_id',
        as: 'sellerInfo'
      },
    },
    {
      $lookup: {
        from: 'account',
        localField: 'curBidderInfo',
        foreignField: '_id',
        as: 'curBidderInfo'
      }
    },
    {
      $match: {proEndDate:{$gt: now}}
    }
  ]).sort({proEndDate: 1}).limit(5).toArray();
}

async function findTopBidFunc(collection, now) {
  return await collection.aggregate([
    {
      $lookup: {
        from: 'account',
        localField: 'sellerInfo',
        foreignField: '_id',
        as: 'sellerInfo'
      },
    },
    {
      $lookup: {
        from: 'account',
        localField: 'curBidderInfo',
        foreignField: '_id',
        as: 'curBidderInfo'
      }
    },
    {
      $match: {proEndDate:{$gt: now}}
    }
  ]).sort({proBidQuantity: -1}).limit(5).toArray();
}

async function findTopPriceFunc(collection, now) {
  return await collection.aggregate([
    {
      $lookup: {
        from: 'account',
        localField: 'sellerInfo',
        foreignField: '_id',
        as: 'sellerInfo'
      },
    },
    {
      $lookup: {
        from: 'account',
        localField: 'curBidderInfo',
        foreignField: '_id',
        as: 'curBidderInfo'
      }
    },
    {
      $match: {proEndDate:{$gt: now}}
    }
  ]).sort({proCurBidPrice: -1}).limit(5).toArray();
}

async function findByIdFunc(collection, id) {
  return await collection.aggregate([
    {
      $lookup: {
        from: 'account',
        localField: 'sellerInfo',
        foreignField: '_id',
        as: 'sellerInfo'
      },
    },
    {
      $lookup: {
        from: 'account',
        localField: 'curBidderInfo',
        foreignField: '_id',
        as: 'curBidderInfo'
      }
    },
    {
      $match: {_id: new ObjectId(id)}
    }
  ]).toArray();
}

async function findByCategoryParentFunc(collection, cat, numberProduct) {
  if (numberProduct === undefined)
    return await collection.find({proType: new ObjectId(cat)}).sort({proEndDate : 1}).toArray();
  else
    return await collection.find({catParent: cat}).limit(numberProduct).toArray();
}

async function findByCategoryFunc(collection, catID, catChildType) {
  return await collection.find({ proType: catID, catChildType: catChildType}).sort({proEndDate: 1}).toArray();
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
            'path': ['catParent','catChild'],
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
        },
        {
          $lookup: {
            from: 'account',
            localField: 'sellerInfo',
            foreignField: '_id',
            as: 'sellerInfo'
          },
        },
        {
          $lookup: {
            from: 'account',
            localField: 'curBidderInfo',
            foreignField: '_id',
            as: 'curBidderInfo'
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
        },
        {
          $lookup: {
            from: 'account',
            localField: 'sellerInfo',
            foreignField: '_id',
            as: 'sellerInfo'
          },
        },
        {
          $lookup: {
            from: 'account',
            localField: 'curBidderInfo',
            foreignField: '_id',
            as: 'curBidderInfo'
          }
        }]).sort({proEndDate: -1}).skip(offset).limit(limit).toArray();
  }
  else if (type === 'category') {
    if(sort === 'price-ascending')
      return await collection.aggregate([
        {
          '$search':{
            'index': 'custom',
            'text': {
              'query': keyword,
              'path': ['catParent','catChild'],
              'fuzzy': {}
            }
          }
        },
        {
          $lookup: {
            from: 'account',
            localField: 'sellerInfo',
            foreignField: '_id',
            as: 'sellerInfo'
          },
        },
        {
          $lookup: {
            from: 'account',
            localField: 'curBidderInfo',
            foreignField: '_id',
            as: 'curBidderInfo'
          }
        }]).sort({proCurBidPrice: 1}).skip(offset).limit(limit).toArray();
    else if(sort === 'time-descending')
      return await collection.aggregate([
        {
          '$search':{
            'index': 'custom',
            'text': {
              'query': keyword,
              'path': ['catParent','catChild'],
              'fuzzy': {}
            }
          }
        },
        {
          $lookup: {
            from: 'account',
            localField: 'sellerInfo',
            foreignField: '_id',
            as: 'sellerInfo'
          },
        },
        {
          $lookup: {
            from: 'account',
            localField: 'curBidderInfo',
            foreignField: '_id',
            as: 'curBidderInfo'
          }
        }]).sort({proEndDate: -1}).skip(offset).limit(limit).toArray();
  }
}

async function countTotalProductFunc(collection){
  return await collection.find().count();
}

async function getLimitProductFunc(collection, limit, offset){
  return await collection.aggregate([
    {
      $lookup: {
        from: 'account',
        localField: 'sellerInfo',
        foreignField: '_id',
        as: 'sellerInfo'
      },
    },
    {
      $lookup: {
        from: 'account',
        localField: 'curBidderInfo',
        foreignField: '_id',
        as: 'curBidderInfo'
      }
    }
  ]).skip(offset).limit(limit).toArray()
}

async function getAllFunc(collection){
  return await collection.find().sort({proEndDate: 1}).toArray();
}

async function insertDataFunc(collection, data){
  var idImageInsert;
  await collection.insertOne(data);
  return data._id;
}

async function updateDescriptionFunc(collection, ProID, description){
  return await collection.updateMany({_id : ProID}, {$set: {proDescription: description}});
}

async function deleteProductFunc(collection, id) {
  return await collection.deleteOne({ _id: id });
}

async function countTotalCategoryProductFunc(collection, category) {
  return await collection.find({$or: [{catParent: category }, {catChild: category}]}).count();
}

async function getLimitCategoryProductFunc(collection, limit, offset, category) {
  return await collection.find({$or: [{catParent: category }, {catChild: category}]}).skip(offset).limit(limit).toArray();
}

async function getExpiredProductFunc(collection, now) {
  return await collection.aggregate([
    {
      $lookup: {
        from: 'account',
        localField: 'sellerInfo',
        foreignField: '_id',
        as: 'sellerInfo'
      },
    },
    {
      $lookup: {
        from: 'account',
        localField: 'curBidderInfo',
        foreignField: '_id',
        as: 'curBidderInfo'
      }
    },
    {
      $match: {proEndDate:{$lte: now, $gt: new Date(now - 60000)}}
    }
  ]).toArray();
}

async function getBidderHistoryWithProIDFunc(collection, proID){
  return await collection.aggregate([
    {
      $lookup: {
        from: 'account',
        localField: 'userID',
        foreignField: '_id',
        as: 'sellerInfo'
      },
    },
    {
      $match: {
        proID:{$eq: new ObjectId(proID)},
        isDenied:{$eq:0}
      }
    }
  ]).sort({"price" : -1, "dateBid" : -1}).toArray();
}

async function denyUserOnBidderHistoryFunc(collection, productID, userID){
  const myQuery = {"proID" : new ObjectId(productID), "userID" : new ObjectId(userID)};
  const myUpdate =  {$set : {isDenied : 1}};

  await collection.updateOne(myQuery, myUpdate);
}

async function updateCurrenBidderInforFunc(collection, ProID, newUser){
  const myQuery = {"_id" : new ObjectId(ProID)};
  const myUpdate =  {$set : {curBidderInfo : newUser}};

  await collection.updateOne(myQuery, myUpdate);
}

async function updatePriceProductFunc(collection, productID, maximumPrice){
  const myQuery = {"_id" : new ObjectId(productID)};
  const myUpdate =  {$set : {proCurBidPrice : maximumPrice}};

  await collection.updateOne(myQuery, myUpdate);
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
  async countTotalProduct() {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      const result = await countTotalProductFunc(collection);
      return result;
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async getLimitProduct(limit, offset) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      const result = await getLimitProductFunc(collection, limit, offset);
      return result;
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async deleteProduct(proId) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      const id = new ObjectId(proId);
      return await deleteProductFunc(collection, id);
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
  },
  async countTotalCategoryProduct(category) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await countTotalCategoryProductFunc(collection, category);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async getLimitCategoryProduct(limit, offset, category) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await getLimitCategoryProductFunc(collection, limit, offset, category);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async getExpiredProduct(now) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await getExpiredProductFunc(collection, now);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async getBidderHistoryWithProID(proID) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('bidderHistory');
      return await getBidderHistoryWithProIDFunc(collection, proID);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async denyUserOnBidderHistory(productID, userID) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('bidderHistory');
      await denyUserOnBidderHistoryFunc(collection, productID, userID);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async updateCurrenBidderInfor(ProID, newUser) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      await updateCurrenBidderInforFunc(collection, ProID, newUser);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async updatePriceProduct(productID, maximumPrice) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      await updatePriceProductFunc(collection, productID, maximumPrice);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  }
};