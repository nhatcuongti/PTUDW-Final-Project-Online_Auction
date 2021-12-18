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



router.get('/auction-history',auth,  async function (req, res) {
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
router.get('/auction-already-history', auth ,async function (req, res) {

    const temp = req.session.user;
    const userID = temp[0]._id;
    let list = await account.showBidderHistory(userID)
    console.log(account.getSuccessfulAuction(userID, list))
    res.render('viewAccountBidder/viewHistory/auction-already-history',{
        product: account.getSuccessfulAuction(userID, list)
    });
});

router.get('/auction-already-comment',auth  ,async function (req, res) {
    let item = await product.findById(req.query.id);
    res.render('viewAccountBidder/viewHistory/auction-already-comment', {
        product: item
    });
});
router.post('/auction-already-comment',auth  ,async function (req, res) {
    const temp = req.session.user;
    const userID = temp[0]._id;
    const productDetail = await product.findById(req.body.proID)
    console.log(req.body)
    if(req.body.rate === 'true')
        var rate = true;
    else
        rate = false
    console.log(rate)
    await account.bidderComment(userID, req.body.proID, productDetail[0],rate, req.body.textArea);
    res.redirect('/user/auction-already-history');
});

router.get('/update-profile',  function (req, res) {
    res.render('viewAccountBidder/viewProfile/update-profile');
});

router.get('/change-password',  function (req, res) {
    res.render('viewAccountBidder/viewProfile/change-password');
});
router.get('/comment-from-seller', auth, async function (req, res) {
    const temp = req.session.user;
    const userID = temp[0]._id;
    let list = account.getCommentFromeSeller(await account.showAllComment(userID))
    const countList = Object.keys(list).length
    const countGoodComment = account.countGoodComment(list)
    let likeRate = 0;
    let dislikeRate = 0;
    if(countList != 0){
        likeRate = Math.round(countGoodComment*1000.0/countList)/10
        dislikeRate = Math.round((100 - likeRate)*10)/10
    }
    console.log(countList)
    res.render('viewAccountBidder/comment-from-seller', {
        product: list,
        total: countList,
        likeRate: likeRate,
        dislikeRate: dislikeRate
    });
});
export default router;