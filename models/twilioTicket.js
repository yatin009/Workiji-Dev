/**
 * Created by yatin on 21/05/17.
 */
/**
 * Created by yatin on 21/05/17.
 */

var RequesterData = require('../models/requesterData.js');
var TicketTimeline = require('../models/ticketTimeline.js');

function TwilioTicket(message, date, id, msg, lat, lng, address, requesterNumber, city, imageUrl) {
    this.agentId = "4HyK2VKuffQvoY5cih8pM7NjGMr1";
    this.dateTime = date; //tweet.created_at; //Add dateTime
    this.issueImageName = imageUrl; //tweet.media[0].media_url; // Add image link
    this.lat = lat;//43.7854;
    this.lng = lng;//-79.2265;
    this.priority = "HIGH";
    this.requestorId = requesterNumber;
    this.searchKeyword = "";
    this.status = "Incoming";
    this.ticketKey = "";
    this.ticketNumber = "";
    this.requester = new RequesterData(msg, address, city)
    this.ticketTimelines = ticketTimeline;
    // null parameters
    this.approverId = null;
    this.contractorId = null;
    this.messageId = id; //tweet.id_str;
    this.issue = msg; //tweet.text;
}

function TwilioTicket(message, date, lat, lng){
    this.agentId = message.buildingUser.agentId;//"4HyK2VKuffQvoY5cih8pM7NjGMr1";
    this.dateTime = date;
    this.issueImageName = message.imageUri;
    this.lat = lat;//43.7854;
    this.lng = lng;//-79.2265;
    this.priority = "HIGH";
    this.requestorId = message.from;
    this.searchKeyword = "";
    this.status = "Incoming";
    this.ticketKey = "";
    this.ticketNumber = new Date().getTime()+"";
    this.requester = new RequesterData(message.body, null, null, message.buildingUser);
    this.messageId = message.sid;
    this.issue = message.body;
    this.ticketTimelines = getTimelineArray(date);
    this.buildingUser = message.buildingUser;
    // null parameters
    this.approverId = null;
    this.contractorId = null;
}

function getTimelineArray(date){
    return {
        "0": new TicketTimeline("Incoming", "COMPLETED", date),
        "1": new TicketTimeline("Assigned", "PENDING", null),
        "2": new TicketTimeline("Approver Assigned", "PENDING", null),
        "3": new TicketTimeline("Approved", "PENDING", null),
        "4": new TicketTimeline("Scheduled", "PENDING", null),
        "5": new TicketTimeline("Work Completed", "PENDING", null),
        "6": new TicketTimeline("WorkRated", "PENDING", null)
    }
}
// var ticketTimeline = {
//     "0": new TicketTimeline("Incoming", "COMPLETED"),
//     "1": new TicketTimeline("Assigned", "PENDING", null),
//     "2": new TicketTimeline("Approver Assigned", "PENDING", null),
//     "3": new TicketTimeline("Approved", "PENDING", null),
//     "4": new TicketTimeline("Scheduled", "PENDING", null),
//     "5": new TicketTimeline("Work Completed", "PENDING", null),
//     "6": new TicketTimeline("WorkRated", "PENDING", null)
// }

TwilioTicket.prototype.toJSONString = function () {
    return JSON.stringify({
        agentId: this.agentId,
        dateTime: this.dateTime,
        issueImageName: this.issueImageName,
        lat: this.lat,
        lng: this.lng,
        priority: this.priority,
        requestorId: this.requestorId,
        searchKeyword: this.searchKeyword,
        status: this.status,
        ticketKey: this.ticketKey,
        ticketNumber: this.ticketNumber,
        requester: this.requester.print(),
        approverId: this.approverId,
        contractorId: this.contractorId,
        ticketTimelines: this.ticketTimelines,
        tweetId: this.tweetId,
        issue: this.issue
    });
}

TwilioTicket.prototype.print = function () {
    console.log(this.toJSONString());
}

module.exports = TwilioTicket;