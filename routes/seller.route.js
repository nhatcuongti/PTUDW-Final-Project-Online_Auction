import express from 'express';
import modelProduct from '../models/product-model.js';
import modelCategory from '../models/category-model.js'
import multer  from 'multer'
import formatProduct from '../utils/format-product.js'
import fs from 'fs'
import path from 'path'
import page from "../utils/page.js";
import {ObjectId} from "mongodb";
import productModel from "../models/product-model.js";
import accountModel from "../models/account-model.js";
import mailing from "../utils/mailing.js";
import {authUserWithProduct} from "../middlewares/auth-mdw.js";

const router = express.Router();

router.get("/channel", (req, res) => {
    res.locals.ThongTinChung.isActive = true;
    res.render("./seller/channel", {
        layout: "seller.layout.hbs"
    })
})

router.get("/channel/product", async (req, res) => {
    res.locals.XemSanPham.isActive = true;
    let products = null;
    const categories = await modelCategory.getAll();


    //Handle Category
    const catParentFind = req.query.catParent;
    const catChildFind = req.query.catChild;

    for (const category of categories)
        if (category._id == catParentFind){
            category.isActive = true;
            console.log(category);
            break;
        }
    //Search
    let keyword = req.query.keyword;
    //Taking products with id seller
    const userID = res.locals.user._id;



    //Find offset base on curPage
    const choosenPage = req.query.page;
    let limitProduct = 6;
    let offset = ((+choosenPage - 1) * limitProduct) || 0;

    // async searchByType(keyword, type, limit, offset, sort, catParentFind, catChildFind, userID) {
    console.log("keyword : " + keyword);

    if (keyword !== undefined)
        products = await productModel.searchByType(keyword, 'name', limitProduct, offset, 'time-descending', catParentFind, catChildFind, userID);
    else{
            if (catParentFind != undefined && catChildFind != undefined)
                products = await modelProduct.findByCategory(catParentFind, catChildFind, userID);
            else if (catParentFind != undefined)
                products = await modelProduct.findByCategoryParent(new ObjectId(catParentFind), undefined, userID);
            else
                products = await modelProduct.getAll(userID);
    }

    //Find with status product
    let status = req.query.status;
    if (status != undefined )
        await formatProduct.findProductWithStatus(products, status);

    if (status === "1")
        status = "Đấu giá thành công"
    else if (status === "2")
        status = "Đấu giá thất bại"
    else if (status === "3")
        status = "Đang được đấu giá"
    else if (status === "4")
        status = "Chưa được đấu giá"
    else
        status = "Tất cả"

    //Handle page
    let nPage = Math.floor((products.length - 1) / 6) + 1;
    let prevPage = {check:true, value : 0};
    let nextPage = {check:true, value : 0};
    let curPage = {check:true, value : 0};
    await page.handlePage(prevPage, curPage, nextPage, choosenPage, nPage );

    const numberProduct = products.length;
    products = products.slice(offset, (offset + limitProduct  < numberProduct) ? offset + limitProduct : numberProduct)

    const catParentPath = (req.query.catParent !== undefined) ?  `&catParent=${req.query.catParent}` : "";
    const catChildPath =  (req.query.catChild !== undefined) ? `&catChild=${req.query.catChild}` : "";
    const statusPath = (req.query.status !== undefined) ? `&status=${req.query.status}` : "";
    const keywordPath = (req.query.keyword !== undefined) ? `&keyword=${req.query.keyword}` : "";
    const pagePath = `?page=${(choosenPage) ? choosenPage : 1}`;
    const initalPagePath = `?page=1`;

    for (const product of products){
        try{
            const files = fs.readdirSync(`./public/${product._id}/`);
            const mainThumb = files[0];
            product.mainThumb = mainThumb;
        } catch (e) {
            console.log(e)
        }
    }

    let emptyMsg;
    if (products.length === 0)
        emptyMsg = "Hiện tại không có sản phẩm nào"

    res.render("./seller/channel_product", {
        layout: "seller.layout.hbs",
        products,
        categories,

        status,
        emptyMsg,

        prevPage,
        nextPage,
        curPage,

        catParentPath,
        catChildPath,
        statusPath,
        keywordPath,
        pagePath,
        initalPagePath
    })
})

router.get("/channel/product/insert", async (req, res) => {
    res.locals.ThemSanPham.isActive = true;
    const catList = await modelCategory.getAll();
    console.log(catList);

    res.render("./seller/channel_product_insert_2", {
        layout: "seller.layout.insert.hbs",
        catList
    })



})

//Upload Image
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const dir = `./public/image`
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, {recursive: true});
            console.log("Create Folder");
        }
        cb(null, `public/image`)
    },
    filename: async function (req, file, cb) {
        if (req.body.index === undefined)
            req.body.index = 0;

        let index = req.body.index;

        const ext = path.extname(file.originalname);
        if (index === 0)
            cb(null, `main-thumb${ext}`);
        else
            cb(null, `thumb${req.body.index}${ext}`);

        req.body.index++;

        // if (file.fieldname === 'main-image'){
        //     cb(null, `main-thumb${ext}`);
        //     console.log("Create main-thumb.jpg");
        // }
        // else if (file.fieldname === 'image1'){
        //     cb(null, `thumb1${ext}`);
        //     console.log("Create thumb1.jpg")
        // }
        // else{
        //     cb(null, `thumb2${ext}`);
        //     console.log("Create thumb2.jpg")
        // }
    }
})

const upload = multer({ storage: storage })
const cpUpload = upload.array("Image", 5);
// const cpUpload = upload.fields([{ name: 'main-image', maxCount: 1 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }])

const afterUploadImage = async (req, res, next) => {
    console.log("Raw Data : ")
    console.log(req.body);
    req.body = await formatProduct.formatForInsert(req.body, res.locals.user._id);
    await modelProduct.insertData(req.body);
    console.log(req.body);
    next();
}

router.post("/channel/product/insert", cpUpload, async (req, res) => {
    //Change folder name
    req.body.index = undefined;
    const oldFolderName = "./public/image";
    const newFolderName = `./public/${req.body._id}`;
    fs.rename(oldFolderName, newFolderName, async (err) => {
        if (err){
            console.log("Some thing Wrong !!");
        }

        await modelProduct.updateDescription(req.body._id, req.body.proDescription);
        res.redirect(`/seller/channel/product/detail/${req.body._id}`);
    });

})


router.get("/channel/product/insert/review", (req, res) => {
    res.locals.ThemSanPham.isActive = true;
    res.render("./seller/channel_product_insert_review", {
        layout: "seller.layout.hbs"
    })
})

router.get("/channel/product/detail/:id", authUserWithProduct, async function(req, res) {
    const ProID = req.params.id;
    const list =  await modelProduct.findById(ProID);
    const product = list[0];
    await formatProduct.formatCategory(product);

    const status = await formatProduct.getStatus(product);
    const isSuccess = (status === "Đấu giá thành công") ? true : false;

    const indexImage = [];
    for (let index = 1; index < product.numberImage; index++)
        indexImage.push(index);

    res.locals.XemSanPham.isActive = true;
    res.locals.XemChiTiet.isActive = true;
    let files = null;
    let mainThumb = null;
    try{
        files = fs.readdirSync(`./public/${product._id}/`);
        mainThumb = files[0];
        files.splice(0, 1);
    }catch(e){
        console.log(e);
    }



    res.render("./seller/channel_product_detail", {
        layout: "seller.layout.hbs",
        product,
        status,
        isSuccess,
        files,
        mainThumb
    })
})

router.post("/channel/product/detail/:id", async (req, res) => {
    console.log(req.body);
    const userID = req.body.userID;
    let ProID = req.params.id;

    let rate = null;
    let comment = "Người thằng không thanh toán";
    let isSuccess = false;

    if (req.body.sellerComment !== undefined){
        comment = req.body.sellerComment;
        isSuccess = true;
    }

    if (req.body.score === '1') {
        rate = true;
    }
    else if (req.body.score === '0'){
        rate = false;
    }
    else
        rate = false;

    if (userID != undefined){
        if (!isSuccess)
            await productModel.updateCurrenBidderInfor(ProID, null);

        // Update lại commnet trong bidderHistory
        const rawData = await accountModel.getCommentWithProID(ProID);
        let commentOfProduct = rawData[0];
        //----TH1 : Nếu như đã có rồi thì update lại thôi
        if (rawData.length != 0){


            commentOfProduct.sellerRate = rate;
            commentOfProduct.sellerComment = comment;

            await accountModel.updateCommentFromProID(commentOfProduct.proID, commentOfProduct);
        }
        //----Th2 : Nếu như chưa có thì phải tổng hợp dữ liệu để thêm vào
        if (rawData.length === 0){

            commentOfProduct = {};

            commentOfProduct.proID = new ObjectId(ProID);
            commentOfProduct.bidderComment = "";
            commentOfProduct.sellerComment = comment;
            commentOfProduct.bidderRate = false;
            commentOfProduct.sellerRate = rate;
            commentOfProduct.bidderID = new ObjectId(userID);
            commentOfProduct.sellerID = new ObjectId(res.locals.user._id);

            await accountModel.insertNewComment(commentOfProduct);
        }
    }
    else{
        let Message = req.body.proDescription;
        Message =  `<p class="text-danger h3"> ${new Date().toLocaleString("en-GB")}</p> ${Message}`;


        const dataProduct = await modelProduct.findById(ProID);
        let insertedMessage = dataProduct[0].proDescription + Message;

        console.log("Message : " + req.body.proDescription);
        console.log("inserted message : " + insertedMessage);

        await modelProduct.updateDescription(new ObjectId(ProID), insertedMessage);
    }


    res.redirect(`/seller/channel/product/detail/${ProID}`);
})

router.get("/channel/product/detail/:id/list", authUserWithProduct, async (req, res) => {
    res.locals.XemSanPham.isActive = true;

    //Getting user data from bidderHistory
    const productID = req.params.id;
    const bidderHistory = await productModel.getBidderHistoryWithProID(productID);

    //Handle page
    let nPage = Math.floor((bidderHistory.length - 1) / 8) + 1;
    const choosenPage = req.query.page;
    let prevPage = {check:true, value : 0};
    let nextPage = {check:true, value : 0};
    let curPage = {check:true, value : 0};
    await page.handlePage(prevPage, curPage, nextPage, choosenPage, nPage );


    //Find offset base on curPage
    let limitUser = 8;
    let offset = ((+choosenPage - 1) * limitUser) || 0;
    const numberUser = bidderHistory.length;
    bidderHistory.slice(offset, (offset + limitUser  < numberUser) ? offset + limitUser : numberUser)

    let emptyMsg;
    if (bidderHistory.length === 0)
        emptyMsg = "Hiện tại chưa có ai đặt sản phẩm của bạn"

    res.render("./seller/channel_product_detail_listBider", {
        layout: "seller.layout.hbs",
        bidderHistory,
        productID,
        prevPage,
        nextPage,
        curPage,
        emptyMsg
    })
})

router.post("/channel/product/detail/:id/list", authUserWithProduct, async (req, res) => {
    res.locals.XemSanPham.isActive = true;

    //Getting user data from bidderHistory
    const productID = req.params.id;
    const userID = req.body.userID;

    await productModel.denyUserOnBidderHistory(productID, userID);
    const productRaw = await productModel.findById(productID);
    const product = productRaw[0];
    const account = await  accountModel.findByID(userID)


    // Gửi mail
    await mailing.sendEmail(account.email,
        "Thông báo từ chối ra giá",
        `Sản phẩm ${product.proName} mà bạn đã đặt mua hiện tại đã bị người bán từ chối ra giá . ` + `Chúng tôi rất tiếc khi phải thông báo sự cố này .`)

    //Roll back giá sản phẩm
    const bidderHistories = await productModel.getBidderHistoryWithProID(productID);
    let currentPrice = product.proInitalPrice;
    let bidderWithHighest = bidderHistories[0];

    if (bidderHistories.length > 1){
        let highestUser = null;
        let secondUser = null;
        let count = 0;

        for (const bidderHistory of bidderHistories)
            if (bidderHistory.isDenied !== 1){
                if (count === 0){
                    highestUser = bidderHistory;
                    bidderWithHighest = bidderHistory;
                    count++;
                }
                else{
                    secondUser = bidderHistory;
                    break;
                }
            }

        if (count > 1){

            if (secondUser.dateBid < highestUser.dateBid) // Nếu thằng thứ hai tới trước thằng thứ nhất
                currentPrice = secondUser.price + product.proPriceStep;
            else // Nếu thằng thứ hai tới sau thằng thứ nhất
                currentPrice = secondUser.price;
        }
    }


    await productModel.updatePriceProduct(productID, currentPrice);

    //Chuyển người mua cao thứ nhì thành bidder infor
    await productModel.updateCurrenBidderInfor(productID, bidderWithHighest.userID);


    res.redirect(`/seller/channel/product/detail/${productID}/list`)
})

//API
router.get("/channel/getCatChild", async (req, res) => {
    const id = req.query.catParentID;
    const catChildList = await modelCategory.getCatChild(id);
    res.json(catChildList[0].catChild);
})

router.post("/channel/updateEndDate", async (req, res) => {

})
export default router;