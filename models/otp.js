/**
 * Created by yatin on 28/10/17.
 */
function OTP(number, otp) {
    this.number = number;
    this.otp = otp;
    this.otpKey = "";
}

OTP.prototype.toJSONString = function () {
    return JSON.stringify({
        number: this.number,
        otp: this.otp,
        otpKey: this.otpKey
    });
}

OTP.prototype.print = function () {
    console.log(this.toJSONString());
}

module.exports = OTP;