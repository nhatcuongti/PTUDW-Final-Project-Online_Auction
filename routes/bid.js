import express from 'express';
import account from "../models/account-model.js";
import auth from "../middlewares/auth-mdw.js";
import product from "../models/product-model.js";
import * as Console from "console";
import moment from "moment/moment.js";
import entryModel from "../models/entry-model.js";
import bcrypt from "bcryptjs";
import bidModel from "../models/bid-model.js";

const router = express.Router();

router.get('/checkout', auth ,async function (req, res) {
    const proID = req.query.id;
    const proInfor = await product.findById(proID)
    let priceRecommend = proInfor[0].proCurBidPrice + proInfor[0].proPriceStep
    res.render('viewAccountBidder/bid/checkout', {
        data:proInfor,
        priceRecommend: priceRecommend
    });
});

router.post('/checkout', auth ,async function (req, res) {
    const proID = req.body.proID;
    const price = req.body.price
    const temp = req.session.user;
    const userID = temp[0]._id;
    let proInfor = await product.findById(proID)
    console.log(typeof proInfor[0].proEndDate)
    await bidModel.processBid(userID, proID, price, proInfor[0])
    proInfor = await product.findById(proID)
    if (parseInt(price) >= proInfor[0].proCurBidPrice)
        await bidModel.insertBidIntoHistory(userID,proID,price,proInfor[0].proCurBidPrice)
    res.redirect('back');
});

export default router