const dbObj = require('../common/cosmos');
const commonCLI = require('common-cls');
const axios = require('axios');
commonCLI.init(process.env["COSMOS_DB_URL"],process.env["COSMOS_DB_RESOURCE_KEY"],process.env["COSMOS_DB_NAME"],process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {
    //Get data from header
    var device_id = (typeof req.headers.device_id != 'undefined')?req.headers.device_id:'123456';
    //Get post data
    var username   = (typeof req.body.username != 'undefined')?req.body.username.toString():'manoj+1@keyss.in';
    var action     = (typeof req.body.action != 'undefined')?req.body.action.toString():'verify';
    //Global variables
    var errors = [];
    var user_id = '';
   var user_role_id = '2';
    //Validations
    if((device_id == '') || (action == '')){
        errors.push("You are not looking authorized user.");
    }else if(action == 'verify') {
        if(username == ''){
            errors.push("Username field is required.");
        }else if(!commonCLI.ValidateEmail(username)){
            errors.push("Email is not correct");
        }else{
            //var user_details = await commonCLI.select("user","SELECT c.id, c.status FROM user as c WHERE ((c.email='"+username+"') OR (c.phone='"+username+"')) AND c.role_id='"+user_role_id+"'");
            var user_details = await commonCLI.select("user","SELECT c.id, c.status FROM user as c WHERE ((c.email='"+username+"') OR (c.phone='"+username+"')) ");
            
            if(user_details.length <= 0){            
                    errors.push("You are not registered as Client, please contact to Kulr.");
            }else{
                var user_status = '';
                user_details.forEach(user => {
                    user_id = user.id;
                    user_status = user.status;
                });
                if(user_status != 'active'){                   
                    errors.push("Your account is not active, please contact to Kulr.");
                }
            }
        }     
    }
    if((errors.length <= 0) && (action == 'verify')){
        //let userData = await commonCLI.select("user","SELECT c.id, c.status FROM user as c WHERE ((c.email='"+username+"') OR (c.phone='"+username+"')) AND c.role_id='"+user_role_id+"'");  
        let userData = await commonCLI.select("user","SELECT c.id, c.status, c.role_id FROM user as c WHERE ((c.email='"+username+"') OR (c.phone='"+username+"')) ");  
        
        
        
        if(userData[0]['role_id'] == '3'){
            context.res = {
                status: 200,
                body: {
                    status:"fail",
                    message:["You are not allow to reset password, please contact to Kulr."]
                }
            };
        } else if(userData.length <= 0){
            context.res = {
                status: 200,
               body: {
                   status:"fail",
                   message:["You are not registered as client on Kulr."]
               }
           };

        } else {
                //Get required information
                    var userid='';
                    userData.forEach(user => {
                        userid = user.id;
                    });              
                     ///send userid to app as response
                     //Send verification code to user email
                     var verification_code = commonCLI.generateAccessToken(12);
                     var jsonData = {
                         email: username,
                         content: "You password reset confirmation code "+verification_code+" -Kulr",
                         subject: "Password reset confirmation code from Kulr"
                     };
                    //Send email
                     (async function(data) {
                         try {
                             const email_res = await axios.post(process.env["LOGIC_APP_URL"], jsonData);
                             const newItem = {
                                 password_verification_code: verification_code
                             }; 
                             await commonCLI.update({containername:'user',partitionkey:'id',whereclouse:" WHERE c.id='"+userid+"'",newitem:newItem});
                         
                         } catch (error) {
                             console.log('Error:'+error);                        
                         }
                     })(jsonData);
                     //Send response to server
                    context.res = {
                        status: 200,
                       body: {
                           status:"success",
                           message:{"userid":userid}
                       }
                   };
                
                }
    }else if((errors.length <= 0) && (action == 'reset')){
        //Get post data
        var password = (typeof req.body.password != 'undefined')?req.body.password.toString():'';
        var user_id  = (typeof req.body.userid != 'undefined')?req.body.userid.toString():'';
        var verification_code  = (typeof req.body.verification_code != 'undefined')?req.body.verification_code.toString():'';

        if((password != '') && (user_id != '') && (verification_code != '') && (verification_code.length == 12)){
            //Check for verification code
            var user_details = await commonCLI.select('user',"SELECT c.id, c.password_verification_code FROM user as c WHERE c.id='"+user_id+"' AND c.password_verification_code='"+verification_code+"'");
            

            //Validate new password
            let isPasswordCorrect = commonCLI.checkPasswordStrength(password);            
            if(!isPasswordCorrect){
                context.res = {
                    status: 200,
                    body: {
                        status:"fail",
                        message:["There should be minimum 8 alphanumeric chars including one Uppercase and one Special chars."]
                    }
                };
            }else if(user_details.length > 0){ 
                var encryptPass = await commonCLI.encrypt(password);
                let userUpdateData = {
                                      "containername":"user",
                                      "partitionkey":"id",
                                      "whereclouse":" WHERE c.id='"+user_id+"'",
                                      "newitem":{"password":encryptPass,"password_verification_code":'',"last_changed_password":new Date()},
                                     
                                     };
                let response = commonCLI.update(userUpdateData);                
                //Send response to client
                context.res = {
                                status: 200,
                                body: {
                                    status:"success",
                                    message:["Password updated successfully."]
                                }
                };
            }else{
                context.res = {
                    status: 200,
                    body: {
                        status:"fail",
                        message:["Verification code is not correct."]
                    }
                };
            }
           

        }else{
            context.res = {
                status: 200,
               body: {
                   status:"fail",
                   message:["Required information not provided."]
               }
            };
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