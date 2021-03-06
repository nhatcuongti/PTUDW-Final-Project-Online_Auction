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

async function showAllCommentFunc(collection, id) {
    // let time = moment().format();
    return await collection.aggregate([
        { $match: { bidderID: id } },
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

async function getCommentWithProIDFunc(collection, ProID) {
    // let time = moment().format();
    return await collection.aggregate([
        { $match: { "proID": new ObjectId(ProID) } }
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
    const check = await collection.findOne({proID: new ObjectId(proID)});
    if(check === null) {
        dbo.collection('product').findOneAndUpdate({_id: new ObjectId(proID)}, {$set: {isBidderComment: true}})
        return collection.insertOne({
            proID: new ObjectId(proID),
            bidderComment: comment,
            sellerComment: "",
            bidderRate: rate,
            sellerRate: false,
            bidderID: new ObjectId(userID),
            sellerID: productDetail.sellerInfo[0]._id
        })
    }
    else{
        dbo.collection('product').updateOne({_id: new ObjectId(proID)}, {$set: {isBidderComment: true}})
        return collection.updateOne({proID: new ObjectId(proID)}, {$set: {bidderComment: comment, bidderRate: rate}})
    }
}

async function countTotalAccountFunc(collection, role, keyword) {
    if(role)
        return await collection.find({role: role}).count();
    else if(keyword) {
        const result = await collection.aggregate([
            {
                '$search':{
                    'index': 'custom1',
                    'text': {
                        'query': keyword,
                        'path': 'email',
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

async function getLimitAccountFunc(collection, limit, offset, role, keyword) {
    if(role)
        return await collection.find({role: role}).skip(offset).limit(limit).toArray()
    else if(keyword) {
        return await collection.aggregate([
            {
                '$search':{
                    'index': 'custom1',
                    'text': {
                        'query': keyword,
                        'path': 'email',
                        'fuzzy': {}
                    }
                }
            }]).skip(offset).limit(limit).toArray();
    }
    else
        return await collection.find().skip(offset).limit(limit).toArray()
}

async function lockAccountFunc(collection, id) {
    await collection.updateOne({_id: new ObjectId(id)}, {$set: {verified: false}});
}

async function downgradeAccountFunc(collection, id) {
    await collection.updateOne({_id: new ObjectId(id)}, {$set: {role: 'bidder'}});
}

async function unlockAccountFunc(collection, id) {
    await collection.updateOne({_id: new ObjectId(id)}, {$set: {verified: true}});
}

async function getLimitUpgradeListFunc(collection, limit, offset) {
    return await collection.aggregate([
        {
            $lookup: {
                from: 'account',
                localField: 'userID',
                foreignField: '_id',
                as: 'info'
            }
        }
    ]).toArray();
}

async function countTotalUpgradeListFunc(collection) {
    return await collection.find().count();
}

async function upgradeAccountFunc(collection, id) {
    await collection.updateOne({_id: new ObjectId(id)}, {$set: {role: 'seller'}});
}

async function deleteUpgradeRequestFunc(collection, id) {
    return await collection.findOneAndDelete({userID: new ObjectId(id)});
}

async function deleteAccountFunc(collection, id) {
    return await collection.findOneAndDelete({_id: new ObjectId(id)});
}

// <<<<<<< Updated upstream
async function updateCommentFromProID(collection, proID, commentData){
    const myQuery = { proID : proID};
    const newValues = { $set:
            {
                bidderComment: commentData.bidderComment,
                sellerComment: commentData.sellerComment,
                bidderRate: commentData.bidderRate,
                sellerRate: commentData.sellerRate,
                bidderID: commentData.bidderID,
                sellerID: commentData.sellerID
            }
    };
    await collection.updateOne(myQuery, newValues);
}

async function insertNewCommentFunc(collection, commentOfProduct){
    await collection.insertOne(commentOfProduct);
}

// =======
async function getInforBidderAccountFunc(collection, id) {
    return await collection.findOne({_id: new ObjectId(id)});
}

async function updateBidderInforFunc(collection, userID, newName, newAddress) {
    if(newName === '' && newAddress !== '')
        return collection.findOneAndUpdate({_id: new ObjectId(userID)}, {$set: {address: newAddress}})
    else if(newName !== '' && newAddress === '')
        return collection.findOneAndUpdate({_id: new ObjectId(userID)}, {$set: {name: newName}})
    else if(newName !== '' && newAddress !== '')
        return collection.findOneAndUpdate({_id: new ObjectId(userID)}, {$set: {name: newName, address: newAddress}})
    else
        return
}
async function updateBidderPassFunc(collection, userID, newPass) {
    return collection.findOneAndUpdate({_id: new ObjectId(userID)}, {$set: {pass: newPass}})
}
async function findByUserIDFunc(collection, userID){
    return await collection.findOne({_id :  new ObjectId(userID)});
}

async function sendUpgradeSellerFunc(collection, userID) {
    const isDuplicate = await collection.findOne({userID: new ObjectId(userID)})
    console.log(isDuplicate)
    if(isDuplicate === null){
        await collection.insertOne({
                userID: new ObjectId(userID),
                date: new Date()
            })
        return true
    }
    else
        return false

    // return collection.insertOne({
    //     dateBid: new Date(),
    //     price: price,
    //     curProPrice: curProPrice.toString(),
    //     userID: new ObjectId(userID),
    //     proID: new ObjectId(proID),
    //     isDenied: 0
    // })
}

async function getTotalBidFunc(collection, id) {
    return await collection.find({userID: new ObjectId(id)}).count();
}

async function getTotalProductFunc(collection, id) {
    return await collection.find({curBidderInfo: new ObjectId(id)}).count();
}

async function getCommentOfSellerFunc(collection, userID){
    return await collection.aggregate([
        { $match: { sellerID: userID } },
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

async function getCommentFromBidderFunc(collection, userID){
    return await collection.aggregate([
        { $match: { bidderID: userID } }
    ]).toArray();
}

async function getAccountFunc(collection, userID){
    return await collection.findOne({"_id" : userID});
}

async function updateScoreFunc(collection, userID, score){
    const query = {_id : new ObjectId(userID)};
    const newValue = {$set : score};
    await collection.updateOne(query, newValue);
}


// >>>>>>> Stashed changes
export default {
    async findByID(userID){
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await findByUserIDFunc(collection, userID);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
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
        console.log(list)
        list.forEach(function (e) {
            if(e.details.length !== 0){
                let date = new Date()
                if(e.details[0].proEndDate.getTime() > date.getTime())
                    listTemp.push(e)
            }

        })
        return listTemp;
    },
    getSuccessfulAuction(userID,list){
        let listTemp = [];
        console.log(list)
        list.forEach(function (e) {
            if(e.details.length != 0){
                var date = new Date()
                if( e.details[0].proEndDate.getTime() <= date.getTime()&& e.details[0].curBidderInfo.toString() ===  userID)
                    listTemp.push(e)

            }

        })
        return listTemp;
    },
    removeDuplicatesHistory(list){
        let listTemp = [];
        console.log(list)
        list.forEach(function (e) {
            let check =0;
            for(var i =0; i < listTemp.length; i++){
                if(e.proID.toString() === listTemp[i].proID.toString()){
                    check = 1;
                    break
                }
            }
            if(check === 0)
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
            // await collection.deleteMany({})
            return await showBidderHistoryFunc(collection, id);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close();
        }
    },
    async getInforBidderAccount(id) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await getInforBidderAccountFunc(collection, id);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close();
        }
    },
    async updateBidderInfor(id, newName, newAddress) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await updateBidderInforFunc(collection, id, newName, newAddress);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close();
        }
    },
    async updateBidderPass(id, newPass) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await updateBidderPassFunc(collection, id, newPass);
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
    async showAllComment(id) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('comment');
            return await showAllCommentFunc(collection, id);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async getCommentWithProID(ProID) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('comment');
            return await getCommentWithProIDFunc(collection, ProID);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    getCommentFromeSeller(list) {
        var commentFromeSellerList = []
        list.forEach(function (e){
            if(e.details[0].isSellerComment)
                commentFromeSellerList.push(e)
        })
        return commentFromeSellerList;
    },
    countGoodComment(list) {
        var countGoodComment = 0
        list.forEach(function (e){
            if(e.sellerRate)
                countGoodComment++
        })
        return countGoodComment;
    },
    async countTotalAccount(role, keyword) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await countTotalAccountFunc(collection, role, keyword);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async getLimitAccount(limit, offset, role, keyword) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await getLimitAccountFunc(collection, limit, offset, role, keyword);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async lockAccount(id) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await lockAccountFunc(collection, id);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async downgradeAccount(id) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await downgradeAccountFunc(collection, id);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async unlockAccount(id) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await unlockAccountFunc(collection, id);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async getLimitUpgradeList(limit, offset) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('updateList');
            return await getLimitUpgradeListFunc(collection, limit, offset);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async countTotalUpgradeList() {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('updateList');
            return await countTotalUpgradeListFunc(collection);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async upgradeAccount(id) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await upgradeAccountFunc(collection, id);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async deleteUpgradeRequest(id) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('updateList');
            return await deleteUpgradeRequestFunc(collection, id);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async deleteAccount(id) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await deleteAccountFunc(collection, id);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async getTotalBid(id) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('bidderHistory');
            return await getTotalBidFunc(collection, id);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async getTotalProduct(id) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('product');
            return await getTotalProductFunc(collection, id);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
// <<<<<<< Updated upstream
    async updateCommentFromProID(proID, commentData) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('comment');
            return await updateCommentFromProID(collection, proID, commentData);

        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    // =======

// >>>>>>> Stashed changes
// <<<<<<< Updated upstream
    async insertNewComment(commentOfProduct) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('comment');
            return await insertNewCommentFunc(collection, commentOfProduct);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async sendUpgradingSeller(userID) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('updateList');
            if(await sendUpgradeSellerFunc(collection, userID))
                return true
            return false
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
// =======
// >>>>>>> Stashed changes
    async getCommentOfSeller(userID) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('comment');
            return await getCommentOfSellerFunc(collection, userID);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async getAccount(userID) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await getAccountFunc(collection, userID);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async getCommentFromBidder(userID) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('comment');
            return await getCommentFromBidderFunc(collection, userID);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async updateScore(userID, score) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await updateScoreFunc(collection, userID, score);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    }
}


