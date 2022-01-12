import productModel from "./models/product-model.js";
import {ObjectId} from "mongodb";
import accountModel from "./models/account-model.js";
import mailing from "./utils/mailing.js";
import modelCategory from "./models/category-model.js";
import bid from "./routes/bid.js";



async function testFunc(){
    const data = await accountModel.getCommentOfSeller(new ObjectId("61be966d0b93276ccd0da00f"));
    console.log(data[0]);
}

await testFunc();

