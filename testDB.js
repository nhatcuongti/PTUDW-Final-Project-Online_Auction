import productModel from "./models/product-model.js";
import {ObjectId} from "mongodb";
import accountModel from "./models/account-model.js";
import mailing from "./utils/mailing.js";
import modelCategory from "./models/category-model.js";
import bid from "./routes/bid.js";



async function testFunc(){
    const score  = {
        goodScore: 2,
        badScore: 1
    }
    await accountModel.updateScore("61b9df48a38388efc7a19cf8", score);
    // console.log(data);
}

await testFunc();

