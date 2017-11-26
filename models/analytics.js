/**
 * Created by yatin on 25/11/17.
 */
function ANALYTICS(approvalCount, approvedCount, dispatchedCount, highClose,
                   highCount, highOpen, incomingCount, lowClose, lowCount, lowOpen,
                   medClose, medOpen, mediumCount, scheduleCount, workCompletedCount,
                   workRatedCount) {

    this.approvalCount = approvalCount;
    this.approvedCount = approvedCount;
    this.dispatchedCount = dispatchedCount;
    this.highClose = highClose;
    this.highCount = highCount;
    this.highOpen = highOpen;
    this.incomingCount = incomingCount;
    this.lowClose = lowClose;
    this.lowCount = lowCount;
    this.lowOpen = lowOpen;
    this.medClose = medClose;
    this.medOpen = medOpen;
    this.mediumCount = mediumCount;
    this.scheduleCount = scheduleCount;
    this.workCompletedCount = workCompletedCount;
    this.workRatedCount = workRatedCount;
}

ANALYTICS.prototype.toJSONString = function () {
    return JSON.stringify({
        approvalCount: this.approvalCount,
        approvedCount: this.approvedCount,
        dispatchedCount: this.dispatchedCount,
        highClose: this.highClose,
        highCount: this.highCount,
        highOpen: this.highOpen,
        incomingCount: this.incomingCount,
        lowClose: this.lowClose,
        lowCount: this.lowCount,
        lowOpen: this.lowOpen,
        medClose: this.medClose,
        medOpen: this.medOpen,
        mediumCount: this.mediumCount,
        scheduleCount: this.scheduleCount,
        workCompletedCount: this.workCompletedCount,
        workRatedCount: this.workRatedCount,
    });
};

ANALYTICS.prototype.print = function () {
    console.log(this.toJSONString());
};

module.exports = ANALYTICS;