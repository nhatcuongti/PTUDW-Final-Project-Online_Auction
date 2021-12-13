import mongoClient from '../utils/db.js'
import { ObjectId } from "mongodb";

const list = [
    {productID: 0, name: 'bàn gỗ 1fffffffffffffffffffffffff'},
    {productID: 1, name: 'bàn gỗ 2'},
    {productID: 2, name: 'bàn gỗ 3'},
    {productID: 3, name: 'bàn gỗ 4'},
];

async function findByIDFunc(collection, userID,proID){
    return collection.findOne({userID: userID, proID: new ObjectId(proID)})
}

async function showFavoriteListFunc(collection, id) {
    return await collection.aggregate([
        { $lookup:
                {
                    from: 'product',
                    localField: 'proID',
                    foreignField: '_id',
                    as: 'favoritedetails'
                }
        }
    ]).toArray();
}

async function deleteOneFavoriteFunc(collection, userID, proID) {
    return collection.findOneAndDelete({userID: userID,proID: new ObjectId(proID)})
}

async function addOneFavoriteFunc(collection, userID, proID) {
    return collection.insertOne({userID: userID,proID: new ObjectId(proID)})
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
    getDetailProductFavorite(list){
        let listTemp = [];
        list.forEach(function (e) {
            listTemp.push(e.favoritedetails[0])
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
            if(await findByIDFunc(collection, userID, proID) === null){
                await addOneFavoriteFunc(collection, userID, proID);
            };

        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },


}


