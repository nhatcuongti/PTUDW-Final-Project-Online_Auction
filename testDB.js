import productModel from "./models/product-model.js";
import {ObjectId} from "mongodb";
import accountModel from "./models/account-model.js";
import mailing from "./utils/mailing.js";

async function testFunc(){
    const product = await productModel.updateProEndDate('61db158587e0b892a6097df7', new Date());
    console.log(product);
}

testFunc();