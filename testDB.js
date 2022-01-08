import productModel from "./models/product-model.js";
import {ObjectId} from "mongodb";

async function testFunc(){
    const product = await productModel.findByCategoryParent(new ObjectId("61ca9022154bd1ec2935cc6b"));
    console.log(product)
    // console.log(data[0].sellerInfo)
}

testFunc();