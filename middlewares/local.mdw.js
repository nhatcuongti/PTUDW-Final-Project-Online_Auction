import categoryModel from '../models/category-model.js'

export default function (app) {
    app.use(async function (req, res, next) {
        // res.locals.lcCategories[1].isActive = 1;
        res.locals.ThongTinChung = {isActive:false};
        res.locals.XemSanPham = {isActive:false};
        res.locals.ThemSanPham = {isActive:false};
        res.locals.XemChiTiet = {isActive:false};
        res.locals.DanhGia = {isActive:false};
        next();
    });
    app.use(async function (req, res, next) {
        res.locals.bidderRole = false;
        res.locals.sellerRole = false;
        res.locals.adminRole = false;
        if (typeof (req.session.auth) === 'undefined')
            req.session.auth = false;
        res.locals.auth = req.session.auth;
        if(typeof (req.session.user) !== 'undefined' && req.session.user !== null ){
            const user = req.session.user[0];
            res.locals.user = user;

            res.locals.sellerID = user._id;

            if(user.role === 'bidder')
                res.locals.bidderRole = true;
            else if(user.role === 'seller')
                res.locals.sellerRole = true;
            else
                res.locals.adminRole = true;
        }
        else
            res.locals.user = req.session.user;

        next();
    });
    app.use(async function (req, res, next) {
        res.locals.categories = await categoryModel.getAll();
        next();
    });
}