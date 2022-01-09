import express from 'express';
import account from "../models/account-model.js";
import auth from "../middlewares/auth-mdw.js";
import product from "../models/product-model.js";
import * as Console from "console";
import moment from "moment/moment.js";
import entryModel from "../models/entry-model.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.get('/checkout', auth ,async function (req, res) {
    // const temp = req.session.user;
    // const userID = temp[0]._id;
    // let list = await account.showFavoriteList(userID)
    res.render('viewAccountBidder/bid/checkout', );
});

export default router