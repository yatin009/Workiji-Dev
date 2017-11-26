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
    downloadTickets(dateRange, false, res);
});

router.post('/date_wise', function (req, res) {
    let dateRange = req.body;
    downloadTickets(dateRange, true, res);
});

function downloadTickets(dateRange, isDateWise, res) {
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
            if(isDateWise){
                calculateAnalyticsDateWise(tickets, res);
            }else {
                var analytic = calculateAnalytics(tickets);
                res.status(200);
                res.send(analytic);
            }
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

function calculateAnalytics(tickets) {
    let analytic = emptyAnalytics();

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
    return analytic;
}

function calculateAnalyticsDateWise(tickets, res) {
    let analyticFull = calculateAnalytics(tickets);
    var ticketMap = new Map();
    var analyticMap = new Map();
    tickets.forEach(function (ticket) {
        let ticketDate = dateFormat(ticket.dateTime, "mm-dd-yyyy");
        let childTickets = ticketMap.get(ticketDate);
        if(childTickets){
            childTickets.push(ticket)
        }else{
            childTickets = [ticket];
        }
        ticketMap.set(ticketDate, childTickets);
    });
    ticketMap.forEach(function (value, key) {
        analyticMap.set(key, calculateAnalytics(value));
    });
    res.status(200);
    res.send(JSON.stringify({analyticFull, analyticMap: Array.from(analyticMap)}));
}

function emptyAnalytics(){
    return new ANALYTICS(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

module.exports = router;