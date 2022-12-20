const commonCLI = require('common-cls');
const commonObj = require('../common/cosmos');
const jwt = require('jsonwebtoken');
commonCLI.init(process.env["COSMOS_DB_URL"], process.env["COSMOS_DB_RESOURCE_KEY"], process.env["COSMOS_DB_NAME"], process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {
    var device_id = (typeof req.headers.device_id != 'undefined') ? req.headers.device_id : '';
    var ip_address = (typeof req.headers['x-forwarded-for'] != 'undefined') ? req.headers['x-forwarded-for'] : '';
    //Get post data
    var password = (typeof req.body.password != 'undefined') ? req.body.password.toString() : '';
    var username = (typeof req.body.username != 'undefined') ? req.body.username.toString() : '';

    //Globle
    var errors = [];
    var user_id = '';
    var user_role_id = '3';
    //Current date time
    var dateObj = commonCLI.getFormatedDateTime();
    //Get settings    
    var settings = await commonObj.getSecuritySetting();
    var session_timeout = (settings?.session_timeout) ? settings.session_timeout : 0;
    ///Validate request
    if (device_id == '') {
        errors.push("You are not looking authorized user.");
    } else if (password == '') {
        errors.push("Password field is required.");
    } else {
        if ((username == '') && (username.length < 10)) {
            errors.push("Username is not correct.");
        } else if (!commonCLI.ValidateEmail(username)) {
            errors.push("Email is not correct");
        } else {
            var user_details = await commonCLI.select("user", "SELECT c.id, c.status, c.email FROM user as c WHERE c.email='" + username + "' AND c.role_id!='" + user_role_id + "'");
            if (user_details.length <= 0) {
                errors.push("You are not authorized for web access.");
            } else {
                var user_status = '';
                if (user_details.length > 0) {
                    user_id = user_details[0].id;
                    user_status = user_details[0].status;
                }
                if (user_status != 'active') {
                    let loginFaildLog = {
                        sign_in_status: 'fail',
                        ip_address: ip_address,
                        user_id: user_id,
                        reason: "Account is not active",
                        signin_date: dateObj.display_date
                    };
                    await commonCLI.insert("user_login_logs", loginFaildLog);
                    errors.push("Your account is not active, please contact to Kulr.");
                }
            }
        }
    }
    //Process for login
    if (errors.length <= 0) {
        var user_details = await commonCLI.select("user", "SELECT * FROM user as c where (LOWER(c.email) = '" + username.toLowerCase() + "') AND c.role_id!='" + user_role_id + "'");
        var user_permission = await commonCLI.select("user_role", "SELECT * FROM user_role as c WHERE c.role_id = '" + user_details[0]['role_id'] + "' OFFSET 0 LIMIT 1");

        let auth_info = {};
        if (user_details.length > 0) {
            var existPassword = '';
            if (user_details.length > 0) {
                existPassword = (typeof user_details[0].password != 'undefined') ? user_details[0].password : '';
            }

            var isPasswordCorrect = await commonCLI.verify(password, existPassword);
            let userFirstName = '';
            let userLastName = '';
            let profile_img = '';
            let status = '';
            let role_id = 0;
            let subscription = '';
            if (isPasswordCorrect) {

                if (user_details.length > 0) {
                    subscription = (typeof user_details[0].subscription_details != 'undefined' && user_details[0].subscription_details != '') ? user_details[0].subscription_details : false;
                    profile_img = (typeof user_details[0].profile_img != 'undefined') ? user_details[0].profile_img : '';
                    status = user_details[0].status;
                    userFirstName = (typeof user_details[0].first_name != 'undefined') ? user_details[0].first_name : '';
                    userLastName = (typeof user_details[0].last_name != 'undefined') ? user_details[0].last_name : '';
                    role_id = (typeof user_details[0].role_id != 'undefined') ? user_details[0].role_id : '';
                    appearance = (typeof user_details[0].appearance != 'undefined') ? user_details[0].appearance : 'auto';
                };
                //Add last login date
                var newItem = { last_login_date: dateObj.display_date };
                commonCLI.update({
                    "containername": "user",
                    "partitionkey": "id",
                    "whereclouse": " WHERE WHERE c.id = '" + user_id + "' ",
                    "newitem": newItem
                });
                //Generate access token and assign to user
                //Generate token secret require('crypto').randomBytes(64).toString('hex')
                //Generate token
                let token_expiry = (session_timeout > 0) ? session_timeout : "525600"; //in minutes
                // let now = new Date();
                // let token_expiry_obj = (session_timeout > 0)?new Date(now.getFullYear(), now.getMonth()+session_timeout, now.getDate(),now.getHours(),now.getMinutes(),now.getSeconds()):new Date(now.getFullYear+1);      
                // console.log("Line 95");
                // console.log("Session time out:"+session_timeout+" Now:"+now+" Token expiry:"+token_expiry_obj);  
                const access_token = jwt.sign({ device_id: device_id, user_id: user_id }, process.env["ACCESS_TOKEN_SECRET"],
                    {
                        expiresIn: token_expiry + "m", //in minutes
                    });
                //let access_token = commonCLI.generateAccessToken(30);
                auth_info = {
                    device_id: device_id,
                    access_token: access_token,
                    user_id: user_id,
                    role_id: role_id,
                    last_access_date: new Date(),
                    subscription_details: subscription,
                    status: 'active',
                    appearance: appearance,
                    date_added: dateObj.display_date + ' ' + dateObj.time,
                    permission: user_permission[0]['access_permission']
                };
                ///Delete access token if already exist for same device id
                commonCLI.delete({
                    "containername": "user_login_logs",
                    "partitionkey": "device_id",
                    "whereclouse": " WHERE c.device_id='" + device_id + "'"
                });
                //Insert new access token
                var tokenDataJson = auth_info;
                tokenDataJson.status = 'active';
                commonCLI.insert('authentication_details', tokenDataJson);
                ///Add profile image and name in auth info object
                auth_info.profile_img = profile_img;
                auth_info.username = userFirstName + ' ' + userLastName;
                //Add login log
                let loginSuccessLog = {
                    sign_in_status: 'success',
                    ip_address: ip_address,
                    user_id: user_id,
                    signin_date: dateObj.display_date
                };
                commonCLI.insert("user_login_logs", loginSuccessLog);
                //Return response
                context.res = {
                    status: 200, /* Defaults to 200 */
                    body: {
                        data: auth_info,
                        status: "success",
                        message: "Logged in successfully"
                    }
                };
            } else {
                //Add login log
                var login_failed_reason = "Password is not correct.";
                errors.push(login_failed_reason);
                let loginFaildLog = {
                    sign_in_status: 'fail',
                    ip_address: ip_address,
                    user_id: user_id,
                    reason: login_failed_reason,
                    signin_date: dateObj.display_date
                };
                commonCLI.insert("user_login_logs", loginFaildLog);
                //Return response
                context.res = {
                    status: 200, /* Defaults to 200 */
                    body: {
                        status: "fail",
                        message: errors
                    }
                };
            }
        } else {
            //Add login log
            let loginFaildLog = {
                sign_in_status: 'fail',
                ip_address: ip_address,
                user_id: user_id,
                reason: "Either username or password is not correct.",
                signin_date: dateObj.display_date
            };
            commonCLI.insert("user_login_logs", loginFaildLog);
            //Return response
            context.res = {
                status: 200, /* Defaults to 200 */
                body: {
                    status: "fail",
                    message: "Either username or password is not correct."
                }
            };
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