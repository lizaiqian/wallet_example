/**
 * catch async errors
 */
require('express-async-errors');


/**
 * 配置express，config
 * @type {createError}
 */
const createError = require('http-errors');
const express = require('express');
const app = express();
const { port } = require('./config');

/**
 * 配置日志
 * @type {morgan}
 */
const logger = require('morgan');

/**
 * post请求body解析器
 * @type {Parsers|*}
 */
const bodyParser = require('body-parser');

/**
 * 跨域请求
 */
app.all('*', function(req, res, next) {

    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header('Access-Control-Allow-Credentials', "true");
    res.header("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    next();
});

/**
 * 请求及响应处理中间件
 */
app.use(require("./midware/responseMid"));
app.use(require("./midware/visitMid"));

app.use(logger('combined'));

/**
 * post请求body parse json
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({extended: false}));

/**
 * 钱包用户接口
 */
app.use('/users', require('./routes/users'));

app.use('/rechargeInfos', require('./routes/rechargeInfos'));

app.use('/balances', require('./routes/balances'));

/**
 * 捕获404错误
 */
app.use(function (req, res, next) {
    next(createError(404));
});

app.use((err, req, res) => {
    // set locals, only providing error in developmentwe
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.fail(err.message);
});

app.listen(port, "0.0.0.0");

module.exports = app;
