import productModel from "../models/product-model.js";
import accountModel from "../models/account-model.js";

export default{
    async denyBidderOfProduct(product, productID, userID){
        //Deny user
        await productModel.denyUserOnBidderHistory(productID, userID);
        console.log("User ID : " + userID);


        //Roll back giá sản phẩm
        const bidderHistories = await productModel.getBidderHistoryWithProID(productID);
        let currentPrice = product.proInitalPrice;
        let highestPrice = product.proInitalPrice;

        let bidderWithHighest = bidderHistories[0];
        let bidderHighestID = null;

        if (bidderHistories.length > 1){
            let highestUser = null;
            let secondUser = null;
            let count = 0;

            for (const bidderHistory of bidderHistories)
                if (bidderHistory.isDenied !== 1){
                    if (count === 0){
                        highestUser = bidderHistory;
                        bidderWithHighest = bidderHistory;
                        count++;
                    }
                    else{
                        secondUser = bidderHistory;
                        count++;
                        break;
                    }
                }

            if (count > 1){
                if (secondUser.dateBid < highestUser.dateBid) // Nếu thằng thứ hai tới trước thằng thứ nhất
                    currentPrice = secondUser.price + product.proPriceStep;
                else // Nếu thằng thứ hai tới sau thằng thứ nhất
                    currentPrice = secondUser.price;
            }

            bidderHighestID = bidderWithHighest.bidderInfo[0]._id
            highestPrice = bidderWithHighest.price;
        }
        else if (bidderWithHighest !== undefined){
            highestPrice = bidderWithHighest.price;
            bidderHighestID = bidderWithHighest.bidderInfo[0]._id
        }


        //Update price and curent
        await productModel.updatePriceAndCurrentBidder(productID, currentPrice, bidderHighestID, highestPrice)
    }
}