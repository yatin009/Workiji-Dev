/**
 * Created by yatin on 15/11/17.
 */
function SMS(to, body) {
    this.to = to;
    this.body = body;
}

SMS.prototype.toJSONString = function () {
    return JSON.stringify({
        to: this.to,
        body: this.body,
    });
};

SMS.prototype.print = function () {
    console.log(this.toJSONString());
};

module.exports = SMS;