import mongoClient from '../utils/db.js'
import { ObjectId } from "mongodb";
import productMD from "./product-model.js";

const list = [
    {productID: 0, name: 'bàn gỗ 1fffffffffffffffffffffffff'},
    {productID: 1, name: 'bàn gỗ 2'},
    {productID: 2, name: 'bàn gỗ 3'},
    {productID: 3, name: 'bàn gỗ 4'},
];

async function findByIDFunc(collection, userID,proID){
    return collection.findOne({userID: new ObjectId(userID), proID: new ObjectId(proID)})
}

async function showFavoriteListFunc(collection, id) {
    return await collection.aggregate([
        { $match: { userID: new ObjectId(id) } },
        { $lookup:
                {
                    from: 'product',
                    localField: 'proID',
                    foreignField: '_id',
                    as: 'details'
                }
        }
    ]).toArray();
}

async function showBidderHistoryFunc(collection, id) {
    // let time = moment().format();
    return await collection.aggregate([
        { $match: { userID: new ObjectId(id) } },
        { $lookup:
                {
                    from: 'product',
                    localField: 'proID',
                    foreignField: '_id',
                    as: 'details'
                }
        }
    ]).toArray();
}

// async function showFavoriteListFunc(collection, id) {
//     let userFavorite = await collection.find({userID: id},{}).toArray();
//     userFavorite.list
// }

async function deleteOneFavoriteFunc(collection, userID, proID) {
    return collection.findOneAndDelete({userID: new ObjectId(userID),proID: new ObjectId(proID)})
}

async function addOneFavoriteFunc(collection, userID, proID) {
    return collection.insertOne({userID: new ObjectId(userID),proID: new ObjectId(proID)})
}

async function bidderCommentFunc(dbo,collection, userID, proID, productDetail,rate, comment) {
    if(productDetail.isBidderComment)
        return
    const check = await collection.findOne({proID: proID});
    if(check === null) {
        dbo.collection('product').findOneAndUpdate({_id: new ObjectId(proID)}, {$set: {isBidderComment: true}})
        return collection.insertOne({
            proID: proID,
            bidderComment: comment,
            sellerComment: "",
            bidderRate: rate,
            sellerRate: "",
            bidderID: userID,
            sellerID: productDetail.sellerInfo
        })
    }
    else{
        dbo.collection('product').updateOne({_id: new ObjectId(proID)}, {$set: {isBidderComment: true}})
        return collection.updateOne({proID: proID}, {$set: {bidderComment: comment, bidderRate: rate}})
    }
}

export default {
    async showFavoriteList(id) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('favoriteList');
            return await showFavoriteListFunc(collection, id);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    getProductsOnAuction (list){
        let listTemp = [];
        list.forEach(function (e) {
            if(e.details[0].proEndDate > new Date())
                listTemp.push(e)
        })
        return listTemp;
    },
    getSuccessfulAuction(userID,list){
        let listTemp = [];
        list.forEach(function (e) {
            if( e.details[0].proEndDate <= new Date()&&e.details[0].curBidderInfo == new ObjectId(userID))
                listTemp.push(e)
        })
        return listTemp;
    },


    async deleteOneFavorite(userID, proID) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('favoriteList');
            await deleteOneFavoriteFunc(collection, userID, proID);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },

    async addOneFavorite(userID, proID) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('favoriteList');
            const check = await findByIDFunc(collection, userID, proID);
            console.log(check)
            if(check  === null ){
                await addOneFavoriteFunc(collection, userID, proID);
            };

        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async showBidderHistory(id) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('bidderHistory');
            return await showBidderHistoryFunc(collection, id);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close();
        }
    },
    async bidderComment(userID, proID,productDetail,rate,comment ) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('comment');
            await bidderCommentFunc(db,collection,userID, proID,productDetail,rate,comment);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },


}


