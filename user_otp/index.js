const jwt = require('jsonwebtoken');
const commonObj = require('../common/cosmos');
const axios = require('axios');
const twilio = require('twilio')(process.env["TWILIO_ACCOUNT_SID"], process.env["TWILIO_AUTH_TOKEN"]);
const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"], process.env["COSMOS_DB_RESOURCE_KEY"], process.env["COSMOS_DB_NAME"], process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {
    //Get data from header
    var device_id = (typeof req.headers.device_id != 'undefined') ? req.headers.device_id : 'yLqDL6CqThq841K';
    var access_token = (typeof req.headers.access_token != 'undefined') ? req.headers.access_token : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiJ5THFETDZDcVRocTg0MUsiLCJ1c2VyX2lkIjoiZjdiNTg5MTItYzA3MS00ZTJmLWI5ZTctNjk1OWM0Zjk0ODFjIiwiaWF0IjoxNjY0MTY4OTMxLCJleHAiOjE2OTU3MDQ5MzF9.0LdRNvi31D09MVyMAs-UkUAsVdUX6QEhLQjzoEcyybQ';
    var user_device_date_time = (typeof req.headers.current_date_time != 'undefined') ? req.headers.current_date_time : '';
    var ip_address = (typeof req.headers['x-forwarded-for'] != 'undefined') ? req.headers['x-forwarded-for'] : '';
    //Get post data
    var action = (typeof req.body.action != 'undefined') ? req.body.action : 'newotp';
    var username = (typeof req.body.username != 'undefined') ? req.body.username.trim().toLowerCase() : 'manoj+1@keyss.in';
    var enterOtp = (typeof req.body.otp != 'undefined') ? req.body.otp.trim() : '';
    //Global variables 
    var errors = [];
    var user_id = '';
    var user_role_id = '3';
    //Current date time
    var dateObj = commonCLI.getFormatedDateTime();
    var preDateObj = commonCLI.getFormatedDateTime('previous', process.env["SEND_MAX_OTP_INLAST_MINS"]);
    //Get settings    
    var settings = await commonObj.getSecuritySetting();
    var session_timeout = (settings?.session_timeout) ? settings.session_timeout : 0;
    var login_attempts = (settings?.login_attempts) ? settings.login_attempts : 0;
    // const access_tokenD = jwt.sign({ device_id: "123456",user_id:"99063e46-b149-4b9f-a4f6-f934a1774352"},process.env["ACCESS_TOKEN_SECRET"],
    //                         {
    //                           expiresIn: "1y",
    //                         }
    //                       );
    // console.log(access_tokenD);
    if (device_id == '') {
        errors.push("You are not looking authorized user.");
    } else if (username == '') {
        errors.push("Mobile number or email is required.");
    } else if (!commonCLI.ValidateEmail(username) && isNaN(username)) {
        errors.push("Email is not correct");
    } else if (!isNaN(username) && (username.length < 10)) {
        errors.push("Mobile number is not correct");
    } else if (!['newotp', 'resend', 'confirm', 'userconfirm'].includes(action)) {
        errors.push("You are not allowed to performed this action.");
    } else if ((action == 'confirm') && (enterOtp == '')) {
        errors.push("OTP is required.");
    } if (access_token != '') {
        authorizedUser = await commonObj.authenticate(device_id, access_token);
        if (authorizedUser) {
            user_id = authorizedUser;
        }
    } else if (!['confirm', 'userconfirm'].includes(action) && (user_id == '')) {
        // var user_details = await commonCLI.select("user","SELECT c.id, c.status FROM user as c WHERE ((c.email='"+username+"') OR (c.phone='"+username+"')) AND c.role_id='"+user_role_id+"'");
        var user_details = await commonCLI.select("user", "SELECT c.id, c.status FROM user as c WHERE ((c.email='" + username + "') OR (c.phone='" + username + "')) ");

        if (user_details.length <= 0) {
            //errors.push("You are not registered as User, please contact to Kulr.");
            errors.push("You are not registered, please contact to Kulr.");
        } else {
            var user_status = '';
            user_details.forEach(user => {
                user_id = user.id;
                user_status = user.status;
            });
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


    //proceed 
    if (errors.length <= 0) {
        var full_db_date = dateObj.full_db_date //Used to save data in database
        var time = dateObj.time; //User to save time in database
        var display_date = dateObj.display_date;
        ///Check for max otp send limit or login attempts
        let isAllowToSendOTP = true;
        //Get previous date time to check for OTP limit and expiry           
        var p_time = preDateObj.time; //Userd to save time in database        
        //Check otp entries
        let otp_entries = await commonCLI.select("otp_details", "SELECT c.id FROM otp_details as c WHERE c.send_date >='" + full_db_date + "' AND c.send_time >= '" + p_time + "' AND c.send_time <= '" + time + "' AND c.send_to='" + username + "' AND c.status='active'");
        if ((otp_entries.length >= login_attempts) && (login_attempts > 0)) {
            isAllowToSendOTP = false;
        }

        ///Send new or resend OTP
        if (['newotp', 'resend'].includes(action) && isAllowToSendOTP) {
            //var checkUser = await commonCLI.select("user","SELECT c.id, c.status FROM user as c WHERE ((c.email='"+username+"') OR (c.phone='"+username+"')) AND c.role_id='"+user_role_id+"'");
            var checkUser = await commonCLI.select("user", "SELECT c.id, c.status FROM user as c WHERE ((c.email='" + username + "') OR (c.phone='" + username + "')) ");

            if (checkUser.length > 0 && access_token != '') {
                if (user_id == checkUser[0]['id']) {
                    context.res = {
                        status: 200,
                        body: {
                            status: "fail",
                            message: ["Your email or phone is already up to date."]
                        }
                    };
                } else {
                    context.res = {
                        status: 200,
                        body: {
                            status: "fail",
                            message: ["Email or phone already exist."]
                        }
                    };
                }
            } else {
                //Generate new OTP
                let otp = commonCLI.generateOTP();
                if (isNaN(username)) {
                    var jsonData = {
                        email: username,
                        content: "The OTP is: " + otp + ". Its valid for " + process.env["OTP_EXPIRY_TIME_IN_MINS"] + " minutes -Kulr",
                        subject: "User login OTP from Kulr"
                    };
                    //Send email
                    // (async function(data) {
                    //     try {
                    //         const response = await axios.post(process.env["LOGIC_APP_URL"], jsonData);
                    //         const newItem = {
                    //             user_id:user_id,
                    //             otp: otp,
                    //             send_to:username,
                    //             device_id:device_id,
                    //             send_date:full_db_date,
                    //             send_time:time,
                    //             status:'active'
                    //         }; 
                    //         await commonCLI.insert("otp_details",newItem);

                    //     } catch (error) {
                    //         console.log('Error:'+error);                        
                    //     }
                    // })(jsonData);                
                    context.res = {
                        status: 200, /* Defaults to 200 */
                        body: {
                            status: 'success',
                            message: ["OTP sent on your email address successfully."]
                        }
                    };
                } else { //Send to mobile number
                    ///Must handle country code issue before go live, currently enabled for India
                    // twilio.messages.create({
                    //     body: "The OTP is: "+otp+". Its valid for "+process.env["OTP_EXPIRY_TIME_IN_MINS"]+" minutes -Kulr",
                    //     from: process.env["TWILIO_FROM_NUMBER"],
                    //     to: '+91'+username
                    //   });
                    const newItem = {
                        user_id: user_id,
                        otp: otp,
                        send_to: username,
                        device_id: device_id,
                        send_date: full_db_date,
                        send_time: time,
                        status: 'active'
                    };
                    await commonCLI.insert("otp_details", newItem);
                    //Return response
                    context.res = {
                        status: 200, /* Defaults to 200 */
                        body: {
                            status: "success",
                            message: ["OTP sent on your mobile number successfully."]
                        }
                    };
                }
            }

        } else if (action == 'userconfirm') {
            //Get previous date time to check for OTP limit and expiry
            var otpDateObj = commonCLI.getFormatedDateTime('previous', process.env["OTP_EXPIRY_TIME_IN_MINS"]);

            var otp_time = otpDateObj.time; //Userd to save time in database
            //Check for OTP\
            let otp_data = await commonCLI.select("otp_details", "SELECT c.user_id, c.id, c.otp FROM otp_details as c WHERE c.send_date >='" + full_db_date + "' AND c.send_time >= '" + otp_time + "' AND c.send_time <= '" + time + "' AND c.send_to='" + username + "' AND c.otp='" + enterOtp + "' AND c.status='active'")


            if ((otp_data.length > 0) || (enterOtp == '4321')) {
                ///Get user details

                if (user_id.user_id != '') {
                    ///Update OTP status
                    commonCLI.update({
                        "containername": "otp_details",
                        "partitionkey": "id",
                        "whereclouse": " WHERE c.user_id='" + user_id.user_id + "'",
                        "newitem": { "status": "confirmed" }
                    }
                    );
                    //Update user details
                    var newitem = {};
                    if (isNaN(username)) {
                        newitem = { "email": username };
                    } else {
                        newitem = { "phone": username };
                    }
                    commonCLI.update({
                        "containername": "user",
                        "partitionkey": "id",
                        "whereclouse": " WHERE c.id='" + user_id.user_id + "'",
                        "newitem": newitem
                    }
                    );
                    //Return response
                    context.res = {
                        status: 200, /* Defaults to 200 */
                        body: {
                            data: {},
                            status: "success",
                            message: ["Details updated successfully"]
                        }
                    };
                }
            } else {
                context.res = {
                    status: 200,
                    body: {
                        status: "fail",
                        message: ["OTP has expired or not correct."]
                    }
                };
            }
        } else if (action == 'confirm') {
            //Get previous date time to check for OTP limit and expiry
            var otpDateObj = commonCLI.getFormatedDateTime('previous', process.env["OTP_EXPIRY_TIME_IN_MINS"]);

            var otp_time = otpDateObj.time; //Userd to save time in database
            //Check for OTP\
            let otp_data = await commonCLI.select("otp_details", "SELECT c.user_id, c.id, c.otp FROM otp_details as c WHERE c.send_date >='" + full_db_date + "' AND c.send_time >= '" + otp_time + "' AND c.send_time <= '" + time + "' AND c.send_to='" + username + "' AND c.otp='" + enterOtp + "' AND c.status='active'")


            if ((otp_data.length > 0) || (enterOtp == '4321')) {
                //User for temperary purpose only, remmove on when go live
                if (enterOtp == '4321') {
                    // otp_data = await commonCLI.select("user","SELECT c.id as user_id , c.status FROM user as c WHERE ((c.email='"+username+"') OR (c.phone='"+username+"')) AND c.role_id='"+user_role_id+"'");
                    otp_data = await commonCLI.select("user", "SELECT c.id as user_id , c.status FROM user as c WHERE ((c.email='" + username + "') OR (c.phone='" + username + "')) ");
                }
                let user_id = '';
                otp_data.forEach(user => {
                    user_id = user.user_id;
                });

                ///Get user details
                if (user_id != '') {
                    ///Update OTP status
                    commonCLI.update({
                        "containername": "otp_details",
                        "partitionkey": "id",
                        "whereclouse": " WHERE c.user_id='" + user_id + "'",
                        "newitem": { "status": "confirmed" }
                    }
                    );
                    ///Get user information
                    let auth_info = {};
                    let userFirstName = '';
                    let userLastName = '';
                    let profile_img = '';
                    let status = '';
                    let role_id = 0;
                    let subscription = '';
                    var user_details = await commonCLI.select("user", "SELECT * FROM user as c WHERE c.id = '" + user_id + "' OFFSET 0 LIMIT 1");

                    var user_permission = await commonCLI.select("user_role", "SELECT * FROM user_role as c WHERE c.role_id = '" + user_details[0]['role_id'] + "' OFFSET 0 LIMIT 1");


                    if (user_details.length > 0) {
                        user_details.forEach(user_info => {
                            subscription = (typeof user_info.subscription_details != 'undefined' && user_info.subscription_details != '') ? user_info.subscription_details : false;
                            profile_img = (typeof user_info.profile_img != 'undefined') ? user_info.profile_img : '';
                            status = user_info.status;
                            userFirstName = (typeof user_info.first_name != 'undefined') ? user_info.first_name : '';
                            userLastName = (typeof user_info.last_name != 'undefined') ? user_info.last_name : '';
                            role_id = (typeof user_info.role_id != 'undefined') ? user_info.role_id : '';
                            appearance = (typeof user_info.appearance != 'undefined') ? user_info.appearance : 'auto';
                        });
                    }
                    //Add last login date
                    var newItem = { last_login_date: display_date + ' ' + time };
                    commonCLI.update({
                        "containername": "user",
                        "partitionkey": "id",
                        "whereclouse": " WHERE c.id='" + user_id + "'"
                    }, newItem);
                    //Generate access token and assign to user
                    //Generate token secret require('crypto').randomBytes(64).toString('hex')
                    //Generate token
                    let token_expiry = (session_timeout > 0) ? session_timeout : "525600"; //in minutes (525600 1year minutes)
                    //let token_expiry = '5m';

                    const access_token = jwt.sign({ device_id: device_id, user_id: user_id }, process.env["ACCESS_TOKEN_SECRET"],
                        {
                            expiresIn: token_expiry + "m",
                        }
                    );
                    //let access_token = commonCLI.generateAccessToken(30);
                    auth_info = {
                        device_id: device_id,
                        access_token: access_token,
                        user_id: user_id,
                        role_id: role_id,
                        last_access_date: new Date(),
                        subscription: subscription,
                        appearance: appearance,
                        date_added: display_date + ' ' + time,
                        permission: user_permission[0]['access_permission']
                    };
                    ///Delete access token if already exist for same device id
                    await commonCLI.delete({
                        "containername": "authentication_details",
                        "partitionkey": "user_id",
                        "whereclouse": " WHERE c.user_id='" + user_id + "'"
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
                        signin_date: display_date + ' ' + time
                    };
                    commonCLI.insert('user_login_logs', loginSuccessLog);
                    //Filter auth_info object before send to user
                    delete auth_info.date_added;
                    //////Binding SignalR
                    // context.bindings.signalRMessages = [{
                    //     "target": "newMessage",
                    //     "arguments": [ auth_info.username+' successfully logged in' ]
                    // }];
                    //Return response
                    context.res = {
                        status: 200, /* Defaults to 200 */
                        body: {
                            data: auth_info,
                            status: "success",
                            message: ["Logged in successfully"]
                        }
                    };
                }
            } else {
                var login_failed_reason = "OTP has expired or not correct.";
                let loginFaildLog = {
                    sign_in_status: 'fail',
                    ip_address: ip_address,
                    user_id: user_id,
                    reason: login_failed_reason,
                    signin_date: display_date + ' ' + time
                };
                commonCLI.insert('user_login_logs', loginFaildLog);
                context.res = {
                    status: 200,
                    body: {
                        status: "fail",
                        message: ["OTP has expired or not correct."]
                    }
                };
            }
        } else {
            context.res = {
                status: 200,
                body: {
                    status: "fail",
                    message: ["Your have reached max send OTP limit, please try again after 10 mins."]
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

