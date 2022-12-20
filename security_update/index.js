const commonObj = require('../common/cosmos');
const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"],process.env["COSMOS_DB_RESOURCE_KEY"],process.env["COSMOS_DB_NAME"],process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {   
    //Get data from header
    var device_id = (req?.headers?.device_id)?req.headers.device_id:'';
    var access_token = (req?.headers?.access_token)?req.headers.access_token:'';
    //Get post data
    var setting_id = '';
    var complexity = (req?.body?.complexity)?req.body.complexity:0;
    var session_timeout = (req?.body?.session_timeout)?req.body.session_timeout:0;
    var login_attempts = (req?.body?.login_attempts)?req.body.login_attempts:0;
    var two_factor_authentication = (req?.body?.two_factor_authentication)?req.body.two_factor_authentication:0;
    var notification_send_to_user = (req?.body?.notification_send_to_user)?req.body.notification_send_to_user.toString():'';
    var notification_severity_include = (req?.body?.notification_severity_include)?req.body.notification_severity_include:{};
    var notification_filters = (req?.body?.notification_filters)?req.body.notification_filters:'';
    var deployment_notification_subscription = (req?.body?.deployment_notification_subscription)?req.body.deployment_notification_subscription:0;
    
    //Global variables
    var user_id = '';
    var errors = [];
    var authorizedUser;
    var new_token = '';
    //Validate device, access token and user id and authenticate device access
    if((device_id == '') || (access_token == '')){
        errors.push("You are not looking authorized user.");
    }
    ////Check for authorized user
    
    var token_data = await commonObj.authenticate(device_id,access_token);
    if(typeof token_data.access_token != 'undefined'){
      new_token = token_data.access_token;
      user_id = token_data.user_id;
    }else if(typeof token_data.user_id != 'undefined'){
      user_id = token_data.user_id;
    }
    //Authentication check
    if(!user_id){
        context.res = {
            status: 200,
            body: {
                status:"fail",
                authentication:0,
                message:"Authentication failed."
            }
        };
    } else if(errors.length <= 0){
        //Get exist security data
         var security_data = await commonObj.getSecuritySetting();   
         //get id from data
         setting_id = security_data?.id?security_data?.id:'';      
        //Json object for security settings
        var securityJson = {
            "complexity":complexity,
            "session_timeout":session_timeout,
            "login_attempts":login_attempts,
            "two_factor_authentication":two_factor_authentication,
            "notification_send_to_user":notification_send_to_user,
            "notification_severity_include":notification_severity_include,
            "notification_filters":notification_filters,
            "deployment_notification_subscription":deployment_notification_subscription,
            "updated_by":user_id,
            "date_updated":new Date()
        };
        if(setting_id == ''){
            setting_obj = await commonCLI.insert("setting",securityJson);
            setting_id = (setting_obj?.id)?setting_obj.id:'';
        }else{
            await commonCLI.update({
                "containername":"setting",
                "partitionkey":"id",
                "whereclouse":" WHERE c.id='"+setting_id+"'",
                "newitem":securityJson
            });
        }
        context.res = {
            status: 200, /* Defaults to 200 */
            body: {
                status:"success",
                message:"Data updated successfully."
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