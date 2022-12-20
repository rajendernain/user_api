const commonObj = require('../common/cosmos');
module.exports = async function (context, req) {
    //Get data from header
    var device_id = req?.headers?.device_id?req.headers.device_id:'123456';
    var access_token = req?.headers?.access_token?req.headers.access_token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiIxMjM0NTYiLCJ1c2VyX2lkIjoiOTkwNjNlNDYtYjE0OS00YjlmLWE0ZjYtZjkzNGExNzc0MzUyIiwiaWF0IjoxNjUyMzMzMzIwLCJleHAiOjE2ODM4OTA5MjB9.Z1Gls32qx5zBGHS-ZkjJBm4KtUxjR5PcIy87viR2KZk';
    //Get post data
    var search = req?.body?.search?req.body.search.trim().toLowerCase():'';
    var sort = req?.body?.sort?req.body.sort:'date_desc';
    var limit = req?.body?.limit?req.body.limit:0;
    var page_number = req?.body?.page?req.body.page:1;
    var offset = req?.body?.offset?req.body.offset:0;
    //Global variables
    var user_id = '';
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
    // //Authentication check
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
        let userReturnData = [];
        let offset_value = (offset<=0)?((limit*page_number)-limit):offset;

        //var userList = await commonObj.getPilotList(user_id,search,'active',sort,offset_value,limit); 
        var userList = await commonObj.getPilotList('',search,'active',sort,offset_value,limit);
        if(userList.length > 0){   
            //Get user data from userlist array     
            for (let i = 0; i < userList.length; i++) {
                let numberOfPilot = 0;  
                let deviceAssigned = 0;
                let element = userList[i];

                //var userDevice = await commonObj.getUserBatteryList(element.id,'','',false,0,0);               
                userReturnData.push({
                    id:element.id,
                    first_name: element?.first_name?element.first_name:'',                    
                    last_name: element?.last_name?element.last_name:'',
                    email: element?.email?element.email:'',
                    phone: element?.phone?element.phone:'',
                    status: element?.status?element.status:'',
                    last_changed_password: element?.last_changed_password?element.last_changed_password:'',
                    address: element?.address?element.address:'',
                    profile_img: element?.profile_img?element.profile_img:'',
                    signup_date: element?.date_added?element.date_added:'',
                    last_login_date: element?.last_login_date?element.last_login_date:'',
                    ip: element?.ip?element.ip:'0-0-0-0-0', 
                    failed_login_count: element?.failed_login_count?element.failed_login_count:'0',
                    success_login_count: element?.success_login_count?element.success_login_count:'0',
                    subscription:(element?.subscription_details && element.subscription_details != '')?'premium':'lite',
                    //device_assigned:deviceAssigned,
                    device_assigned:element?.device_assigned?element.device_assigned:0,
                    pilot:numberOfPilot
                });
            }           
            context.res = {
                status: 200, /* Defaults to 200 */
               body: {
                   data:userReturnData,
                   status:"success",
                   message:"Data fetched successfully"
               }
           };
           //Add new access token
           if(new_token != ''){
             context.res.body.new_token = new_token;
           }
        }else{
             //Return response
             context.res = {
                data:[],
                status: 200, /* Defaults to 200 */
               body: {
                   status:"success",
                   message:"No record exist."
               }
           };
           //Add new access token
           if(new_token != ''){
             context.res.body.new_token = new_token;
           }
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