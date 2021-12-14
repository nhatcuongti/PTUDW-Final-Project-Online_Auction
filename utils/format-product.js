import {ObjectID} from "mongodb";
import modelCategory from '../models/category-model.js'

export default {
    formatForInsert(dataProduct){
        const goodData = {};
        goodData.proName = dataProduct.proName;
        goodData.proType = new ObjectID(dataProduct.catChild);
        goodData.autoExtend = (dataProduct.autoExtend === 'true');
        goodData.bidderType = (dataProduct.bidderRange === 'true');
        goodData.proDescription = dataProduct.proDescription;
        goodData.sellerInfo = "nhatcuongti";
        goodData.proStartDate = new Date();
        var in30days = new Date();
        in30days.setDate(in30days.getDate() + 30);
        goodData.proEndDate = in30days;
        goodData.proBuyNowPrice = Number(dataProduct.proBuyNowPrice.replace(/[^0-9.-]+/g,""));
        goodData.proCurBidPrice = Number(dataProduct.firstPrice.replace(/[^0-9.-]+/g,""));
        goodData.proPriceStep = Number(dataProduct.proPriceStep.replace(/[^0-9.-]+/g,""));
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
        const cat =await modelCategory.findByID(dataProduct.proType);
        console.log(cat);
        if (cat != null) {
            const catName = cat[0].catParentName + " - " + cat[0].catChildName;
            dataProduct.catName = catName;
        }
    }

}
