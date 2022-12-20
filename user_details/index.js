const commonObj = require('../common/cosmos');
const commonCLI = require('common-cls');
module.exports = async function (context, req) { 
  //Get data from header
  var device_id = req?.headers?.device_id?req.headers.device_id:'';
  var access_token = req?.headers?.access_token?req.headers.access_token:'';  
  //Get post data from request body
  var customer_id = req?.body?.user_id?req.body.user_id:'';  
  //Set global variables for error and authorization handling
  var user_id = '';
  var errors = [];
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
    if(customer_id == ''){
      customer_id = user_id;
    }
    var userData = await commonObj.getUserByID(customer_id);
    var success_login_log_data = await commonObj.getUserLoginLogByID(customer_id,'success',OFFSET=0,limit=1);
    var fail_login_log_data = await commonObj.getUserLoginLogByID(customer_id,'fail',OFFSET=0,limit=1);
    var fail_counter = await commonObj.getUserLoginLogByID(customer_id,'fail');
    var totalBatteries = await commonObj.getTotalBattries(customer_id);
    

    var user = {};
    if(userData.length > 0){
      userData.forEach(element => {
        let date = commonCLI.getUserDateFormat(element.date_added);
        let first_login_date = commonCLI.getUserDateFormat(element.last_login_date);
        let last_changed_password = commonCLI.getUserDateFormat(element.last_changed_password);

          user={
              id:element.id,
              role_id:element.role_id,
              client_id:element.client_id,
              name:element.first_name,
              email:element.email,
              phone:element.phone,
              address:element.address,
              date_added:date.display_date,
              last_changed_password:last_changed_password.display_date,
              last_login_date:first_login_date.display_date,
              sms_notification:element.sms_notification?element.sms_notification:false,
              email_notification:element.email_notification?element.email_notification:false,
              app_notification:element.app_notification?element.app_notification:false
          };
      });

           
    ///Total device assigned
    user.total_device_assigned = 0;    
    if(totalBatteries.length > 0){
      totalBatteries.forEach(records=> {
        user.total_device_assigned = records.total;
      });
    }

      let success_ip_address = '';
      let success_sign_in_status='';
      let success_user_id='';
      let success_signin_date='';
      let success_id='';
      let fail_ip_address='';
      let fail_sign_in_status='';
      let fail_user_id='';
      let fail_signin_date='';
      let fail_id='';
      //Get success login log data
      if(success_login_log_data.length > 0){
          let logs = success_login_log_data[0];
          let signin_date = commonCLI.getUserDateFormat(logs.signin_date);

              success_sign_in_status=logs.sign_in_status?logs.sign_in_status:'',
              success_ip_address=logs.ip_address?logs.ip_address:'',
              success_user_id=logs.user_id?logs.user_id:logs.user_id,
              success_signin_date=signin_date.display_date,
              success_id=logs.id?logs.id:logs.id
       
        //Assign success login
        user.success_login={
          ip_address:success_ip_address,
          sign_in_status:success_sign_in_status,
          user_id:success_user_id,
          signin_date:success_signin_date,
          id:success_id
        };
      }else{
        user.success_login = {};
      }
      //Get failed login log data  
      if(fail_login_log_data.length > 0){ 
        let logs = fail_login_log_data[0];

        let signin_date = commonCLI.getUserDateFormat(logs.signin_date);

        fail_sign_in_status=logs.sign_in_status?logs.sign_in_status:'',
        fail_ip_address=logs.ip_address?logs.ip_address:'',
        fail_user_id=logs.user_id?logs.user_id:logs.user_id,
        fail_signin_date=signin_date.display_date,
        fail_id=logs.id?logs.id:logs.id
      
        user.failed_login = {
          ip_address:fail_ip_address,
          sign_in_status:fail_sign_in_status,
          user_id:fail_user_id,
          signin_date:fail_signin_date,
          id:fail_id,
          total_attempt:fail_counter.length?fail_counter.length:0
        };
      } else {
        user.failed_login = {};
      }
    }     
    context.res = {      
      status: 200, 
      body: {
          data:user,
          status:"success",
          message:"Record fetched successfully."
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