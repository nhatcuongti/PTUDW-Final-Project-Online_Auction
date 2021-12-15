import express from 'express';
import account from "../models/account-model.js";
import auth from "../middlewares/auth-mdw.js";

const router = express.Router();

router.get('/favorite', auth ,async function (req, res) {
    const temp = req.session.user;
    const userID = temp[0]._id;
    let list = await account.showFavoriteList(userID)
    res.render('viewAccountBidder/favorite', {
        product: account.getDetailProductFavorite(list)
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



router.get('/auction-history',  function (req, res) {
    // let list = account.findAll();
    // res.render('viewAccountBidder/viewHistory/auction-history',{
    //     product:list
    // });
});
router.get('/auction-already-history',  function (req, res) {
    // let list = account.findAll();
    // res.render('viewAccountBidder/viewHistory/auction-already-history',{
    //     product:list
    // });
});

router.get('/auction-already-comment',  function (req, res) {
    // let item = account.findByID(req.query.id);
    // let list = []
    // list.push(item);
    // console.log(item);
    // res.render('viewAccountBidder/viewHistory/auction-already-comment',{
    //     product:list
    // });
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