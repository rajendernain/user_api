const commonObj = require('../common/cosmos');
module.exports = async function (context, req) {
    //Get data from header
    var device_id = (typeof req.headers.device_id != 'undefined')?req.headers.device_id:'';
    var access_token = (typeof req.headers.access_token != 'undefined')?req.headers.access_token:'';
    //Get post data
    var action = (typeof req.body.action != 'undefined')?req.body.action:'help';
    //Global variables
    var errors = [];
    var authorizedUser;
    var new_token = '';
    //Validations
    if(device_id == ''){
        errors.push("You are not looking authorized user.");
    } else if(action == ''){
        errors.push("Required information missing.");
    }else{
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
    } else if(errors.length <= 0){ //Proceed data
        //Get information records
        var information = await commonObj.getHelpContent(action);
        var content = [];
        //start for each loop
        information.forEach(info => {
            content.push({title:info.title,content:info.content});
        });//end for each loop
        ///success response
        context.res = {
            status: 200, /* Defaults to 200 */
            body: {
                data:content,
                status:"success",
                message:"Data fetched successfully"
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