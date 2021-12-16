import express from 'express';
import account from "../models/account-model.js";
import auth from "../middlewares/auth-mdw.js";
import product from "../models/product-model.js";
import * as Console from "console";
import moment from "moment/moment.js";

const router = express.Router();

router.get('/favorite', auth ,async function (req, res) {
    const temp = req.session.user;
    const userID = temp[0]._id;
    let list = await account.showFavoriteList(userID)
    res.render('viewAccountBidder/favorite', {
        product: list
    });
});

router.post('/favorite',  async function (req, res) {
    const proID = req.body.id;
    const temp = req.session.user;
    const userID = temp[0]._id;
    await account.deleteOneFavorite(userID, proID);
    res.redirect('back')
});

router.post('/favorite/add',  async function (req, res) {
    const proID = req.body.id;
    const temp = req.session.user;
    const userID = temp[0]._id;
    await account.addOneFavorite(userID, proID);
    res.redirect('back');
});



router.get('/auction-history',  async function (req, res) {
    // let list = account.findAll();
    const temp = req.session.user;
    const userID = temp[0]._id;
    let list = await account.showBidderHistory(userID)
    //console.log(list);
    res.render('viewAccountBidder/viewHistory/auction-history',{
            product: account.getProductsOnAuction(list)
        }
    );
});
router.get('/auction-already-history',  async function (req, res) {

    const temp = req.session.user;
    const userID = temp[0]._id;
    let list = await account.showBidderHistory(userID)
    res.render('viewAccountBidder/viewHistory/auction-already-history',{
        product: account.getSuccessfulAuction(userID, list)
    });
});

router.get('/auction-already-comment',  async function (req, res) {
    let item = await product.findById(req.query.id);
    res.render('viewAccountBidder/viewHistory/auction-already-comment', {
        product: item
    });
});

router.get('/update-profile',  function (req, res) {
    res.render('viewAccountBidder/viewProfile/update-profile');
});

router.get('/change-password',  function (req, res) {
    res.render('viewAccountBidder/viewProfile/change-password');
});
router.get('/comment-for-bidder',  function (req, res) {
    res.render('viewAccountBidder/comment-for-bidder');
});
export default router;