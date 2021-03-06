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
        goodData.curBidderInfo = null;

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
            dataProduct.duration = '???? h???t h???n'
        }
        else if (diffDays <= 3) {
            dataProduct.duration = `C??n ${diffDays} ng??y`;
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
        // 1 : ?????u gi?? th??nh c??ng ; => C?? ng?????i mua v?? ???? h???t h???n
        // 2 : ?????u gi?? th???t b???i ; => Kh??ng c?? ng?????i mua v?? ???? h???t h???n
        // 3 : ??ang ???????c ?????u gi?? ;  => C??n h???n v?? ???? c?? ng?????i ?????t
        // 4 : Ch??a ???????c ?????u gi??  => C??n h???n v?? ch??a c?? ng?????i ?????t

        // Ki???m tra nh???ng ph???n t??? kh??ng ph?? h???p ????? lo???i
        status = +status;
        for (var i = products.length - 1; i >= 0; i--) {
            const product = products[i];
            // Ki???m tra ???? h???t h???n hay ch??a
            const endDate = new Date(product.proEndDate);
            const currentDate = new Date();
            if (endDate - currentDate > 0) { // N???u c??n h???n
                if (status === 1 || status === 2) {
                    const index = products.indexOf(product);
                    products.splice(index, 1);
                    continue;
                }
            } else { // N???u h???t h???n
                if (status === 3 || status === 4) {
                    const index = products.indexOf(product);
                    products.splice(index, 1);
                    continue;
                }

            }

            //Ki???m tra c?? b??? h???y h???p ?????ng hay kh??ng
            if (status != 2 && product.cancelTransaction){
                const index = products.indexOf(product);
                products.splice(index, 1);
                continue;
            }
            else if (status === 2 && product.cancelTransaction)
                continue;

            //Ki???m tra c?? ng?????i mua hay kh??ng
            // const bidderHistory = await productModel.getBidderHistoryWithProID(product._id);

            if (product.curBidderInfo === null || product.curBidderInfo === undefined || product.curBidderInfo.length === 0) {// N???u nh?? kh??ng c?? ng?????i mua
                if (status === 1 || status === 3) {
                    const index = products.indexOf(product);
                    products.splice(index, 1);
                    continue;
                }
            } else { // N???u nh?? c?? ng?????i ?????t
                if (status === 2 || status === 4) {
                    const index = products.indexOf(product);
                    products.splice(index, 1);
                    continue;
                }
            }
        }
    },

    async getStatus(product){
        // 1 : ?????u gi?? th??nh c??ng ; => C?? ng?????i mua v?? ???? h???t h???n
        // 2 : ?????u gi?? th???t b???i ; => Kh??ng c?? ng?????i mua v?? ???? h???t h???n
        // 3 : ??ang ???????c ?????u gi?? ;  => C??n h???n v?? ???? c?? ng?????i ?????t
        // 4 : Ch??a ???????c ?????u gi??  => C??n h???n v?? ch??a c?? ng?????i ?????t

        // Ki???m tra nh???ng ph???n t??? kh??ng ph?? h???p ????? lo???i

        // Ki???m tra ???? h???t h???n hay ch??a
        const endDate = new Date(product.proEndDate);
        const currentDate = new Date();
        //Ki???m tra c?? ng?????i mua hay kh??ng
        // const bidderHistory = await productModel.getBidderHistoryWithProID(product._id);

        if (endDate - currentDate <= 0) { // N???u c??n h???n
            if (product.curBidderInfo === null || product.curBidderInfo === undefined || product.curBidderInfo.length === 0 || product.cancelTransaction === true)
                return "<span class='text-danger'>?????u gi?? th???t b???i</span>"
            else
                return "<span class='text-success'>?????u gi?? th??nh c??ng</span>"
        } else { // N???u h???t h???n
            if (product.curBidderInfo === null || product.curBidderInfo === undefined)
                return "<span class='text-warning'>Ch??a ???????c ?????u gi??</span>"
            else
                return "<span class='text-success'>??ang ???????c ?????u gi??</span>"
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
