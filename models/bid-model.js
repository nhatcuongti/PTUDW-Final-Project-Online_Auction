import mongoClient from '../utils/db.js'
import { ObjectId } from "mongodb";
import productModel from "./product-model.js";
import mailing from "../utils/mailing.js";
import randomstring from "randomstring";

async function insertBidtoHistory(collection, userID, proID, price, curProPrice) {
    return collection.insertOne({
        dateBid: new Date(),
        price: price,
        curProPrice: curProPrice.toString(),
        userID: new ObjectId(userID),
        proID: new ObjectId(proID),
        isDenied: 0
    })
}

async function getUserInfo(db, userID) {
    return db.collection("account").findOne({_id: new ObjectId(userID)})
}
async function buyNowFunc(db,collection, userID, proID,proInfo) {
    const oldBidderMail = proInfo.curBidderInfo[0].email
    const sellerMail = proInfo.sellerInfo[0].email
    const curBidderInfo = await getUserInfo(db,userID)
    const curBidderMail = curBidderInfo.email

    await mailing.sendEmail(sellerMail, 'Hệ thống auction online',
        `Sản phẩm ` + proInfo.proName + `vừa được mua ngay`);


    await mailing.sendEmail(curBidderMail, 'Hệ thống auction online',
        `Bạn đã mua ngay sản phẩm ` + productInfo.proName + ` thành công.`);

    if(curBidderMail !== oldBidderMail){
        await mailing.sendEmail(oldBidderMail, 'Hệ thống auction online',
            `Sản phẩm ` + productInfo.proName + ` mà bạn đấu giá đã bị người khác "mua ngay".`);
    }

    let dateNow = new Date()
    return collection.updateOne({_id: new ObjectId(proID)}, { $set: {
            curBidderInfo: new ObjectId(userID),
            proCurBidPrice: proInfo.proBuyNowPrice,
            proHighestPrice: proInfo.proBuyNowPrice,
            proEndDate: new Date(dateNow.getTime() - 1000)
        }
    })
}

async function processBidFunc(db,collection, userID, proID, priceString, productInfo) {
    const price = parseInt(priceString)
    const oldHighestPrice = productInfo.proHighestPrice
    const oldProductPrice = productInfo.proCurBidPrice

    const oldBidderMail = productInfo.curBidderInfo[0].email
    const sellerMail = productInfo.sellerInfo[0].email
    const curBidderInfo = await getUserInfo(db,userID)
    const curBidderMail = curBidderInfo.email


    const proPriceStep = productInfo.proPriceStep
    let curHighestPrice
    let curProductPrice
    let curBidder


    if(price > oldHighestPrice){
        curProductPrice = oldHighestPrice + proPriceStep
        curHighestPrice = price
        curBidder = userID

        await mailing.sendEmail(sellerMail, 'Hệ thống auction online',
            `Giá của sản phẩm ` + productInfo.proName + `vừa được cập nhật lên thành `+ curProductPrice.toString() + `vnđ`);


        await mailing.sendEmail(curBidderMail, 'Hệ thống auction online',
            `Bạn đã đấu giá sản phẩm ` + productInfo.proName + ` thành công. Giá hiện tại sản phẩm `+ curProductPrice.toString() + `vnđ`);

        if(curBidderMail !== oldBidderMail){
            await mailing.sendEmail(oldBidderMail, 'Hệ thống auction online',
                `Sản phẩm ` + productInfo.proName + ` mà bạn đấu giá đã bị người khác đấu giá cao hơn. Giá hiện tại sản phẩm `+ curProductPrice.toString() + `vnđ`);
        }

        if((Math.abs(productInfo.proEndDate - new Date())/(1000*60)) <= 5){
            return await collection.updateOne({_id: new ObjectId(proID)}, { $set: {
                    curBidderInfo: new ObjectId(curBidder),
                    proCurBidPrice: curProductPrice,
                    proHighestPrice: curHighestPrice,
                    proEndDate: new Date(productInfo.proEndDate.getTime() + 10*60*1000)
                }
            })
        }
        return await collection.updateOne({_id: new ObjectId(proID)}, { $set: {
                    curBidderInfo: new ObjectId(curBidder),
                    proCurBidPrice: curProductPrice,
                    proHighestPrice: curHighestPrice,
                }
        })

    }
    else if (price === oldHighestPrice){
        curProductPrice = oldHighestPrice
        await mailing.sendEmail(oldBidderMail, 'Hệ thống auction online',
            `Sản phẩm ` + productInfo.proName + ` mà bạn đấu giá đã bị người khác đấu giá cao hơn. Giá hiện tại sản phẩm `+ curProductPrice.toString() + `vnđ`);

        return await collection.updateOne({_id: new ObjectId(proID)}, { $set: {
                    proCurBidPrice: curProductPrice
                }
        })

    }
    else if (price < oldHighestPrice && price > oldProductPrice){
        curProductPrice = price;
        await mailing.sendEmail(oldBidderMail, 'Hệ thống auction online',
            `Sản phẩm ` + productInfo.proName + ` mà bạn đấu giá đã bị người khác đấu giá cao hơn. Giá hiện tại sản phẩm `+ curProductPrice.toString() + `vnđ`);

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
            return await processBidFunc(db,collection, userID, proID, price, proInfor);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async insertBidIntoHistory(userID, proID, price,curProPrice) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('bidderHistory');
            return await insertBidtoHistory(collection, userID, proID, price,curProPrice);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async buyNow(userID, proID,proInfo) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('product');
            return await buyNowFunc(db,collection, userID, proID,proInfo);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
}