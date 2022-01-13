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

async function findByCategoryParentFunc(collection, cat, numberProduct, userID) {
  if (numberProduct === undefined)
    return await collection.find({proType: new ObjectId(cat), sellerInfo: new ObjectId(userID)}).sort({proEndDate : 1}).toArray();
  else
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
        $match: {catParent: cat}
      }
    ]).limit(numberProduct).toArray();
}

//sort({proCurBidPrice: 1}).skip(offset).limit(limit).toArray();

async function findByCategoryFunc(collection, catID, catChildType, userID) {
  return await collection.find({ proType: catID, catChildType: catChildType, sellerInfo: new ObjectId(userID)}).sort({proEndDate: 1}).toArray();
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



async function searchByTypeFunc(collection, keyword, type, limit, offset, sort, catParentFind, catChildFind, userID) {
  if (type === 'name') {
    if(sort === 'price-ascending'){
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
    }
    else if(sort === 'time-descending'){
      if (catParentFind && catChildFind){
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
            '$match':{
              'proType' : new ObjectId(catParentFind),
              'catChildType': catChildFind,
              'sellerInfo': new ObjectId(userID)
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
          }]).toArray();
      }
      else if (catParentFind){
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
            '$match':{
              'proType' : new ObjectId(catParentFind),
              'sellerInfo': new ObjectId(userID)
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
          }]).toArray();
      }
      else if (userID){
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
            $match:{
              'sellerInfo': new ObjectId(userID)
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
          }]).toArray();
      }
      else
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

async function getAllFunc(collection, userID){
  if (userID != undefined)
    return await collection.find({sellerInfo : new ObjectId(userID)}).sort({proEndDate: 1}).toArray();
  else
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
      $match: {$or: [{catParent: category }, {catChild: category}]}
    }
  ]).skip(offset).limit(limit).toArray();
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
      $match: {
        proID:{$eq: new ObjectId(proID)},
        isDenied:{$eq:0}
      }
    },
    {
      $sort: {
        "price" : -1,
        "dateBid" : -1
      }
    },
    {
      $group: {
        _id: "$userID",
        "price":{$first:"$price"},
        "dateBid":{$first:"$dateBid"},
        "isDenied":{$first:"$isDenied"},
        "curProPrice":{$first:"$price"},
      }
    },
    {
      $lookup: {
        from: 'account',
        localField: '_id',
        foreignField: '_id',
        as: 'bidderInfo'
      }
    }
  ]).sort({"price" : -1, "dateBid" : -1}).toArray();
}

async function denyUserOnBidderHistoryFunc(collection, productID, userID){
  const myQuery = {"proID" : new ObjectId(productID), "userID" : new ObjectId(userID)};
  const myUpdate =  {$set : {isDenied : 1}};

  await collection.updateMany(myQuery, myUpdate);
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

async function getAutoExtendProductFunc(collection){

  const myQuery = {autoExtend: true, isExtend: false};
  const products = await collection.aggregate([
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
      $match: {autoExtend: true, isExtend: false}
    }
  ]).toArray();
  // const products = await collection.find(myQuery).toArray();

  for (let i =products.length - 1; i>=0; i--) {
    const endDate = products[0].proEndDate.getTime();
    const currentDate = new Date().getTime();
    if (currentDate > endDate) {
      products.splice(i, 1);
      continue;
    }

    const diffTime = Math.abs(currentDate - endDate);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    if (diffMinutes > 5 || products[0].isExtend || diffHours > 1)
      products.splice(i, 1);
      continue;
  }

  return products;
}

async function updateProEndDateFunc(collection, proID, newDate){
  const myQuery = {"_id" : new ObjectId(proID)};
  const myUpdate =  {$set : {proEndDate : newDate, isExtend : true}};

  await collection.updateOne(myQuery, myUpdate);
}

async function updateProNameEnglishFunc(collection, proID, proNameEnglish){
  const myQuery = {"_id" : new ObjectId(proID)};
  const myUpdate =  {$set : {proNameEnglish : proNameEnglish}};

  await collection.updateOne(myQuery, myUpdate);
}

async function updateProductFunc(collection, ProID, attritubes){
  const myQuery = {"_id" : new ObjectId(ProID)};
  const myUpdate =  {$set : attritubes};

  await collection.updateOne(myQuery, myUpdate);
}

async function searchVietnameseFunc(collection, keyword){
    return await collection.aggregate([
      {
        '$search':{
          'index': 'custom',
          'text': {
            'query': keyword,
            'path': 'proNameEnglish',
            'fuzzy': {}
          }
        }
      }]).toArray();
}

async function updatePriceAndCurrentBidderFunc(collection, productID, currentPrice, userID, highestPrice){
  const myQuery = {"_id" : new ObjectId(productID)};
  const myUpdate =  {$set : {curBidderInfo : userID, proCurBidPrice: currentPrice, proHighestPrice: highestPrice}};

  await collection.updateOne(myQuery, myUpdate);
}

async function updateSellerCommentFunc(collection, ProID, isSellerComment){
  const myQuery = {"_id" : new ObjectId(ProID)};
  const myUpdate =  {$set : {isSellerComment: isSellerComment}};

  await collection.updateOne(myQuery, myUpdate);
}

async function updateCatParentFunc(collection, catOld, catNew) {
  return await collection.updateMany({
        catParent: catOld},
      {$set: {catParent: catNew}}
  );
}

async function updateCatChildFunc(collection, catParent, catOld, catNew) {
  return await collection.updateMany({
        catParent: catParent,
        catChild: catOld},
      {$set: {catChild: catNew}}
  );
}

async function getBidderHistoryWithProIDUserIDFunc(collection, ProID, userID){
  // // const myQuery = {"proID" : new ObjectId(ProID), "userID" : new ObjectId(userID)};
  // const products = await collection.aggregate([
  //   {
  //     $match: {
  //       userID: new ObjectId(ProID),
  //       proID: new ObjectId(userID)
  //     }
  //   }
  // ]).toArray();
  // return products;
  return await collection.find({proID : new ObjectId(ProID), userID : new ObjectId(userID), isDenied: 1}).toArray();
}

//----------------------------------------------------------------------------------------//
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
  async findByCategoryParent(cat, numberProduct, userID) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await findByCategoryParentFunc(collection, cat, numberProduct, userID);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async findByCategory(catID, catChildType, userID){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      const id = new ObjectId(catID);
      return await findByCategoryFunc(collection, id, catChildType, userID);
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
  async searchByType(keyword, type, limit, offset, sort, catParentFind, catChildFind, userID) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      // async function searchByTypeFunc(collection, keyword, type, limit, offset, sort, catParentFind, catChildFind, userID) {

      const result = await searchByTypeFunc(collection, keyword, type, limit, offset, sort, catParentFind, catChildFind, userID);
      return result;
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async searchVietnamese(keyword){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');

      const result = await searchVietnameseFunc(collection, keyword);
      return result;
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  }
  ,
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
  async getAll(userID) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await getAllFunc(collection, userID);
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
  },
  async getAutoExtendProduct() {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await getAutoExtendProductFunc(collection);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async updateProEndDate(proID, newDate) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      await updateProEndDateFunc(collection, proID, newDate);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async updateProNameEnglish(product) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      await updateProNameEnglishFunc(collection, product._id, product.proNameEnglish);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async updatePriceAndCurrentBidder(productID, currentPrice, userID, highestPrice) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      await updatePriceAndCurrentBidderFunc(collection, productID, currentPrice, userID, highestPrice);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async updateSellerComment(ProID, isSellerComment) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      await updateSellerCommentFunc(collection, ProID, isSellerComment);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async updateProduct(ProID, attritubes){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      await updateProductFunc(collection, ProID, attritubes);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async updateCatParent(catOld, catNew){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      await updateCatParentFunc(collection, catOld, catNew);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async updateCatChild(catParent, catOld, catNew){
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      await updateCatChildFunc(collection, catParent, catOld, catNew)
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async updateTest() {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      await updateCatChildFunc(collection)
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async getBidderHistoryWithProIDUserID(ProID, UserID) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('bidderHistory');
      return await getBidderHistoryWithProIDUserIDFunc(collection, ProID, UserID);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  }
};