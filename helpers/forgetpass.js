const { randomInt } = require('crypto')

const bcrypt = require('bcryptjs')
const { FORGET_SET } = require('../utils/constants')

async function genPassword() {
    const pass = randomInt(1_000_000 , 9_999_999).toString()
    const salt = await bcrypt.genSalt(8)
    const hash = await bcrypt.hash(pass , salt)
    return {hash:hash , pass:pass}
}

function addToForgetSet(number) {
    FORGET_SET.add(number)
    setTimeout(() => {
        FORGET_SET.delete(number)
    } , 120_000)
}

module.exports = {
    genPassword,
    addToForgetSet
}