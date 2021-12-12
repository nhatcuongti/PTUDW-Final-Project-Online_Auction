import mongoClient from '../utils/db.js'
import { ObjectId } from "mongodb";

/*
async function addFunc(collection) {
  const product = {
    proName: 'Giày Thể Thao Nam Biti’s Hunter X Z MIDNIGHT BLACK MID DSMH06301DEN (Đen)',
    proBuyNowPrice: 1199000,
    curBidderInfo: 'Trong Le',
    proCurBidPrice: 500000,
    proPriceStep: 100000,
    proBidQuantity: 6,
    proStartDate: new Date(2021, 11, 23),
    proEndDate: new Date(),
    sellerInfo: 'Trong Le',
    proDescription: 'Giày Thể Thao Nam Biti’s Hunter X Z Collection phom dáng cổ cao đầu tiên được ra mắt.\n' +
        'Lấy ngôn ngữ thiết kế mạnh mẽ làm điểm nhấn, Biti\'s Hunter X Mới sẽ là lựa chọn nâng tầm cho người trẻ đam mê phong cách.\n' +
        'Mũ quai: Công nghệ Liteknit co giãn tốt, mềm mại, thoáng khí. Phần trong cổ cao co giãn, ôm sát & xỏ chân thoải mái.\n' +
        'Đế lót: Chất liệu Ortholite kháng khuẩn, ngãn mùi, công nghệ 6 điểm massage lòng bàn chân.\n' +
        'Bộ đế LITEFLEX 2.0 MỚI:\n' +
        '- Chất liệu IP " nhẹ như bay" chỉ từ 204g\n' +
        '- Chiều cao đế đạt tới 5cm\n' +
        '- Độ đàn hồi > 40%\n' +
        '- Cao su tăng ma sát.',
    proType: 'Giày dép'
  }
  await collection.insertOne(product);
}
async function findFunc(collection) {
  const product = await collection.find({ _id: new ObjectId("61af33d39c3762ee4dbe05f8") }).toArray();
  return product[0];
}
*/

async function findNearEndFunc(collection, now) {
  return await collection.find({ proEndDate: {$gt: now} }).sort({proEndDate: -1}).limit(5).toArray();
}

async function findMostBidFunc(collection, now) {
  return await collection.find({ proEndDate: {$gt: now} }).sort({proBidQuantity: -1}).limit(5).toArray();
}

async function findHighestPriceFunc(collection, now) {
  return await collection.find({ proEndDate: {$gt: now} }).sort({proCurBidPrice: -1}).limit(5).toArray();
}

async function findByIDFunc(collection, id) {
  return await collection.find({ _id: new ObjectId(id) }).toArray();
}

async function findByCategoryFunc(collection, cat) {
  return await collection.find({ proType: cat }).limit(5).toArray();
}

async function countProduct(collection) {
  return await collection.count();
}

async function searchByTypeFunc(collection, keyword, type, limit, offset) {
  if (type === 'name')
    return await collection.aggregate([
        {
          '$search':{
            'index': 'custom',
            'text': {
              'query': keyword,
              'path': 'proName'
            }
          }
        }]).skip(offset).limit(limit).toArray();
  else
    return await collection.aggregate([
        {
          '$search':{
            'index': 'custom',
            'text': {
              'query': keyword,
              'path': 'proType'
            }
          }
    }]).skip(offset).limit(limit).toArray();
}

export default {
  /*
  async add() {
    try {
      await mongoClient.connect();
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
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await findFunc(collection);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
   */
  async findNearEnd(now) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await findNearEndFunc(collection, now);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async findMostBid(now) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await findMostBidFunc(collection, now);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async findHighestPrice(now) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await findHighestPriceFunc(collection, now);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
  async findByID(id) {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await findByIDFunc(collection, id);
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
  async countProduct() {
    try {
      await mongoClient.connect();
      const db = mongoClient.db('onlineauction');
      const collection = db.collection('product');
      return await countProduct(collection);
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
      return await searchByTypeFunc(collection, keyword, type, limit, offset);
    } catch (e) {
      console.error(e);
    } finally {
      await mongoClient.close()
    }
  },
};