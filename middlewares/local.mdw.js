export default function (app) {
    app.use(async function (req, res, next) {
        // res.locals.lcCategories[1].isActive = 1;
        res.locals.ThongTinChung = {isActive:false};
        res.locals.XemSanPham = {isActive:false};
        res.locals.ThemSanPham = {isActive:false};
        res.locals.XemChiTiet = {isActive:false};
        next();
    });
    app.use(async function (req, res, next) {
        if (typeof (req.session.auth) === 'undefined')
            req.session.auth = false;
        res.locals.auth = req.session.auth;
        if(typeof (req.session.user) !== 'undefined' && req.session.user !== null ){
            let temp = req.session.user;
            res.locals.user = temp[0];
            res.locals.bidderRole = false;
            res.locals.sellerRole = false;
            res.locals.adminRole = false;
            if(temp[0].role === 'bidder')
                res.locals.bidderRole = true;
            else if(temp[0].role === 'seller')
                res.locals.sellerRole = true;
            else
                res.locals.adminRole = true;
        }else {
            res.locals.user = req.session.user;
        }
        console.log(req.session.auth)
        console.log(req.session.user)
        next();
    });
}