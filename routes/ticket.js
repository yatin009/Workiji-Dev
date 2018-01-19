/**
 * Created by yatin on 18/01/18.
 */

let express = require('express');
let router = express.Router();
const admin = require('firebase-admin');
const TICKET = require('../models/ticket.js');

const dateFormat = require('dateformat');

const database = admin.database();

router.get('/get_timeline', function (req, res) {
    let ticketNumber = req.query.ticket_number;
    downloadTicketTimeline(ticketNumber, res);
});

function downloadTicketTimeline(ticketNumber, res) {
    const ref = database.ref("ticketing");
    var findTicket;
    // Attach an asynchronous callback to read the data at our posts reference
    ref.once('value', function (snapshot) {
        snapshot.forEach(function (childSnap) {
            const ticket = childSnap.val();
            if (ticket.ticketNumber === ticketNumber) {
                findTicket = ticket;
            }
        });
        if (findTicket) {
            res.status(200);
            res.send(findTicket.ticketTimelines);
        } else {
            res.status(200);
            res.send("No ticket found");
        }
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        res.status(402);
        res.send(errorObject.code);
    });
}


module.exports = router;