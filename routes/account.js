import express from 'express';
import account from "../models/account-model.js";
import auth from "../middlewares/auth-mdw.js";
import product from "../models/product-model.js";
import * as Console from "console";
import moment from "moment/moment.js";
import entryModel from "../models/entry-model.js";
import bcrypt from "bcryptjs";
import {ObjectId} from "mongodb";
import fs from "fs";

const router = express.Router();

router.get('/favorite', auth ,async function (req, res) {
    const temp = req.session.user;
    const userID = temp[0]._id;
    let list = await account.showFavoriteList(userID)
    list = list.reverse()
    console.log(list)
    for(let i = 0; i< list.length; i++){
        list[i].details[0].proEndDate = moment(list[i].details[0].proEndDate).format('DD/MM/YYYY HH:mm')
    }
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
    list = account.getProductsOnAuction(list)
    list.sort((a, b) => b.dateBid - a.dateBid);
    list = account.removeDuplicatesHistory(list)
    for(let i = 0; i< list.length; i++){
        list[i].dateBid = moment(list[i].dateBid).format('DD/MM/YYYY HH:mm')
        list[i].details[0].proEndDate = moment(list[i].details[0].proEndDate).format('DD/MM/YYYY HH:mm')
        if(list[i].details[0].curBidderInfo.toString() === userID)
            list[i].details[0].curBidderInfo = true
        else
            list[i].details[0].curBidderInfo = false
    }

    res.render('viewAccountBidder/viewHistory/auction-history',{
            product: list
        }
    );
});
router.get('/auction-already-history', auth ,async function (req, res) {

    const temp = req.session.user;
    const userID = temp[0]._id;
    let list = await account.showBidderHistory(userID)
    console.log(account.getSuccessfulAuction(userID, list))
    list = account.getSuccessfulAuction(userID, list)
    list.sort((a, b) => b.dateBid - a.dateBid);
    for(let i = 0; i< list.length; i++){
        list[i].dateBid = moment(list[i].dateBid).format('DD/MM/YYYY HH:mm')
        list[i].details[0].proEndDate = moment(list[i].details[0].proEndDate).format('DD/MM/YYYY HH:mm')
    }
    res.render('viewAccountBidder/viewHistory/auction-already-history',{
        product: list
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
router.get('/comment-from-seller/:id', auth, async function (req, res) {
    // const temp = req.session.user;
    const id = req.params.id;
    const userID = new ObjectId(id);
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

router.get("/comment-from-bidder/:id", async (req, res) => {
    res.locals.DanhGia.isActive = true;
    const id = req.params.id;
    const userID = new ObjectId(id);

    let commentList = await account.getCommentOfSeller(userID);
    for (let i = commentList.length - 1; i >= 0; i--){
        if (!commentList[i].details[0].isBidderComment )
            commentList.splice(i, 1);
        else{
            try{
                const files = fs.readdirSync(`./public/${commentList[i].details[0]._id}/`);
                const mainThumb = files[0];
                commentList[i].details[0].mainThumb = mainThumb;
            } catch(e){
                console.log(e);
            }

        }
    }

    const countList = commentList.length;
    let likeRate = 0;
    let dislikeRate = 0;
    for (const comment of commentList){
        if (comment.bidderRate)
            likeRate++;
        else
            dislikeRate++;
    }




    //List comment cua seller
    //Tên Product
    //Nội dung Comment tu Bidder
    //Đánh giá của Bidder: bidderRate

    res.render('viewAccountBidder/comment-from-bidder', {
        product: commentList,
        //--Product
        //  --details
        //    --ProName
        //    --ProID
        //  --bidderRate
        total: countList,
        likeRate: likeRate,
        dislikeRate: dislikeRate
    });

})

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
router.get('/upgrade/', async function (req, res) {
    const temp = req.session.user;
    const userID = temp[0]._id;
    if(await account.sendUpgradingSeller(userID))
        return res.json(true);
    return res.json(false);
});


export default router;