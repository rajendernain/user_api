const commonObj = require('../common/cosmos');
const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"], process.env["COSMOS_DB_RESOURCE_KEY"], process.env["COSMOS_DB_NAME"], process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {
    //Get data from header
    var device_id = (typeof req.headers.device_id != 'undefined') ? req.headers.device_id : '';
    var access_token = (typeof req.headers.access_token != 'undefined') ? req.headers.access_token : '';
    //Get post data
    var imei = (typeof req.body.imei != 'undefined') ? req.body.imei : '';
    var macaddress = (typeof req.body.macaddress != 'undefined') ? req.body.macaddress.trim().replace(/:/g, '') : '';
    var device_type = (typeof req.body.device_type != 'undefined') ? req.body.device_type : '';
    var location = (typeof req.body.location != 'undefined') ? req.body.location : '';
    var battery_capacity = (typeof req.body.battery_capacity != 'undefined') ? req.body.battery_capacity : '';
    var discharge_max_rate = (typeof req.body.discharge_max_rate != 'undefined') ? req.body.discharge_max_rate : '';
    var inverter_model = (typeof req.body.inverter_model != 'undefined') ? req.body.inverter_model : '';
    var model_name = (typeof req.body.model_name != 'undefined') ? req.body.model_name : '';
    var capacity = (typeof req.body.capacity != 'undefined') ? req.body.capacity : '';
    var installer = (typeof req.body.installer != 'undefined') ? req.body.installer : '';
    var technical_note = (typeof req.body.technical_note != 'undefined') ? req.body.technical_note : '';
    var deployment_date = (typeof req.body.deployment_date != 'undefined') ? req.body.deployment_date : '';
    var assignedUser = (typeof req.body.assignedUser != 'undefined') ? req.body.assignedUser : '';


    //Global variables
    var client_id = 'e3abc159-d21b-40ba-ac42-6bc33f278a34'; //hardcoded for now
    var user_id = '';
    var errors = [];
    var authorizedUser;
    var new_token = '';
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
    // if (imei == '') {
    //     errors.push("IMEI or Macaddressis required field.");
    // }
    if (device_type == '') {
        errors.push("Device type is required field.");
    }
    else if (location == '') {
        errors.push("Location is required field.");
    }
    else if (battery_capacity == '') {
        errors.push("Battery capacity is required field.");
    }
    // else if(capacity == ''){
    //     errors.push("Capacity is required field.");
    // }
    else if (installer == '') {
        errors.push("Installer is required field.");
    }
    else if (deployment_date == '') {
        errors.push("Deployment date is required field.");
    }
    else if (model_name == '') {
        errors.push("Model name is required field.");
    }
    // else if (macaddress == '') {
    //     errors.push("Mac address is required field.");
    // }

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
        user_id = user_id;

        let where= '';

        if(imei != '' && macaddress != ''){
            where= "(c.serial_number = " + imei + ") AND (c.macaddress=" + macaddress + ")";
        }else if(imei == ''){
            where= "c.macaddress=" + macaddress + "";
        }else if(macaddress == ''){
            where= "c.imei=" + imei + "";
        }

        //let qry = "SELECT * FROM battery_detail as c WHERE (c.serial_number = '" + imei + "') OR (c.macaddress='" + macaddress + "') ";
        let qry = "SELECT * FROM battery_detail as c WHERE '"+where+"' ";
              
        let batteryRecord = await commonCLI.select("battery_detail", qry);
        var userData = await commonObj.getUserByID(user_id);

        var assignUser = [{
            'user_name': userData[0]['first_name'],
            'id': user_id
        }];

        if (batteryRecord.length <= 0) {
            var deviceDetails = {
                "user_id": user_id,
                "client_id": client_id,
                "model_id": inverter_model,
                "model_name": model_name,
                "device_type": device_type,
                "company_name": 'Victron',
                "discharge_max_rate": discharge_max_rate,
                "serial_number": imei,
                "full_capacity": battery_capacity,
                "status": "0",
                "location": location,
                "battery_capacity": battery_capacity,
                "installer": installer,
                "technical_note": technical_note,
                "deployment_date": deployment_date,
                "assignedUser": assignUser,
                "macaddress": macaddress
            };
            commonCLI.insert("battery_detail", deviceDetails);
            context.res = {
                status: 200, /* Defaults to 200 */
                body: {
                    status: "success",
                    message: "Device inserted successfully."
                }
            };
            //Add new access token
            if (new_token != '') {
                context.res.body.new_token = new_token;
            }
        } else {
            context.res = {
                status: 200,
                body: {
                    status: "fail",
                    message: "Device already exist with same IMEI or Mac address."
                }
            };
            //Add new access token
            if (new_token != '') {
                context.res.body.new_token = new_token;
            }
        }
    } else {
        context.res = {
            status: 200,
            body: {
                status: "fail",
                message: errors
            }
        };
    }
}
