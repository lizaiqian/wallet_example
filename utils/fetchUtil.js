const fetch = require('node-fetch');

/**
 * post请求封装
 * @param api
 * @param data
 * @returns {*}
 */
const fetchRequest = (api, data) => {
    return fetch(api, {
        method: 'POST',
        body: JSON.stringify({token: data}),
        headers: {'Content-Type': 'application/json'}
    }).then(res => {
        if(res.status !== 200) {
            throw Error("请求失败");
        }
        return res.json();
    });
};

/**
 * get请求数据
 * @param api
 * @returns {*}
 */
const fetchGet = (api) => {

    return fetch(api).then(res => {
        if(res.status !== 200) {
            throw Error("请求失败");
        }
        return res.json();
    })

};


module.exports = {
    fetchRequest,
    fetchGet
};