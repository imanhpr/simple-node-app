const https = require("https");

const URL = 'https://api.arcaptcha.co/arcaptcha/api/verify';

const ARC_SITE_KEY = process.env.ARC_SITE_KEY;
const ARC_SECRET = process.env.ARC_SECRET;


function arcValidate(challange , cb) {
    const bodyData = JSON.stringify({
        challenge_id: challange,
        site_key: ARC_SITE_KEY,
        secret_key : ARC_SECRET,
    })
    const options = {
        method : 'POST',
        headers: {
            "Content-Type" : 'application/json',
            "Content-Length" : bodyData.length,
        }
    }
    const request = https.request(URL , options , response => {
        response.on('data', d => {
            const json = JSON.parse(d.toString())
            cb(json.success)
        })
    })
    request.write(bodyData);
    request.end;
}

module.exports = arcValidate;