/**
 * Created by yatin on 15/10/17.
 */

var express = require('express');
var router = express.Router();
let Ticket = require('../models/twilioTicket.js');
let HELPER = require('../helper/helperFunctions.js');
let OTP = require('../models/otp.js');
let twilio = require('twilio');
let admin = require('firebase-admin');
let async = require('async');
let NodeGeocoder = require('node-geocoder');
const dateFormat = require('dateformat');
let Organization = require('../models/organization.js');
let HELPERSMS = require('../helper/helperSMS.js');

let options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    formatter: null         // 'gpx', 'string', ...
};
let geocoder = NodeGeocoder(options);

const accountSid = 'AC258924160f4455d78e2d2bbb3d320224'; // Your Account SID from www.twilio.com/console
const authToken = 'a0a2d7315ded3cc86b2d3abcd5177340';   // Your Auth Token from www.twilio.com/console

const client = new twilio(accountSid, authToken);

const database = admin.database();

router.post("/create_message", function (req, res) {
    console.log(req.body);
    HELPERSMS.createSMS(req.body, res)
});

router.get("/get_messages", function (req, res) {
    getAllMessages(false, function (messages) {
        if (messages.length > 0) {
            filterValidMessage(messages, res);
        } else {
            res.status(200);
            res.send('No new messages');
        }
    })
});

router.get("/delete_all_messages", function (req, res) {
    getAllMessages(true, function (messages) {
        if (messages.length > 0) {
            deleteAllMessages(messages, res);
        } else {
            res.status(200);
            res.send('No new messages');
        }
    })
});

function getAllMessages(getAllMessages, callback) {
    var messageList = [];
    client.messages.list(function (err, data) {
        if (!err) {
            data.forEach(function (message) {
                if (getAllMessages || (message.direction === 'inbound')) {//&& message.numMedia > 0
                    messageList.push(message)
                }
            });
            callback(messageList);
        } else {
            console.log(err);
            callback(messageList);
        }
    });
}

function filterValidMessage(messages, res) {
    //TODO invalid messages array not used, to reply back user to message from registerred number.
    var validMessages = [], invalidMessage = [];
    let ref = database.ref("building_users");
    ref.once('value', function (snapshot) {
        snapshot.forEach(function (childSnap) {
            var buildUser = childSnap.val();
            messages.forEach(function (message) {
                if (message.from.includes(buildUser.contactNumber)) {
                    message.buildingUser = buildUser;
                    validMessages.push(message);
                } else {
                    invalidMessage.push(message);
                }
            });
        });
        if (validMessages.length > 0) {
            checkDBForOldMessage(validMessages, res);
        } else {
            res.status(200);
            res.send('No new Messages');
        }
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        res.status(402);
        res.send(errorObject.code);
    });
}

function checkDBForOldMessage(messages, res) {
    var fMessagesid = [];
    var fTicketMediaMessage = [];
    var fTicketMessage = [];
    var ref = database.ref("ticketing");
    // Attach an asynchronous callback to read the data at our posts reference
    ref.once('value', function (snapshot) {
        snapshot.forEach(function (childSnap) {
            var messageSnap = childSnap.val();
            if (messageSnap.messageId) {
                fMessagesid.push(messageSnap.messageId);
            }
        });
        messages.forEach(function (childMessage) {
            if (fMessagesid.indexOf(childMessage.sid) === -1)   {
                if (childMessage.numMedia > 0) {
                    fTicketMediaMessage.push(childMessage);
                } else {
                    childMessage.imageUri = null;
                    fTicketMessage.push(childMessage);
                }
            }
        });
        if (fTicketMediaMessage.length > 0 || fTicketMessage.length > 0) {
            downloadMediaUri(fTicketMediaMessage, fTicketMessage, res);
        } else {
            res.status(200);
            res.send('No new Messages');
        }
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        res.status(402);
        res.send(errorObject.code);
    });
}

function downloadMediaUri(mediaMessages, messages, res) {
    async.forEachOf(mediaMessages, function (message, key, callback) {
        client.messages(message.sid).media.list(function (err, data) {
            if (err) {
                return callback(err);
            }
            data.forEach(function (media) {
                message.imageUri = parseImageUri(media.uri);
                callback();
            });
        });
    }, function (err) {
        if (err) {
            console.error(err.message);
            res.status(400);
            res.send(err);
        }
        // configs is now a map of JSON data
        var allMessages = messages.concat(mediaMessages);
        createTicket(allMessages, res);
    });
}

function parseImageUri(imageLink) {
    return "https://api.twilio.com" + imageLink.substring(0, imageLink.length - 5);
}

function createTicket(fTicketMessage, res) {
    fTicketMessage.forEach(function (childMessage) {
        let location = childMessage.buildingUser.unitNumber + ", " + childMessage.buildingUser.address +
            ", " + childMessage.buildingUser.city + ", " + childMessage.buildingUser.proviance + ", " + childMessage.buildingUser.country;

        geocoder.geocode(location)
            .then(function (res) {
                var lat = 0, lng = 0;
                if (res[0]) {
                    lat = res[0].latitude;
                    lng = res[0].longitude;
                }
                pushTicket(new Ticket(
                    childMessage,
                    dateFormat(childMessage.dateCreated, "mm-dd-yyyy HH:MM") + "",
                    res[0].latitude,
                    res[0].longitude,
                    location,
                    childMessage.buildingUser.city));
            })
            .catch(function (err) {
                console.log(err);
            });
    });
    res.status(200);
    res.send('Tickets created from new messages ' + fTicketMessage.length);
}

function pushTicket(ticket) {
    let newPostKey = database.ref("ticketing").push().key;
    ticket.ticketKey = newPostKey;
    sendReply(ticket.requestorId, ticket.ticketNumber);
    admin.database().ref("ticketing/" + newPostKey).set(
        ticket
    );
}

function sendReply(to, ticketNumber) {
    client.messages.create({
        body: 'Thank you. A ticket has been created for your reported issue. Your ticket number is '+ticketNumber,
        to: to,  // Text this number
        from: '+16479302246' // From a valid Twilio number
    });
}

function deleteAllMessages(messageList, res) {
    messageList.forEach(function (message) {
        client.messages(message.sid).fetch().then((message) => {
            return message.remove().then(() => console.log(message.body));
        });
        // client.messages().delete();
    });
    res.status(200);
    res.send('Deleted ' + messageList.length + ' messages');
}

router.post("/generate_otp", function (req, res) {
    console.log(req.body);
    let number = req.body.number;
    if(!number){
        res.status(400);
        res.send("Provide number")
    }
    let otpNumber = getRandomNumber();
    insertIntoFirebase(number, otpNumber);
    var otpMessage = 'Please enter the following 4-digit code to verify your number : '+otpNumber;
    client.messages.create({
        body: otpMessage,
        to: number,  // Text this number
        from: '+16479302246' // From a valid Twilio number
    }, function (err, message) {
        if (!err) {
            res.status(200)
            res.send('Message Sent');
        } else {
            res.status(err.status);
            res.send(err)
        }
    });
});

function getRandomNumber(){
    return Math.floor(1000 + Math.random() * 9000);
}

function insertIntoFirebase(number, otpNumber){
    let newPostKey = database.ref("otp").push().key;
    var otp = new OTP(number, otpNumber)
    otp.otpKey = newPostKey;
    admin.database().ref("otp/" + newPostKey).set(
        otp
    );
}

router.post("/verify_otp", function (req, res) {
    console.log(req.body);
    var otpBody = req.body;
    verifyOTP(otpBody, res)
});

function verifyOTP(otp, res) {
    var verified = false, otpChildToRemove;
    let ref = database.ref("otp");
    console.log(otp);
    ref.once('value', function (snapshot) {
        snapshot.forEach(function (childSnap) {
            let otpChild = childSnap.val();
            console.log(otpChild);
            if(otpChild.number === parseInt(otp.contactNumber) && otpChild.otp === parseInt(otp.otp)){
                verified = true;
                otpChildToRemove = otpChild;
            }
        });
        if(verified){
            removeOTPObjectFromFirebase(otpChildToRemove)
            HELPER.createOrganizationCode(new Organization(otp),res);
            // res.status(200);
            // res.send('OTP verified');
        }else{
            res.status(200);
            res.send('OTP not verified');
        }
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        res.status(402);
        res.send(errorObject.code);
    });
}

function removeOTPObjectFromFirebase(otp) {
    let del_ref = database.ref("otp/" + otp.otpKey);
    del_ref.remove()
}


module.exports = router;