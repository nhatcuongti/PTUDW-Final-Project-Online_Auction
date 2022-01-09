import productModel from "./models/product-model.js";
import {ObjectId} from "mongodb";
import accountModel from "./models/account-model.js";
import mailing from "./utils/mailing.js";

async function testFunc(){
    // const data = await productModel.findById("61b05792c6e975e18b1035da");
    // console.log(data);
    await mailing.sendEmail("nhatcuongti@gmail.com", "Test", "Hello Hao");
}

testFunc();