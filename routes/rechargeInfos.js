/**
 * 基础依赖配置
 * @type {createApplication|e|(() => Express)}
 */
const express = require('express');
const router = express.Router();
const rechargeEthUsdtInfoService = require('../service/rechargeEthUsdtInfo');
const rechargeBtcUsdtInfoService = require('../service/rechargeBtcUsdtInfo');
const userService = require('../service/users');
const fetch = require('node-fetch');
const {rechargeEthUsdtApi} = require('../interface');
const {rechargeIv, rechargeKey, sendTransactionKey, sendTransactionIv} = require('../config');

const crypto = require('../utils/cryptoUtil');

/**
 * 获取所有充值eth-usdt信息
 */
router.get("/ethUsdt/page/:page/limit/:limit", async (req, res, next) => {

    try {
        const limit = parseInt(req.params.limit);
        const page = parseInt(req.params.page);

        const infos = await rechargeEthUsdtInfoService.findInfosByPage(limit, limit * page);
        res.success({info: infos})
    } catch (e) {
        res.fail("invalid parameters");
    }

});


/**
 * 获取所有充值eth-usdt信息
 */
router.get("/btcUsdt/page/:page/limit/:limit", async (req, res, next) => {

    try {
        const limit = parseInt(req.params.limit);
        const page = parseInt(req.params.page);

        const infos = await rechargeBtcUsdtInfoService.findInfosByPage(limit, limit * page);
        res.success({info: infos})
    } catch (e) {
        res.fail("invalid parameters");
    }

});

/**
 * 获取eth-usdt充值总数
 */
router.get('/ethUsdt/count', async (req, res, next) => {

    const count = await rechargeEthUsdtInfoService.getInfoCount();
    res.success(count);

});

/**
 * 获取btc-usdt充值总数
 */
router.get('/btcUsdt/count', async (req, res, next) => {

    const count = await rechargeBtcUsdtInfoService.getInfoCount();
    res.success(count);

});


/**
 * 将数据库内所有未提交信息提交
 */

router.post("/commitAll", async (req, res, next) => {

    const token = req.body.token;
    let decData;
    try {
        decData = crypto.decrypt(token, rechargeKey, rechargeIv);
    } catch (e) {
        res.fail("权限错误");
    }

    const result = await rechargeEthUsdtInfoService.findByStatus(0);

    for (let i = 0; i < result.length; i++) {
        const user = await userService.findById(result[i].uid);
        if (user !== null) {

            let encryptData = crypto.encrypt(JSON.stringify({
                ethAddress: user.ethAddress,
                value: result[i].value
            }), rechargeKey, rechargeIv);

            setTimeout(function () {
                fetch(rechargeEthUsdtApi, {
                    method: 'POST',
                    body: JSON.stringify({token: encryptData}),
                    headers: {'Content-Type': 'application/json'}
                })
                    .then(res => res.json())
                    .then(json => {
                        console.log(json);
                        if (json.code === 1) {
                            rechargeEthUsdtInfoService.commitTransaction(result[i].transactionHash)
                                .then(res => console.log({msg: "状态提交成功", code: json.code}))
                        }
                    })

            }, i * 1000);

        }

    }

    res.success("操作正在执行");
});

/**
 * 删除无效交易
 */
router.post("/deleteInvalid", async (req, res, next) => {

    const token = req.body.token;

    let decData;
    try {
        decData = crypto.decrypt(token, sendTransactionKey, sendTransactionIv);
    } catch (e) {
        res.fail("权限错误");
        return;
    }

    await rechargeEthUsdtInfoService.deleteInvalidTransaction();
    res.success("操作成功");

});


module.exports = router;