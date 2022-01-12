import {ObjectID} from "mongodb";
import modelCategory from '../models/category-model.js'
import productModel from "../models/product-model.js";

export default {
    async formatForInsert(dataProduct, sellerID){
        const goodData = {};
        goodData.proName = dataProduct.proName;

        //Category
        goodData.proType = new ObjectID(dataProduct.catParent);
        goodData.catChildType = dataProduct.catChild;
        const catInformation = await modelCategory.findByID(goodData.proType);
        const catData = catInformation[0];
        goodData.catParent = catInformation[0].catParent;
        goodData.catChild = catInformation[0].catChild[goodData.catChildType].name;
        //--Update category
        catData.quantity += 1;
        catData.catChild[+goodData.catChildType].quantity += 1;
        await modelCategory.updateData(catData);


        //Auto extend and bidderType
        goodData.autoExtend = (dataProduct.autoExtend === 'true');
        goodData.bidderType = (dataProduct.bidderRange === 'true');

        //Product Description
        goodData.proDescription = dataProduct.proDescription;

        //Seller infor
        goodData.sellerInfo = new ObjectID(sellerID);

        //Product date
        goodData.proStartDate = new Date();
        goodData.proEndDate = new Date(dataProduct.proEndDate);
        goodData.numberImage = dataProduct.index;
        goodData.proBuyNowPrice = Number(dataProduct.proBuyNowPrice.replace(/[^0-9.-]+/g,""));
        goodData.proCurBidPrice = Number(dataProduct.firstPrice.replace(/[^0-9.-]+/g,""));
        goodData.proInitalPrice = goodData.proCurBidPrice;
        goodData.proPriceStep = Number(dataProduct.proPriceStep.replace(/[^0-9.-]+/g,""));

        //Bidder Comment and Seller Comment
        goodData.isBidderComment = false;
        goodData.isSellerComment = false;
        goodData.proHighestPrice = goodData.proCurBidPrice;

        //Product Bidder Quanrtity
        goodData.proBidQuantity = 0;

        return goodData;
    },

    formatDate(dataProduct) {
        //Format time
        const date1 = new Date();
        const date2 = dataProduct.proEndDate;
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (date2 < date1){
            dataProduct.duration = 'Đã hết hạn'
        }
        else if (diffDays <= 3) {
            dataProduct.duration = `Còn ${diffDays} ngày`;
        }
        else {
            dataProduct.duration = dataProduct.proEndDate.toLocaleString("en-GB");
        }
    },

    async formatCategory(dataProduct){
        //format category
        const cat = await modelCategory.findByID(dataProduct.proType);
        if (cat != null) {
            const i = dataProduct.catChildType;
            const catName = cat[0].catParent + " - " + cat[0].catChild[i];
            dataProduct.catName = catName;
        }
    },

    findProductWithSellerID(products, sellerID){
        for (let i = products.length - 1; i >= 0; i--)
            if (products[i].sellerInfo.toString() !== sellerID.toString())
                products.splice(i, 1);

    },

    async findProductWithStatus(products, status){
        // 1 : Đấu giá thành công ; => Có người mua và đã hết hạn
        // 2 : Đấu giá thất bại ; => Không có người mua và đã hết hạn
        // 3 : Đang được đấu giá ;  => Còn hạn và đã có người đặt
        // 4 : Chưa được đấu giá  => Còn hạn và chưa có người đặt

        // Kiểm tra những phần tử không phù hợp để loại
        status = +status;
        for (var i = products.length - 1; i >= 0; i--) {
            const product = products[i];
            // Kiểm tra đã hết hạn hay chưa
            const endDate = new Date(product.proEndDate);
            const currentDate = new Date();
            if (endDate - currentDate > 0) { // Nếu còn hạn
                if (status === 1 || status === 2) {
                    const index = products.indexOf(product);
                    products.splice(index, 1);
                    continue;
                }
            } else { // Nếu hết hạn
                if (status === 3 || status === 4) {
                    const index = products.indexOf(product);
                    products.splice(index, 1);
                    continue;
                }

            }

            //Kiểm tra có bị hủy hợp đồng hay không
            if (status != 2 && product.cancelTransaction){
                const index = products.indexOf(product);
                products.splice(index, 1);
                continue;
            }
            else if (status === 2 && product.cancelTransaction)
                continue;

            //Kiểm tra có người mua hay không
            // const bidderHistory = await productModel.getBidderHistoryWithProID(product._id);

            if (product.curBidderInfo === null || product.curBidderInfo === undefined || product.curBidderInfo.length === 0) {// Nếu như không có người mua
                if (status === 1 || status === 3) {
                    const index = products.indexOf(product);
                    products.splice(index, 1);
                    continue;
                }
            } else { // Nếu như có người đặt
                if (status === 2 || status === 4) {
                    const index = products.indexOf(product);
                    products.splice(index, 1);
                    continue;
                }
            }
        }
    },

    async getStatus(product){
        // 1 : Đấu giá thành công ; => Có người mua và đã hết hạn
        // 2 : Đấu giá thất bại ; => Không có người mua và đã hết hạn
        // 3 : Đang được đấu giá ;  => Còn hạn và đã có người đặt
        // 4 : Chưa được đấu giá  => Còn hạn và chưa có người đặt

        // Kiểm tra những phần tử không phù hợp để loại

        // Kiểm tra đã hết hạn hay chưa
        const endDate = new Date(product.proEndDate);
        const currentDate = new Date();
        //Kiểm tra có người mua hay không
        // const bidderHistory = await productModel.getBidderHistoryWithProID(product._id);

        if (endDate - currentDate <= 0) { // Nếu còn hạn
            if (product.curBidderInfo === null || product.curBidderInfo === undefined || product.curBidderInfo.length === 0 || product.cancelTransaction === true)
                return "<span class='text-danger'>Đấu giá thất bại</span>"
            else
                return "<span class='text-success'>Đấu giá thành công</span>"
        } else { // Nếu hết hạn
            if (product.curBidderInfo === null || product.curBidderInfo === undefined)
                return "<span class='text-warning'>Chưa được đấu giá</span>"
            else
                return "<span class='text-success'>Đang được đấu giá</span>"
        }
    },
    maskBidderName(name) {
        String.prototype.replaceAt = function(index, replacement) {
            if (index >= this.length) {
                return this.valueOf();
            }
            return this.substring(0, index) + replacement + this.substring(index + 1);
        }
        let result = name;
        for (let i = 0; i < result.length; i++)
            if (i % 2 === 0)
                result = result.replaceAt(i, '*');
        return result;
    }
}
