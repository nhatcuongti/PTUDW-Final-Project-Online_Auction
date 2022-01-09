import mongoClient from '../utils/db.js'
import { ObjectId } from "mongodb";
import productModel from "./product-model.js";

async function insertBidtoHistory(collection, userID, proID, price) {
    return collection.insertOne({
        dateBid: new Date(),
        price: price,
        userID: new ObjectId(userID),
        proID: new ObjectId(proID),
        isDenied: 0
    })
}

async function processBidFunc(collection, userID, proID, priceString, productInfor) {
    const price = parseInt(priceString)
    console.log(productInfor)
    const oldHighestPrice = productInfor.proHighestPrice
    const oldProductPrice = productInfor.proCurBidPrice
    // const oldBidder = productInfor.curBidderInfo.toString()
    const proPriceStep = productInfor.proPriceStep
    console.log(oldHighestPrice, oldHighestPrice, typeof oldHighestPrice, typeof price)
    let curHighestPrice
    let curProductPrice
    let curBidder


    if(price > oldHighestPrice){
        curProductPrice = oldHighestPrice + proPriceStep
        curHighestPrice = price
        curBidder = userID
        return await collection.updateOne({_id: new ObjectId(proID)}, { $set: {
                    curBidderInfo: new ObjectId(curBidder),
                    proCurBidPrice: curProductPrice,
                    proHighestPrice: curHighestPrice,
                }
        })

    }
    else if (price === oldHighestPrice){
        curProductPrice = oldHighestPrice
        return await collection.updateOne({_id: new ObjectId(proID)}, { $set: {
                    proCurBidPrice: curProductPrice
                }
        })

    }
    else if (price < oldHighestPrice && price > oldProductPrice){
        curProductPrice = price;
         return await collection.updateOne({_id: new ObjectId(proID)}, { $set: {
                    proCurBidPrice: curProductPrice
                }
        })
    }
    return
}

export default {
    async processBid(userID, proID, price, proInfor) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('product');
            return await processBidFunc(collection, userID, proID, price, proInfor);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async insertBidIntoHistory(userID, proID, price) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('bidderHistory');
            return await insertBidtoHistory(collection, userID, proID, price);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
}