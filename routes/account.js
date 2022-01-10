import express from 'express';
import account from "../models/account-model.js";
import auth from "../middlewares/auth-mdw.js";
import product from "../models/product-model.js";
import * as Console from "console";
import moment from "moment/moment.js";
import entryModel from "../models/entry-model.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.get('/favorite', auth ,async function (req, res) {
    const temp = req.session.user;
    const userID = temp[0]._id;
    let list = await account.showFavoriteList(userID)
    list = list.reverse()
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

router.get('/update-profile', auth, async function (req, res) {
    const temp = req.session.user;
    const userID = temp[0]._id;
    console.log(userID)
    const bidderInfor = await account.getInforBidderAccount(userID)
    console.log(bidderInfor)
    res.render('viewAccountBidder/viewProfile/update-profile',{
        data: [bidderInfor]
    });
});

router.post('/update-profile', auth, async function (req, res) {
    const temp = req.session.user;
    const userID = temp[0]._id;
    const newName = req.body.name
    const newAddress = req.body.address
    await account.updateBidderInfor(userID, newName, newAddress)
    res.redirect('back')
});

router.get('/change-password', auth, function (req, res) {
    res.render('viewAccountBidder/viewProfile/change-password');
});
router.post('/change-password',  async function (req, res) {
    var salt = bcrypt.genSaltSync(10);
    const temp = req.session.user;
    const userID = temp[0]._id;
    await account.updateBidderPass(userID, bcrypt.hashSync(req.body.newPass, salt))
    res.redirect('back');
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

router.get('/account/', async function (req, res) {
    const temp = req.session.user;
    const userID = temp[0]._id;
    const bidder = await account.getInforBidderAccount(userID)
    const pass = bidder.pass

    console.log(await bcrypt.compareSync(req.query.pass, pass))
    if (await bcrypt.compare(req.query.pass, pass))
        return res.json(true);
    return res.json(false);
});


export default router;