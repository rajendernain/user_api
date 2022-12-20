const commonObj = require('../common/cosmos');
const commonCLI = require('common-cls');
module.exports = async function (context, req) {
    //Get data from header
    var device_id = (typeof req.headers.device_id != 'undefined')?req.headers.device_id:'';
    var access_token = (typeof req.headers.access_token != 'undefined')?req.headers.access_token:'';
    //Get template params
    var action = (typeof req.params.action != 'undefined')?req.params.action:'fields';
    //var action = (typeof req.body.action != 'undefined')?req.body.action:'fields';
    var battery_id = (typeof req.body.battery_id != 'undefined')?req.body.battery_id:'';
    var fieldItem = (typeof req.body.fieldItem != 'undefined')?req.body.fieldItem:{};
    var notification = (typeof req.body.notification != 'undefined')?req.body.notification:'';
    //testing code
    //{"user_id":"3","notification": [{"field_id": "223","field_alias": "pack_state_charge","setting": {"email": true,"cell_phone": true,"app": false}},{"field_id": "224","field_alias": "pack_state_charge","setting": {"email": true,"cell_phone": true,"app": false}},{"field_id": "225","field_alias": "pack_state_charge","setting": {"email": true,"cell_phone": true,"app": false}}]}
    //Global variables
    var user_id = ''; 
    var errors = [];
    var new_token = '';
   
    //Validations
    if((device_id == '') || (access_token == '')){
        errors.push("You are not looking authorized user.");
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
        var notificationList = [];
        if(action == 'fields'){
           // var notificationData = await commonObj.getNotificationSettings();
           var notificationData = await commonCLI.select("battery_data_fields","SELECT * FROM battery_data_fields as c ORDER BY c.sort_order ASC");
           var userNotificationData = await commonCLI.select("battery_field_notification_setting","SELECT * FROM battery_field_notification_setting as c WHERE c.user_id='"+user_id+"'");
           var user_data = await commonCLI.select("user","SELECT * FROM user as c WHERE c.id='"+user_id+"'");                      
           var client_id = (typeof user_data[0]['client_id'] != 'undefined')?user_data[0]['client_id']:'0';
           var notification_data = await commonCLI.select("battery_field_notification_setting","SELECT * FROM battery_field_notification_setting as c WHERE c.user_id='"+client_id+"'");
            if(notificationData.length > 0){  
                    for (let i = 0; i < notificationData.length; i++) {                         
                    let field_list = notificationData[i]; 
                                     
                    var fields_data={
                        field_name:field_list.label,
                        field_alias:field_list.alias,
                        id:field_list.id,
                        email:false,
                        cell_phone:false,
                        app:false
                    }
                    //Check for user notification data
                            if(userNotificationData.length > 0){
                                userNotificationData[0]['settings'].forEach(setting => {
                                    if(field_list.alias == setting['field_alias']){
                                        fields_data.email=setting['email'];
                                        fields_data.cell_phone=setting['cell_phone'];
                                        fields_data.app=setting['app'];                               
                                    }
                                });   
                            } else if(notification_data.length > 0){                                                               
                                notification_data[0]['settings'].forEach(setting => {                                    
                                    if(field_list.alias == setting['field_alias']){
                                        fields_data.email=setting['email'];
                                        fields_data.cell_phone=setting['cell_phone'];
                                        fields_data.app=setting['app'];
                                       
                                    }
                                });   
                            }
                            notificationList.push(fields_data); 
                        }  //end for loop       
                
                             
                }
                    
            context.res = {
                status: 200, /* Defaults to 200 */    
                body: {
                    data:notificationList,
                    total:notificationList.length,
                    status:"success",
                    message:["Notification settings fatched successfully"]
                }
            };
            //Add new access token
            if(new_token != ''){
              context.res.body.new_token = new_token;
            }
        }else if(action == 'add'){
            var exist = await commonCLI.select("battery_field_notification_setting","SELECT * FROM battery_field_notification_setting as c WHERE c.user_id='"+user_id+"'");        
            if(exist.length > 0){
             var res = await commonCLI.update({"containername":"battery_field_notification_setting",
             "partitionkey":"id",
             "whereclouse":" WHERE c.user_id='"+user_id+"'",
             "newitem":{"settings":notification}});    
             if(res > 0){                    
                 context.res = {
                     status: 200,
                     body: {
                         status:"success",
                         message:["Notification setting updated successfully."]
                     }
                 };
                 //Add new access token
                 if(new_token != ''){
                   context.res.body.new_token = new_token;
                 }
             } else {                                     
                 context.res = {
                     status: 200,
                     body: {
                         status:"success",
                         message:["Notification setting not updated successfully."]
                     }
                 };
                 //Add new access token
                 if(new_token != ''){
                   context.res.body.new_token = new_token;
                 }
             }            
             }else{               
                 await commonCLI.insert("battery_field_notification_setting",{"user_id":user_id,"settings":notification});
                 context.res = {
                     status: 200,
                     body: {
                         status:"success",
                         message:["Notification setting inserted successfully."]
                     }
                 };
                 //Add new access token
                 if(new_token != ''){
                   context.res.body.new_token = new_token;
                 }
             }
        }else if(action == 'device_setting'){
            //await commonObj.updateBattery(battery_id,fieldItem);
            var res = await commonCLI.update({"containername":"battery_detail",
            "partitionkey":"id",
            "whereclouse":" WHERE c.id='"+battery_id+"'",
            "newitem":fieldItem});              
            if(res > 0){                    
                context.res = {
                    status: 200,
                    body: {
                        status:"success",
                        message:["Device model settings update successfully."]
                    }
                };
                //Add new access token
                if(new_token != ''){
                  context.res.body.new_token = new_token;
                }
            } else {                                     
                context.res = {
                    status: 200,
                    body: {
                        status:"fail",
                        message:["Device model settings not updated successfully."]
                    }
                };
                //Add new access token
                if(new_token != ''){
                  context.res.body.new_token = new_token;
                }
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