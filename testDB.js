import productModel from "./models/product-model.js";
import {ObjectId} from "mongodb";
import accountModel from "./models/account-model.js";

async function testFunc(){
    const data = await productModel.findById("61b05934d39b26209b9b345d");
    console.log(data);
}

testFunc();