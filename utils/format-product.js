import {ObjectID} from "mongodb";

export default function(dataProduct){
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
}