const commonObj = require('../common/cosmos');
const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"],process.env["COSMOS_DB_RESOURCE_KEY"],process.env["COSMOS_DB_NAME"],process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {   
        //Get data from header
       var device_id = (typeof req.headers.device_id != 'undefined')?req.headers.device_id:'';
       var access_token = (typeof req.headers.access_token != 'undefined')?req.headers.access_token:'';
       //Global variables
        var errors = [];
        var authorizedUser;
        var new_token = '';
        //Validations
        if((device_id == '') || (access_token == '')){
                errors.push("You are not looking authorized user.");
        } else {
            var token_data = await commonObj.authenticate(device_id,access_token);
            if(typeof token_data.access_token != 'undefined'){
              new_token = token_data.access_token;
              user_id = token_data.user_id;
            }else if(typeof token_data.user_id != 'undefined'){
              user_id = token_data.user_id;
            }
        } 
        //Authentication check
        if(!user_id && (errors.length <= 0)){
            context.res = {
                status: 200,
            body: {
                status:"fail",
                authentication:0,
                message:"Authentication failed."
            }
        };
        } else if(errors.length <= 0){
        let securityData = await commonCLI.select("setting","SELECT * FROM setting as c WHERE c.id != '' ORDER BY c._ts DESC OFFSET 0 LIMIT 1");
        var dataJson = {};
        if(securityData.length > 0){
            securityData.forEach(data => {
                dataJson = {
                   "complexity":data?.complexity?data.complexity:'',
                   "session_timeout":data?.session_timeout?data.session_timeout:0,
                   "login_attempts":data?.login_attempts?data.login_attempts:0,
                   "two_factor_authentication":data?.two_factor_authentication?data.two_factor_authentication:false,
                   "notification_send_to_user":data?.notification_send_to_user?data.notification_send_to_user:'',
                   "notification_severity_include":data?.notification_severity_include?data.notification_severity_include:'',
                   "notification_filters":data?.notification_filters?data.notification_filters:'',
                   "deployment_notification_subscription":data?.deployment_notification_subscription?data.deployment_notification_subscription:false,
                   "id":data.id
                };
            });
        }
        context.res = {
            status: 200,
           body: {
               status:"success",
               data:dataJson,
               message:"Data fetched successfully."
           }
       };
       //Add new access token
       if(new_token != ''){
         context.res.body.new_token = new_token;
       }
    }else{
        context.res = {
            status: 200,
           body: {
               status:"fail",
               message:errors
           }
       };
    }
    
}