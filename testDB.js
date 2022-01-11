import productModel from "./models/product-model.js";
import {ObjectId} from "mongodb";
import accountModel from "./models/account-model.js";
import mailing from "./utils/mailing.js";
import modelCategory from "./models/category-model.js";
import bid from "./routes/bid.js";



async function testFunc(){
    await productModel.updatePriceAndCurrentBidder("61dd94392c29cc4a53e460c5", 509000, null, 509000)
}

await testFunc();

async function testFunc1(){
    const arr = await Promise.all([updateProduct(), denyUser(), sendEmail()]);
    return arr;
}

async function testDB(){
    const bidderHistories = await productModel.getBidderHistoryWithProID("61dd0106999ba1487e5c67d1");
    console.log(bidderHistories[0]);
}


