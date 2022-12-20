const commonObj = require('../common/cosmos');
const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"],process.env["COSMOS_DB_RESOURCE_KEY"],process.env["COSMOS_DB_NAME"],process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {
  //Get data from header
  var device_id = req?.headers?.device_id?req.headers.device_id:'';
  var access_token = req?.headers?.access_token?req.headers.access_token:'';
  //Get post data
  var phone = req?.body?.phone?req.body.phone:'';
  var email = req?.body?.email?req.body.email:'';
  var blockUserID = req?.body?.blockuserid?req.body.blockuserid:'';
  var userStatus = req?.body?.userstatus?req.body.userstatus:'';
  var first_name = req?.body?.firstname?req.body.firstname:'';
  var address = req?.body?.address?req.body.address:'';
  var lastname = req?.body?.lastname?req.body.lastname:'';
  var user_id = req?.body?.user_id?req.body.user_id:'';
  var appearance = req?.body?.appearance?req.body.appearance:'';
  var action = req?.body?.action?req.body.action:'';
   //Global variables
   var errors = [];
   var authorizedUser;
   var new_token = '';
  //Validate device, access token and user id and authenticate device access
  if((device_id == '') || (access_token == '')){
      errors.push("You are not looking authorized user.");
  }else {
    var token_data = await commonObj.authenticate(device_id,access_token);
    if(typeof token_data.access_token != 'undefined'){
      new_token = token_data.access_token;
      authorizedUser = token_data.user_id;
    }else if(typeof token_data.user_id != 'undefined'){
      authorizedUser = token_data.user_id;
    }
  }

  
  //Email validation
  if(action != 'single_record_update'){
    if((email == '') && (blockUserID == '')){
        errors.push("Email is required field.");
    }else if(!commonCLI.ValidateEmail(email) && (blockUserID == '')){
        errors.push("Email is not correct");
    }else if(blockUserID == ''){            
        let userByEmailData = await commonObj.getUserByEmail(email,user_id);            
        if(userByEmailData.length > 0){
          let existUserID = '';
          userByEmailData.forEach(existUser => {
            existUserID = existUser.id;
          });
          if((existUserID != user_id)){
            errors.push("User already registered with same email address.");
          }
          
        }
    }
  }

//Authentication check
if(!authorizedUser  && (errors.length <= 0)){
  context.res = {
      status: 200,
     body: {
         status:"fail",
         authentication:0,
         message:"Authentication failed."
     }
 };
} if(errors.length <= 0){
    if((phone != '') || (email != '')){ //Update email and phone
      var newItem = {};
      if((phone != '') && (email != '') || (first_name != '') || (address != '') || (lastname != '')){
        newItem = {phone:phone,email:email,first_name:first_name,address:address,last_name:lastname};
      }else if((phone != '')){
        newItem = {phone:phone};
      }else{
        newItem = {email:email};
      }
      await commonObj.updateUser(user_id,newItem);
      //Return response
      context.res = {
        status: 200, /* Defaults to 200 */
        body: {
            status:"success",
            message:"User updated successfully."
        }
      };
      //Add new access token
      if(new_token != ''){
        context.res.body.new_token = new_token;
      }
    } else if(typeof req.body.email_notification == 'boolean'){
      newItem = {email_notification:req.body.email_notification};
      await commonObj.updateUser(user_id,newItem);
      //Return response
      context.res = {
        status: 200, /* Defaults to 200 */
        body: {
            status:"success",
            message:"User email notification data updated sucessfully."
        }
      };
      //Add new access token
      if(new_token != ''){
        context.res.body.new_token = new_token;
      }
    }else if(typeof req.body.sms_notification == 'boolean'){
      newItem = {sms_notification:req.body.sms_notification};
      await commonObj.updateUser(user_id,newItem);
       //Return response
       context.res = {
            status: 200, /* Defaults to 200 */
            body: {
                status:"success",
                message:"User sms notification data updated sucessfully."
            }
        };      
        //Add new access token
        if(new_token != ''){
          context.res.body.new_token = new_token;
        }
    }else if(typeof req.body.app_notification == 'boolean'){
      newItem = {app_notification:req.body.app_notification};
      await commonObj.updateUser(user_id,newItem);
      //Return response
      context.res = {
          status: 200, /* Defaults to 200 */
          body: {
              status:"success",
              message:"User app notification data updated sucessfully."
          }
      };
      //Add new access token
      if(new_token != ''){
        context.res.body.new_token = new_token;
      }
      
    }else if(userStatus != ''){
      var idArr = blockUserID.split(',');
      newItem = {status:userStatus};
      if(idArr.length > 1){
        for (let i=0; i < idArr.length; i++) { 
          await commonObj.updateUser(idArr[i],newItem);      
        }; 
      }else{
        await commonObj.updateUser(blockUserID,newItem);
      }
      //Return response
      context.res = {
          status: 200, /* Defaults to 200 */
          body: {
              status:"success",
              message:"User updated successfully."
          }
      };
      //Add new access token
      if(new_token != ''){
        context.res.body.new_token = new_token;
      }
      
    }else if(appearance != ''){
      newItem = {appearance:appearance};
      if(user_id != ''){
        await commonObj.updateUser(user_id,newItem);      
      }
      //Return response
      context.res = {
          status: 200, /* Defaults to 200 */
          body: {
              status:"success",
              message:"Theme updated successfully."
          }
      };
      //Add new access token
      if(new_token != ''){
        context.res.body.new_token = new_token;
      }
      
    }else{
      //Return response
      context.res = {
        status: 200, /* Defaults to 200 */
        body: {
            status:"fail",
            message:"Something missing, please try again."
        }
     };
     //Add new access token
     if(new_token != ''){
       context.res.body.new_token = new_token;
     }
    }
 } else {
      context.res = {
        status: 200,
      body: {
          status:"fail",
          message:errors
      }
    };
 }
  
}