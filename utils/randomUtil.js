/**
 * 产生4位随机数
 * @returns {string}
 */
function generateRandom() {
    let random = "";
    for (let i = 0; i < 4; i++) {
        random += Math.floor(Math.random() * 10).toString();
    }

    return random;
}

module.exports = {generateRandom};