/**
 * Created by yatin on 25/11/17.
 */
let express = require('express');
let router = express.Router();
const admin = require('firebase-admin');
const ANALYTICS = require('../models/analytics.js');
const dateFormat = require('dateformat');

const database = admin.database();

router.post('', function (req, res) {
    let dateRange = req.body;
    downloadTickets(dateRange, res);
});

function downloadTickets(dateRange, res) {
    const tickets = [];
    const ref = database.ref("ticketing");
    // Attach an asynchronous callback to read the data at our posts reference
    ref.once('value', function (snapshot) {
        snapshot.forEach(function (childSnap) {
            const ticket = childSnap.val();
            if (validDateRange(ticket.dateTime, dateRange)) {
                tickets.push(ticket);
            }
        });
        if (tickets.length > 0) {
            calculateAnalytics(tickets, res);
        } else {
            res.status(200);
            res.send(emptyAnalytics());
        }
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        res.status(402);
        res.send(errorObject.code);
    });
}

function validDateRange(date, dateRange){
    let startDate = dateFormat(dateRange.startDate, "mm-dd-yyyy");
    let endDate = dateFormat(dateRange.endDate, "mm-dd-yyyy");
    let ticketDate = dateFormat(date, "mm-dd-yyyy");
    return(ticketDate<=endDate && ticketDate>=startDate);

}

function calculateAnalytics(tickets, res) {
    var analytic = emptyAnalytics();

    tickets.forEach(function (ticket) {
        var isOpen = true;
        switch (ticket.status) {
            case "Incoming":
                analytic.incomingCount++;
                break;
            case "Assigned":
                analytic.dispatchedCount++;
                break;
            case "Approver Assigned":
                analytic.approvalCount++;
                break;
            case "Approved":
                analytic.approvedCount++;
                break;
            case "Scheduled":
                analytic.sceduledCount++;
                break;
            case "Work Completed":
                isOpen = false;
                analytic.workCompletedCount++;
                break;
            case "WorkRated":
                isOpen = false;
                analytic.workRatedCount++;
                break;
            default:
                break;
        }

        switch (ticket.priority) {
            case "HIGH":
                analytic.highCount++;
                if (isOpen) {
                    analytic.highOpen++;
                } else {
                    analytic.highClose++;
                }
                break;
            case "MEDIUM":
                analytic.mediumCount++;
                if (isOpen) {
                    analytic.medOpen++;
                } else {
                    analytic.medClose++;
                }
                break;
            case "LOW":
                analytic.lowCount++;
                if (isOpen) {
                    analytic.lowOpen++;
                } else {
                    analytic.lowClose++;
                }
                break;
            default:
                break;
        }
    });
    res.status(200);
    res.send(analytic);
}

function emptyAnalytics(){
    return new ANALYTICS(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

module.exports = router;