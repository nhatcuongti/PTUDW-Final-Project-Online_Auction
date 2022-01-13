import mongoClient from '../utils/db.js'
import { ObjectId } from "mongodb";
import productModel from "./product-model.js";
import mailing from "../utils/mailing.js";
import randomstring from "randomstring";

async function insertBidtoHistory(collection, userID, proID, price, curProPrice) {
    return collection.insertOne({
        dateBid: new Date(),
        price: +price,
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

    let oldBidderMail

    if(proInfo.curBidderInfo.length !== 0)
        oldBidderMail = proInfo.curBidderInfo[0].email
    const sellerMail = proInfo.sellerInfo[0].email
    const curBidderInfo = await getUserInfo(db,userID)
    const curBidderMail = curBidderInfo.email

    let dateNow = new Date()
    await collection.findOneAndUpdate({_id: new ObjectId(proID)}, { $set: {
            curBidderInfo: new ObjectId(userID),
            proCurBidPrice: proInfo.proBuyNowPrice,
            proHighestPrice: proInfo.proBuyNowPrice,
            proEndDate: new Date(dateNow.getTime() - 1000),
            proBidQuantity:  proInfo.proBidQuantity + 1

        }
    })

    await mailing.sendEmail(sellerMail, 'Hệ thống auction online',
        `Sản phẩm ` + proInfo.proName + `vừa được mua ngay`);


    await mailing.sendEmail(curBidderMail, 'Hệ thống auction online',
        `Bạn đã mua ngay sản phẩm ` + proInfo
            .proName + ` thành công.`);

    if(curBidderMail !== oldBidderMail && proInfo.curBidderInfo.length !== 0){
        await mailing.sendEmail(oldBidderMail, 'Hệ thống auction online',
            `Sản phẩm ` + proInfo.proName + ` mà bạn đấu giá đã bị người khác "mua ngay".`);
    }

    return
}

async function processBidFunc(db,collection, userID, proID, priceString, productInfo) {
    //productInfo : Sản phẩm vừa được đấu giá
    //userID : nguwoif

    //Format dữ liệu và lấy giá, giá cũ cao nhất, giá cũ của sản phẩm
    const price = parseInt(priceString)
    const oldHighestPrice = productInfo.proHighestPrice
    const oldProductPrice = productInfo.proCurBidPrice

    let oldBidderMail // mail của bidder nắm giá cũ
    if(productInfo.curBidderInfo.length !== 0)
        oldBidderMail = productInfo.curBidderInfo[0].email
    const sellerMail = productInfo.sellerInfo[0].email
    const curBidderInfo = await getUserInfo(db,userID)
    const curBidderMail = curBidderInfo.email


    const proPriceStep = productInfo.proPriceStep
    let curHighestPrice
    let curProductPrice
    let curBidder


    if(price > oldHighestPrice){
        curProductPrice = oldHighestPrice + proPriceStep
        if (productInfo.curBidderInfo.length === 0) // Nếu product chưa có ai đấu giá
            curProductPrice = oldHighestPrice;

        curHighestPrice = price
        curBidder = userID

        if((Math.abs(productInfo.proEndDate - new Date())/(1000*60)) <= 5){
            await collection.findOneAndUpdate({_id: new ObjectId(proID)}, { $set: {
                    curBidderInfo: new ObjectId(curBidder),
                    proCurBidPrice: curProductPrice,
                    proHighestPrice: curHighestPrice,
                    proEndDate: new Date(productInfo.proEndDate.getTime() + 10*60*1000),
                    proBidQuantity:  productInfo.proBidQuantity + 1
                }
            })
        }
        else{
        await collection.findOneAndUpdate({_id: new ObjectId(proID)}, { $set: {
                curBidderInfo: new ObjectId(curBidder),
                proCurBidPrice: curProductPrice,
                proHighestPrice: curHighestPrice,
                proBidQuantity:  productInfo.proBidQuantity + 1
            }
        }, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
        });
        }

        await mailing.sendEmail(sellerMail, 'Hệ thống auction online',
            `Giá của sản phẩm ` + productInfo.proName + `vừa được cập nhật lên thành `+ curProductPrice.toString() + `vnđ`);


        await mailing.sendEmail(curBidderMail, 'Hệ thống auction online',
            `Bạn đã đấu giá sản phẩm ` + productInfo.proName + ` thành công. Giá hiện tại sản phẩm `+ curProductPrice.toString() + `vnđ`);

        if(curBidderMail !== oldBidderMail && productInfo.curBidderInfo.length !== 0){
            await mailing.sendEmail(oldBidderMail, 'Hệ thống auction online',
                `Sản phẩm ` + productInfo.proName + ` mà bạn đấu giá đã bị người khác đấu giá cao hơn. Giá hiện tại sản phẩm `+ curProductPrice.toString() + `vnđ`);
        }
        return

    }
    else if (price === oldHighestPrice){
        curProductPrice = oldHighestPrice

        await collection.findOneAndUpdate({_id: new ObjectId(proID)}, { $set: {
                    proCurBidPrice: curProductPrice,
                    proBidQuantity:  productInfo.proBidQuantity + 1
                }
        })
        await mailing.sendEmail(sellerMail, 'Hệ thống auction online',
            `Giá của sản phẩm ` + productInfo.proName + `vừa được cập nhật lên thành `+ curProductPrice.toString() + `vnđ`);
        return
    }
    else if (price < oldHighestPrice && price > oldProductPrice){
        curProductPrice = price;

        await collection.findOneAndUpdate({_id: new ObjectId(proID)}, { $set: {
                    proCurBidPrice: curProductPrice,
                    proBidQuantity:  productInfo.proBidQuantity + 1
                }
        })
        await mailing.sendEmail(sellerMail, 'Hệ thống auction online',
            `Giá của sản phẩm ` + productInfo.proName + `vừa được cập nhật lên thành `+ curProductPrice.toString() + `vnđ`);
        return
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