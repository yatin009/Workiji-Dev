/**
 * Created by yatin on 25/11/17.
 */
function TicketCounter(counter) {
    this.counter = counter;
}

TicketCounter.prototype.toJSONString = function () {
    return JSON.stringify({
        counter: this.counter
    });
};

TicketCounter.prototype.print = function () {
    console.log(this.toJSONString());
};

module.exports = TicketCounter;