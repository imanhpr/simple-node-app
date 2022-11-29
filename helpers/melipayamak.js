const {
    randomInt,
} = require("crypto")
const {
    ACTIVATE_MAP
} = require("../utils/constants")

const https = require('https')

const MELI_URL = 'https://console.melipayamak.com/api/send/shared/a6497aa2809d4dc3b78cfbd44b661e81';

const BODY_NUMBER = 106946;
const FORGET_PASS_BODY_NUMBER = 108500;

function addCodeToMap(phoneNumber , code ,sec = 1000 * 60) {
    console.log(code)
    ACTIVATE_MAP.set(phoneNumber , code)
    setTimeout(() => {
        ACTIVATE_MAP.delete(phoneNumber)
    } , sec)
    console.log(ACTIVATE_MAP)
}

function sendSms(phoneNumber, cb , bodyId = BODY_NUMBER) {
    if (typeof phoneNumber !== 'string') {
        throw new Error("phoneNumber must be an string");
    }
    if (typeof cb !== 'function') {
        throw new Error("cb must be and callback function")
    }
    const sec_code = randomInt(1000 , 9999).toString();
    const payload = JSON.stringify({
        "bodyId": bodyId,
        "to": phoneNumber,
        "args": [sec_code]
    })
    
    const option = {
        method: 'POST',
        headers : {
            'Content-Type' : 'application/json',
            'Content-length' : payload.length
        }
    }
    const request = https.request(MELI_URL , option , response => {
        response.on('data' ,d => {
            const data = JSON.parse(d.toString())
            if (data?.status === "ارسال نشده") {
                response.emit('error' , new Error(`Code didn't send to ${phoneNumber}`))
            } else {
                cb(phoneNumber , sec_code , null)
            }
        })
        response.on('error' , err => {
            cb(null , null ,err)
        })
    })
    addCodeToMap(phoneNumber , sec_code)
    request.write(payload);
    request.end()
}

function sendPasswordSms(number , newPass , cb = null){
    if (typeof number !== 'string') {
        throw new Error("phoneNumber must be an string");
    }
    const payload = JSON.stringify({
        "bodyId": FORGET_PASS_BODY_NUMBER,
        "to": number,
        "args": [newPass.toString()]
    })
    const option = {
        method: 'POST',
        headers : {
            'Content-Type' : 'application/json',
            'Content-length' : payload.length
        }
    }
    const request = https.request(MELI_URL , option , response => {
        response.on('data' ,d => {
            const data = JSON.parse(d.toString())
            console.log(data)
            if (data?.status === "ارسال نشده") {
                response.emit('error' , new Error(`Code didn't send to ${phoneNumber}`))
            } else {
                if (cb) cb(null)
            }
        })
        response.on('error' , err => {
            if (cb) cb(err)
        })
    })
    request.write(payload);
    request.end()

}

module.exports = sendSms;

module.exports.sendPasswordSms=sendPasswordSms;