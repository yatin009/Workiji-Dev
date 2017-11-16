/**
 * Created by yatin on 15/11/17.
 */
let twilio = require('twilio');

const accountSid = 'AC258924160f4455d78e2d2bbb3d320224'; // Your Account SID from www.twilio.com/console
const authToken = 'a0a2d7315ded3cc86b2d3abcd5177340';   // Your Auth Token from www.twilio.com/console

const client = new twilio(accountSid, authToken);

module.exports = {
    createSMS : function (req, res) {
        client.messages.create({
            body: req.body,
            to: req.to,  // Text this number
            from: '+16479302246' // From a valid Twilio number
        }, function (err, message) {
            if(res) {
                if (!err) {
                    res.status(200)
                    res.send('Message Sent');
                } else {
                    res.status(err.status);
                    res.send(err)
                }
            }
        });
    }
};