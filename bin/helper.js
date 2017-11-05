/**
 * Created by chaya on 07/19/2017.
 */
var helper = function () {
    this.validObjectId = validObjectId;
    this.validateEmail = validateEmail;
    this.validInteger=validInteger;
    global.generalError = {
        "error": {
            "message": "oops! somesthing went wrong ,please try later",
            "type": "Customers",
            "code": 3150
        }
    }
    function validObjectId(id) {
        var reg = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
        return reg.test(id);
    }
    function validInteger(num) {
        return !isNaN(num);
    }
    
    function ResultCustomerObject(customer) {
        if (customer.line && customer.line.profile) {
            customer.line.profile.last_updated = undefined;
        }
        if (customer.wechat && customer.wechat.profile) {
            customer.wechat.profile.last_updated = undefined;
        }
        return customer;
    }

    function validateEmail(email) {
        var regex = /^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)[\\.]([a-zA-Z]{2,9})$/;
        if (!regex.test(email)) {
            return false;
        }
        return true;
    }

};
module.exports = helper;