const cryptoUtil = require('crypto');

/**
 * 加密
 * @param data
 * @param key
 * @param iv
 * @returns {string}
 */

const encrypt = (data, key, iv) => {
    const cipher = cryptoUtil.createCipheriv('aes-128-ecb', key, iv);
    let encryptData = cipher.update(data, "utf-8", "base64");
    encryptData += cipher.final("base64");

    return encryptData;
};


/**
 * 解密
 * @param data
 * @param key
 * @param iv
 * @returns {string}
 */
const decrypt = (data, key, iv) => {
    const decipher = cryptoUtil.createDecipheriv('aes-128-ecb', key, iv);
    let decryptData = decipher.update(data, "base64", "utf-8");
    decryptData += decipher.final("utf-8");

    return decryptData;
};

module.exports = {
    encrypt,
    decrypt
};