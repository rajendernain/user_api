const commonObj = require('../common/cosmos');
const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"], process.env["COSMOS_DB_RESOURCE_KEY"], process.env["COSMOS_DB_NAME"], process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {
    //Get data from header
    var device_id = (typeof req.headers.device_id != 'undefined') ? req.headers.device_id : '';
    var access_token = (typeof req.headers.access_token != 'undefined') ? req.headers.access_token : '';
    //Get post data
    var model_id = (typeof req.body.model_id != 'undefined') ? req.body.model_id : '';
    //Global variables
    var errors = [];
    var authorizedUser;
    var new_token = '';
    var user_id;
    //Validations
    if ((device_id == '') || (access_token == '')) {
        errors.push("You are not looking authorized user.");
    } else {
        var token_data = await commonObj.authenticate(device_id, access_token);
        if (typeof token_data.access_token != 'undefined') {
            new_token = token_data.access_token;
            user_id = token_data.user_id;
        } else if (typeof token_data.user_id != 'undefined') {
            user_id = token_data.user_id;
        }
    }
    //Authentication check
    if (!user_id && (errors.length <= 0)) {
        context.res = {
            status: 200,
            body: {
                status: "fail",
                authentication: 0,
                message: "Authentication failed."
            }
        };
    } else if (errors.length <= 0) {
        //Get device model data from device model container
        if (model_id != '') {
            var modelDataArr = await commonCLI.select("battery_model", "SELECT * FROM battery_model as c WHERE c.id='" + model_id + "'");
        } else {
            var modelDataArr = await commonCLI.select("battery_model", "SELECT * FROM battery_model as c WHERE c.status= 1 ORDER BY c.model_name ASC");
        }
        context.res = {
            status: 200, /* Defaults to 200 */
            body: {
                status: "success",
                data: modelDataArr,
                message: "Model list fetched successfully."
            }
        };
        //Add new access token
        if (new_token != '') {
            context.res.body.new_token = new_token;
        }
    }
}
