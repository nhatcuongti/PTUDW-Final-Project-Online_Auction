import mongoClient from '../utils/db.js'
import { ObjectId } from "mongodb";

const list = [
    {productID: 0, name: 'bàn gỗ 1fffffffffffffffffffffffff'},
    {productID: 1, name: 'bàn gỗ 2'},
    {productID: 2, name: 'bàn gỗ 3'},
    {productID: 3, name: 'bàn gỗ 4'},
];

async function findByIDFavoriteFunc(collection, id) {
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

function deleteOneFavoriteFunc(collection, pro, user) {
    return collection.findOneAndDelete({proID: new ObjectId(pro)})
}

export default {
    async findByIDFavorite(id) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('favoriteList');
            return await findByIDFavoriteFunc(collection, id);
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

    async deleteOneFavorite(proID, userID) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('favoriteList');
            await deleteOneFavoriteFunc(collection, proID, userID);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },

}


