const commonObj = require('../common/cosmos');
module.exports = async function (context, req) {
     //Get data from header
     //var device_id = (typeof req.headers.device_id != 'undefined')?req.headers.device_id:process.env["TEMP_DEVICE_ID"];
     //var access_token = (typeof req.headers.access_token != 'undefined')?req.headers.access_token:process.env["TEMP_API_ACCESS_TOKEN"];
      var device_id = req?.headers?.device_id?req.headers.device_id:'123456';
      var access_token = req?.headers?.access_token?req.headers.access_token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiIxMjM0NTYiLCJ1c2VyX2lkIjoiOTkwNjNlNDYtYjE0OS00YjlmLWE0ZjYtZjkzNGExNzc0MzUyIiwiaWF0IjoxNjUyMzMzMzIwLCJleHAiOjE2ODM4OTA5MjB9.Z1Gls32qx5zBGHS-ZkjJBm4KtUxjR5PcIy87viR2KZk';
     //Get post data
    var customer_id = req?.body?.customer_id?req.body.customer_id:'';
    var search = req?.body?.search?req.body.search:'';
    var sort = req?.body?.sort?req.body.sort:'';
    var limit = req?.body?.limit?req.body.limit:5;
    var page_number = req?.body?.page?req.body.page:1;
    var offset = req?.body?.offset?req.body.offset:0;
    //Global variables
    var errors = [];
    var authorizedUser;
    var userId;
    var new_token = '';
    //Validations
    if((device_id == '') || (access_token == '')){
        errors.push("You are not looking authorized user.");
    } else {
        var token_data = await commonObj.authenticate(device_id,access_token);
        if(typeof token_data.access_token != 'undefined'){
          new_token = token_data.access_token;
          userId = token_data.user_id;
        }else if(typeof token_data.user_id != 'undefined'){
            userId = token_data.user_id;
        }
       if(customer_id == ''){
            //Get userid            
            userId = userId;
            
        }
    }
   //Authentication check
   if(!userId && (errors.length <= 0)){
        context.res = {
            status: 200,
            body: {
                status:"fail",
                authentication:0,
                message:"Authentication failed."
            }
        };
    } else if(errors.length <= 0){ //Proceed data  
        let userlogs_data = [];    
        let offset_value = (offset<=0)?((limit*page_number)-limit):offset;
        
       if(customer_id == ''){
        var clientListData = await commonObj.getPilotList(userId,search,'active',sort,offset_value,limit);

        if(clientListData.length > 0){
            //clientListData.forEach(users => {    
            for (let i = 0; i < clientListData.length; i++) {
                let element = clientListData[i];
                let user_id = element.id;                
                var userLog =  await commonObj.getUserLoginLogByID(user_id,'',offset_value,limit);
                var logHistory= [];
                var firstLog = {};
                if(userLog.length > 0){
                    userLog.forEach(user => {  
                        var ip = user.ip_address.split(',');
                        if(Object.keys(firstLog).length <= 0){
                            firstLog={
                                name:element.first_name,
                                action:user.sign_in_status,
                                ip:ip[0],
                                user_id:user.user_id,
                                signin_date:user.signin_date,
                                location:element.address
                            };
                        }else{
                            logHistory.push(
                                {  
                                    name:element.first_name,
                                    action:user.sign_in_status,
                                    ip:ip[0],
                                    user_id:user.user_id,
                                    signin_date:user.signin_date,
                                    location:element.address
                                }
                            );
                        }
                       
                    });                          
                }
                if(Object.keys(firstLog).length > 0){
                    firstLog.log_history=logHistory;
                    userlogs_data.push(firstLog);
                }

            };
        }
       }else{
        var userData = await commonObj.getUserByID(customer_id,search);
        if(userData.length > 0) {   
            let element = userData[0];
            var userLog =  await commonObj.getUserLoginLogByID(customer_id,'',offset_value,limit);
            var logHistory= [];
                var firstLog = {};
                if(userLog.length > 0){
                    userLog.forEach(user => {  
                        var ip = user.ip_address.split(',');
                        userlogs_data.push(
                            {  
                                name:element.first_name,
                                action:user.sign_in_status,
                                ip:ip[0],
                                user_id:user.user_id,
                                signin_date:user.signin_date,
                                location:element.address
                            }
                        );
                      
                    });      
                }       
         
        }

       }
       
        context.res = {
            status: 200, /* Defaults to 200 */
            body: {
                status:"success",
                data:userlogs_data,
                message:"Log data fetched successfully."
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
               data:[],
               status:"fail",
               message:errors
           }
       };
    }
}