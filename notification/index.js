const commonObj = require('../common/cosmos');
module.exports = async function (context, req) {
    //Get data from header
    var device_id = (typeof req.headers.device_id != 'undefined') ? req.headers.device_id : '';
    var access_token = (typeof req.headers.access_token != 'undefined') ? req.headers.access_token : '';
    //Get post data
    var action = (typeof req.body.action != 'undefined') ? req.body.action : 'get';
    var limit = (typeof req.body.limit != 'undefined') ? req.body.limit : 5;
    var page_number = (typeof req.body.page != 'undefined') ? req.body.page : 1;
    var notificationStatus = (typeof req.body.notification_status != 'undefined') ? req.body.notification_status : 'show';
    var notificationId = (typeof req.body.notification_id != 'undefined') ? req.body.notification_id : '';
    //Global variables
    var user_id = '';
    var errors = [];
    var authorizedUser;
    var new_token = '';
    //Validations
    if ((device_id == '') || (access_token == '')) {
        errors.push("You are not looking authorized user.");
    } else if (action == '') {
        errors.push("You are not able to perform action at this time.");
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
    } else if (errors.length <= 0) { //Proceed data
        if (action == 'get') {
            var notificationList = [];
            let offset_value = ((limit * page_number) - limit);
            var notificationData = await commonObj.getUserNotification(user_id, offset_value, limit);

            if (notificationData.length > 0) {
                notificationData.forEach(element => {
                    notificationList.push({
                        content: element.content,
                        status: element.status,
                        notification_id: element.id,
                        date_added: element.date_added,
                        send_to: element.send_to,
                        send_by: element.send_by
                    });
                });
            }
            context.res = {
                status: 200, /* Defaults to 200 */
                body: {
                    data: notificationList,
                    total: notificationData.length,
                    status: "success",
                    message: "Data fatched successfully"
                }
            };
            //Add new access token
            if (new_token != '') {
                context.res.body.new_token = new_token;
            }
        } else if (action == 'update') {
            var newItem = {};
            if (notificationStatus != '') {
                newItem = { status: notificationStatus };
                commonObj.updateNotification(notificationId, newItem);
                //Return response
                context.res = {
                    status: 200, /* Defaults to 200 */
                    body: {
                        status: "success",
                        message: "Notification updated successfully."
                    }
                };
                //Add new access token
                if (new_token != '') {
                    context.res.body.new_token = new_token;
                }
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