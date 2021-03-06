import morgan from 'morgan';
import asyncErrors from 'express-async-errors';
import { engine } from 'express-handlebars';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import express_section from 'express-handlebars-sections';
import localMDW from "./middlewares/local.mdw.js";
import { authAdmin, authSeller } from './middlewares/auth-mdw.js';
import express from 'express';
import numeral from 'numeral';
import main from './routes/main-route.js'
import bid from './routes/bid.js'
import account  from "./routes/account.js";
import seller from "./routes/seller.route.js"
import admin from './routes/admin-route.js'
import cron from 'node-cron';
import productModel from './models/product-model.js';
import mailing from "./utils/mailing.js";
import session from 'express-session';



const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(morgan('dev'));
app.use(express.urlencoded({
    extended: true
}));
app.engine('hbs', engine({
    defaultLayout: 'main.hbs',
    helpers: {
        format_number(val) {
            return numeral(val).format('0, 0');
        },
        format_date(val){
            return val.toLocaleString("en-GB");
        },
        format_duration(val){
            //Format time
            const date1 = new Date().getTime();
            const date2 = val.getTime();
            const diffTime = Math.abs(date2 - date1);
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
            const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));


            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            let duration = null;
            if (date2 < date1){
                duration = '<span class="text-danger h4" >Đã hết hạn</span>'
            }
            else if (diffDays <= 3) {
                if (diffHours > 0)
                    duration = `<span class="text-warning h4">Còn ${diffHours} giờ ${diffMinutes} phút</span>`;
                else
                    duration = `<span class="text-warning h4">Còn ${diffMinutes} phút</span>`;
            }
            else{
                duration = `<span class="text-success h4">Còn ${diffDays} ngày</span>`;
            }
            // else {
            //     duration = val.toLocaleString("en-GB");
            // }
            return duration;
        },
        section: express_section()
    }
}));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use('/public', express.static('public'));
app.set('trust proxy', 1);
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { }
}));

cron.schedule('* * * * *', async function () {
    const listResult = await productModel.getExpiredProduct(new Date());
    for (const product of listResult) {
        if (product.curBidderInfo.length === 0)
            await mailing.sendEmail(product.sellerInfo[0].email, 'Thông báo sản phẩm đã hết hạn', `Sản phẩm ${product.proName} của bạn đã hết hạn và chúng tôi rất tiếc khi không tìm thấy người chiến thắng.\nXin cảm ơn đã sử dụng dịch vụ của chúng tôi`);
        else {
            await mailing.sendEmail(product.sellerInfo[0].email, 'Thông báo sản phẩm đã hết hạn', `Sản phẩm ${product.proName} của bạn đã hết hạn và người chiến thắng là ${product.curBidderInfo[0].name}. Vui lòng vào website để đánh giá người chiến thắng.\nXin cảm ơn đã sử dụng dịch vụ của chúng tôi`);
            await mailing.sendEmail(product.curBidderInfo[0].email, 'Thông báo đấu giá thành công sản phẩm', `Chúc mừng bạn đã chiến thắng sản phẩm ${product.proName}. Vui lòng vào website để đánh giá sản phẩm và người bán.\nXin cảm ơn đã sử dụng dịch vụ của chúng tôi.`)
        }
    }
});

localMDW(app);
app.use('/', main);
app.use('/user', account);
app.use('/seller', authSeller, seller);
app.use('/admin', authAdmin, admin);
app.use('/bid', bid);

app.use(function (req, res, next){
    res.render('404', {layout: false});
});

const port = 3000;
app.listen(port, function () {
    console.log(`Example app listening at http://localhost:${port}`);
});