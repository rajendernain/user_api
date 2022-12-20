const commonObj = require('../common/cosmos');
const axios = require('axios');
const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"],process.env["COSMOS_DB_RESOURCE_KEY"],process.env["COSMOS_DB_NAME"],process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {
    //Get data from header
    var device_id    = req?.headers?.device_id?req.headers.device_id:'';
    var access_token = req?.headers?.access_token?req.headers.access_token:'';
    var ip_address   = req?.headers['x-forwarded-for']?req.headers['x-forwarded-for']:'';
    //Get post data
    var username= req?.body?.username?req.body.username.toString():'';
    var email   = req?.body?.email?req.body.email.toString():'';
    var phone   = req?.body?.phone?req.body.phone.toString():'';
    var address = req?.body?.address?req.body.address.toString():'';   
    //Global variables
    var user_id = '';
    var errors = [];
    var new_token = '';
    //Validate device, access token and user id and authenticate device access
    if((device_id == '') || (access_token == '')){
        errors.push("You are not looking authorized user.");
    }
    if(username == ''){
        errors.push("Username is required field.");
    }
    if(email == ''){
        errors.push("Email is required field.");
    }else if(!commonCLI.ValidateEmail(email)){
        errors.push("Email is not correct");
    }else{            
        let userByEmailData = await commonObj.getUserByEmail(email);            
        if(userByEmailData.length > 0){
            errors.push("User already registered with same email address.");
        }
    }
    if(phone == ''){
        errors.push("Phone is required field.");
    } else{            
        let userByPhoneData = await commonObj.getUserByPhone(phone);            
        if(userByPhoneData.length > 0){
            errors.push("User already registered with same phone number.");
        }
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
        let existUserDataByEmail = await commonObj.getUserByEmail(email); ///Get exist user by email address]
        let existUserDataByPhone = await commonObj.getUserByPhone(phone); ///Get exist user by phone

        if((existUserDataByPhone.length > 0) && (existUserDataByEmail.length > 0)){
            errors.push("User already exist with same email and phone.");
        }else if(existUserDataByPhone.length > 0){
            errors.push("User already exist with same phone number.");
        }else if(existUserDataByEmail.length > 0){
            errors.push("User already exist with same email address.");
        }   
        if(errors.length <= 0){
            let user_role_name = 'pilot';
            let clientID = "ca541b62-d1f9-462d-a049-60abb5514eb0";
            var userData = {
                    role_id:"3", //3 Pilot
                    client_id:clientID,
                    first_name:username,
                    last_name:'',
                    phone:phone,
                    email:email,
                    address:address,
                    status:'active',
                    profile_img:'',
                    added_by:user_id,
                    date_added:new Date(),
                    email_notification: false,
                    sms_notification: false,
                    app_notification: false,
                    last_login_date: "",
                    last_changed_password: "",
                    date_start: new Date(),
                    date_end: new Date(),
                    amount_total: 0,
                    ip: ip_address      
                };
            let email_content = "Your Kulr "+user_role_name+" account has been created.";
            
            ///Insert data in database
            await commonObj.addUser(userData);
            //Send email notification to user
            var jsonData = {
                email: email,
                content: email_content,
                subject: "Kulr account created."
        };
        //Send email
            (async function(data) {
                try {
                    const response = await axios.post(process.env["LOGIC_APP_URL"], jsonData);                  
                } catch (error) {
                    console.log('Error:'+error);                        
                }
            })(jsonData);
            ///
            //Return response
            context.res = {
                status: 200, 
                body: {
                    status:"success",
                    message:"User account created successfully."
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

