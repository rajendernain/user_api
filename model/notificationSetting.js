const commonObj = require('../common/cosmos');
const commonCLI = require('common-cls');
const axios = require('axios');
const twilio = require('twilio')(process.env["TWILIO_ACCOUNT_SID"], process.env["TWILIO_AUTH_TOKEN"]);
commonCLI.init(process.env["COSMOS_DB_URL"],process.env["COSMOS_DB_RESOURCE_KEY"],process.env["COSMOS_DB_NAME"],process.env["ENCRYPTION_ALGORITHM"]);
class NotificationModel { 
  /* 
  * Send notification to user according to user setting and device field settings
  *
  * @parms data contain json 
  */
  async sendUserNotification(data){    
     let isEmailNotification = false;
     let isPhoneNotification = false;
     let isAppNotification   = false;
     let device_id = data?.device_id?data.device_id:'';
     let log_id = data?.log_id?data.log_id:'';
     let criticalEvent = data?.critical_event?data.critical_event:0;
     let accessHeat = data?.access_heat?data.access_heat:0;
     let accessCold = data?.access_cold?data.access_cold:0;
     let underVoltage = data?.under_voltage?data.under_voltage:0;
     let overVoltage = data?.over_voltage?data.over_voltage:0;
     let field_alias = (data?.field?.alias)?data.field.alias:0;
    // console.log("Line 24");
    // console.log(data);

    let notificationTime = 30;

     if(data.notification_setting.length > 0){
      //Get setting data
      data.notification_setting.forEach(notification_setting => {
          if(field_alias == notification_setting.field_alias){
            isEmailNotification = notification_setting.email;
            isPhoneNotification = notification_setting.cell_phone;
            isAppNotification   = notification_setting.app;
          }
      }); //end foreach
      ///Check for notification receiver 


      let lastEventsArr = await commonCLI.select("battery_events","SELECT * FROM battery_events as c WHERE c.field_alias='"+field_alias+"' AND c.device_id='"+device_id+"' ORDER BY c._ts DESC OFFSET 0 LIMIT 1");
      let lastEventFieldValue = 0;
      let lastEventTime = '';
      if(lastEventsArr.length > 0){
        lastEventFieldValue = lastEventsArr[0]['field_value'];
        lastEventTime = lastEventsArr[0]['timestamp'];
      }

      if(isEmailNotification || isPhoneNotification || isAppNotification){

        //Check for critical event
        if((data.log_value >= data.criticalFrom) && (data.log_value <= data.criticalTo)){

          /****************************Event counter***********************************/       
          
          //Sort fields for critical events
          let criticalEventJson = {}

          if(field_alias == 'highest_battery_temp'){ //Access heat
            criticalEventJson = {
              "critical_event":(criticalEvent+1),
              "access_heat":(accessHeat+1)
            }
          } else if(field_alias == 'lowest_battery_temp'){ //Access cold
            criticalEventJson = {
              "critical_event":(criticalEvent+1),
              "access_cold":(accessCold+1)
            }
          } else if(field_alias == 'lowest_cell_voltage'){ //Under voltage
            criticalEventJson = {
              "critical_event":(criticalEvent+1),
              "under_voltage":(underVoltage+1)
            }
          } else if(field_alias == 'highest_cell_voltage'){ //Over voltage
            criticalEventJson = {
              "critical_event":(criticalEvent+1),
              "over_voltage":(overVoltage+1)
            }
          }else{
            criticalEventJson = {
              "critical_event":(criticalEvent+1)
            }
          }

          //Update battery details container
          var abc = await commonCLI.update({
            "containername":"battery_detail",
            "partitionkey":"id",
            "whereclouse":"WHERE c.id='"+device_id+"'",
            "newitem":criticalEventJson
          });
          
          /****************************Send Email notification***********************************/
          if(isEmailNotification){
            //Send email
            let emailContent = (data?.field?.email_critical_content)?data.field.email_critical_content:'';  
            if(data.field.alias == 'bms_life'){
              emailContent = data.field.email_critical_content.replace('%value%', data.generated_log_val.bms_life);
            }
            if(data.field.alias == 'lowest_cell_voltage'){
              emailContent = data.field.email_critical_content.replace('%value%', data.generated_log_val.lowest_cell_voltage);
            }
            if(data.field.alias == 'highest_cell_voltage'){
              emailContent = data.field.email_critical_content.replace('%value%', data.generated_log_val.highest_cell_voltage);
            }
            if(data.field.alias == 'highest_battery_temp'){
              emailContent = data.field.email_critical_content.replace('%value%', data.generated_log_val.highest_battery_temp);
            }
            if(data.field.alias == 'lowest_battery_temp'){
              emailContent = data.field.email_critical_content.replace('%value%', data.generated_log_val.lowest_battery_temp);
            }
            if(data.field.alias == 'lowest_battery_temp'){
              emailContent = data.field.email_critical_content.replace('%value%', data.generated_log_val.lowest_battery_temp);
            }
            if(data.field.alias == 'average_voltage'){
              emailContent = data.field.email_critical_content.replace('%value%', data.generated_log_val.average_voltage);
            }
            // && lastEventFieldValue!=data.generated_log_val.data.field.alias
            if(emailContent != '' && lastEventFieldValue!=data.generated_log_val[data.field.alias]){
              var emailJson = {
                  email: data.user_data.email,
                  //email: 'rajender@keyss.in',
                  content: emailContent,
                  subject: "Notification from Kulr"
              };    
              await this.sendNotificationUpdate('email', emailJson);
            } //end email content if 
          }   //end isEmailNotification if

          /****************************Send SMS notification***********************************/
          if(isPhoneNotification){
            //Get SMS content
            let smsContent = (data?.field?.sms_critical_content)?data.field.sms_critical_content:'';

            if(data.field.alias == 'bms_life'){
              smsContent = data.field.sms_critical_content.replace('%value%', data.generated_log_val.bms_life);
            }
            if(data.field.alias == 'lowest_cell_voltage'){
              smsContent = data.field.sms_critical_content.replace('%value%', data.generated_log_val.lowest_cell_voltage);
            }
            if(data.field.alias == 'highest_cell_voltage'){
              smsContent = data.field.sms_critical_content.replace('%value%', data.generated_log_val.highest_cell_voltage);
            }
            if(data.field.alias == 'highest_battery_temp'){
              smsContent = data.field.sms_critical_content.replace('%value%', data.generated_log_val.highest_battery_temp);
            }
            if(data.field.alias == 'lowest_battery_temp'){
              smsContent = data.field.sms_critical_content.replace('%value%', data.generated_log_val.lowest_battery_temp);
            }
            if(data.field.alias == 'lowest_battery_temp'){
              smsContent = data.field.sms_critical_content.replace('%value%', data.generated_log_val.lowest_battery_temp);
            }
            if(data.field.alias == 'average_voltage'){
              smsContent = data.field.sms_critical_content.replace('%value%', data.generated_log_val.average_voltage);
            }
            if(smsContent != ''){
              //Send to mobile number
              let smsJson = {
                  body: smsContent,
                  from: process.env["TWILIO_FROM_NUMBER"],
                  to: '+91'+data.user_data.phone
                };
              await this.sendNotificationUpdate('app', smsJson);
            }
          }//end isPhoneNotification if
          /****************************send APP notification***********************************/
          var appContent = '';
          if(isAppNotification){
            appContent = (data?.field?.app_critical_content)?data.field.app_critical_content:'';

            if(data.field.alias == 'bms_life'){
              appContent = data.field.app_critical_content.replace('%value%', data.generated_log_val.bms_life);
            }
            if(data.field.alias == 'lowest_cell_voltage'){
              appContent = data.field.app_critical_content.replace('%value%', data.generated_log_val.lowest_cell_voltage);
            }
            if(data.field.alias == 'highest_cell_voltage'){
              appContent = data.field.app_critical_content.replace('%value%', data.generated_log_val.highest_cell_voltage);
            }
            if(data.field.alias == 'highest_battery_temp'){
              appContent = data.field.app_critical_content.replace('%value%', data.generated_log_val.highest_battery_temp);
            }
            if(data.field.alias == 'lowest_battery_temp'){
              appContent = data.field.app_critical_content.replace('%value%', data.generated_log_val.lowest_battery_temp);
            }
            if(data.field.alias == 'lowest_battery_temp'){
              appContent = data.field.app_critical_content.replace('%value%', data.generated_log_val.lowest_battery_temp);
            }
            if(data.field.alias == 'average_voltage'){
              appContent = data.field.app_critical_content.replace('%value%', data.generated_log_val.average_voltage);
            }

            if(appContent != ''){
                 //Insert data in notification container
                 var notificationDetails = {
                  "content":appContent,
                  "send_by":data.user_data.client_id,
                  "send_to":data.user_data.user_id,
                  "status":'show',
                  "type":'push',
                  "date_added":new Date(),
                  "generate_for":data.field.alias
              };
  

              data.context.bindings.signalRMessages = [{
                "target": "notification",
                "arguments": [{
                                "title":"Critical",
                                "message":appContent,
                                "userid":data.user_data.user_id,
                                "clientid":data.user_data.client_id
                             }]
              }];

              
            
            //   console.log('???????criticalllllllll?????????????');
            //   console.log({
            //     "title":"Critical",
            //     "message":appContent,
            //     "userid":data.user_data.user_id,
            //     "clientid":data.user_data.client_id
            //  });

              await this.sendNotificationUpdate('app', notificationDetails);
              //await commonCLI.insert("notifications",notificationDetails);
            }
          }//end isAppNotification if
          /****************************  Insert event log   ***********************************/
          let dateObj = commonCLI.getFormatedDateTime();
          let timestamp = dateObj['full_db_date']+' '+dateObj['time'];

          let eventLogData = {
            "device_id":device_id,
            "serial_no":data.serial_no,
            "user_id":data.user_data.user_id,
            "client_id":data.user_data.client_id,
            "log_id":log_id,
            "message":appContent,
            "timestamp":timestamp,
            "event_type":"critical",
            "field_alias":field_alias,
            "field_value":data.log_value,
            "limit_from":data.criticalFrom,
            "limit_to":data.criticalTo
           };
          await commonCLI.insert("battery_events",eventLogData);

        } //end critical event if

        /*****************************************Check for need attention event ***************************/

        if((data.log_value >= data.attentionFrom) && (data.log_value <= data.attentionTo)){
          
          /****************************send Email notification***********************************/
          if(isEmailNotification){
            //Send email
            let emailContent = (data?.field?.email_attention_content)?data.field.email_attention_content:'';

            if(data.field.alias == 'bms_life'){
              emailContent = data.field.email_attention_content.replace('%value%', data.generated_log_val.bms_life);
            }
            if(data.field.alias == 'lowest_cell_voltage'){
              emailContent = data.field.email_attention_content.replace('%value%', data.generated_log_val.lowest_cell_voltage);
            }
            if(data.field.alias == 'highest_cell_voltage'){
              emailContent = data.field.email_attention_content.replace('%value%', data.generated_log_val.highest_cell_voltage);
            }
            if(data.field.alias == 'highest_battery_temp'){
              emailContent = data.field.email_attention_content.replace('%value%', data.generated_log_val.highest_battery_temp);
            }
            if(data.field.alias == 'lowest_battery_temp'){
              emailContent = data.field.email_attention_content.replace('%value%', data.generated_log_val.lowest_battery_temp);
            }
            if(data.field.alias == 'lowest_battery_temp'){
              emailContent = data.field.email_attention_content.replace('%value%', data.generated_log_val.lowest_battery_temp);
            }
            if(data.field.alias == 'average_voltage'){
              emailContent = data.field.email_attention_content.replace('%value%', data.generated_log_val.average_voltage);
            }

            

      // console.log('............................');
      // console.log(lastEventsArr);
      // console.log(lastEventFieldValue);//24
      // console.log(data.generated_log_val);
      // console.log(data.field.alias);
      // console.log(data.generated_log_val[data.field.alias]);
      // exit();

            if(emailContent != '' && lastEventFieldValue!=data.generated_log_val[data.field.alias]){
              var emailJson = {
                  email: data.user_data.email,
                  //email: 'rajender@keyss.in',
                  content: emailContent,
                  subject: "Notification from Kulr"
              };               
              await this.sendNotificationUpdate('email', emailJson);  
            }         
          }
          /****************************send SMS notification***********************************/
          if(isPhoneNotification){
            //Send sms
            let smsContent = (data?.field?.sms_attention_content)?data.field.sms_attention_content:'';

            if(data.field.alias == 'bms_life'){
              smsContent = data.field.sms_attention_content.replace('%value%', data.generated_log_val.bms_life);
            }
            if(data.field.alias == 'lowest_cell_voltage'){
              smsContent = data.field.sms_attention_content.replace('%value%', data.generated_log_val.lowest_cell_voltage);
            }
            if(data.field.alias == 'highest_cell_voltage'){
              smsContent = data.field.sms_attention_content.replace('%value%', data.generated_log_val.highest_cell_voltage);
            }
            if(data.field.alias == 'highest_battery_temp'){
              smsContent = data.field.sms_attention_content.replace('%value%', data.generated_log_val.highest_battery_temp);
            }
            if(data.field.alias == 'lowest_battery_temp'){
              smsContent = data.field.sms_attention_content.replace('%value%', data.generated_log_val.lowest_battery_temp);
            }
            if(data.field.alias == 'lowest_battery_temp'){
              smsContent = data.field.sms_attention_content.replace('%value%', data.generated_log_val.lowest_battery_temp);
            }
            if(data.field.alias == 'average_voltage'){
              smsContent = data.field.sms_attention_content.replace('%value%', data.generated_log_val.average_voltage);
            }

            if(smsContent != ''){
              //Send to mobile number             
              let smsJson = {
                     body: smsContent,
                     from: process.env["TWILIO_FROM_NUMBER"],
                     to: '+91'+data.user_data.phone
                 };
              await this.sendNotificationUpdate('sms', smsJson);
            }
          }  
          /****************************send APP notification***********************************/

          var appContent = '';
          if(isAppNotification){
            //Send app notification
            appContent = (data?.field?.app_attention_content)?data.field.app_attention_content:'';

            if(data.field.alias == 'bms_life'){
              appContent = data.field.app_attention_content.replace('%value%', data.generated_log_val.bms_life);
            }
            if(data.field.alias == 'lowest_cell_voltage'){
              appContent = data.field.app_attention_content.replace('%value%', data.generated_log_val.lowest_cell_voltage);
            }
            if(data.field.alias == 'highest_cell_voltage'){
              appContent = data.field.app_attention_content.replace('%value%', data.generated_log_val.highest_cell_voltage);
            }
            if(data.field.alias == 'highest_battery_temp'){
              appContent = data.field.app_attention_content.replace('%value%', data.generated_log_val.highest_battery_temp);
            }
            if(data.field.alias == 'lowest_battery_temp'){
              appContent = data.field.app_attention_content.replace('%value%', data.generated_log_val.lowest_battery_temp);
            }
            if(data.field.alias == 'lowest_battery_temp'){
              appContent = data.field.app_attention_content.replace('%value%', data.generated_log_val.lowest_battery_temp);
            }
            if(data.field.alias == 'average_voltage'){
              appContent = data.field.app_attention_content.replace('%value%', data.generated_log_val.average_voltage);
            }

            if(appContent != ''){
              //Insert data in notification container
              var notificationDetails = {
                "content":appContent,
                "send_by":data.user_data.client_id,
                "send_to":data.user_data.user_id,
                "status":'show',
                "type":'push',
                "date_added":new Date(),
                "generate_for":data.field.alias
            };


            data.context.bindings.signalRMessages = [{
                "target": "notification",
                "arguments": [{
                                "title":"Warning",
                                "message":appContent,
                                "userid":data.user_data.user_id,
                                "clientid":data.user_data.client_id
                             }]
              }];
            
            //   console.log('???????attttanasssiiioonnn?????????????');
            //   console.log({
            //     "title":"Warning",
            //     "message":appContent,
            //     "userid":data.user_data.user_id,
            //     "clientid":data.user_data.client_id
            //  });

            await this.sendNotificationUpdate('app', notificationDetails);
            }
          }
          /****************************  Insert event log   ***********************************/
          let dateObj = commonCLI.getFormatedDateTime();
          let timestamp = dateObj['full_db_date']+' '+dateObj['time'];
          let eventLogData = {
            "device_id":device_id,
            "serial_no":data.serial_no,
            "user_id":data.user_data.user_id,
            "client_id":data.user_data.client_id,
            "log_id":log_id,
            "serial_no":'',
            "message":appContent,
            "timestamp":timestamp,
            "event_type":"warning",
            "field_alias":field_alias,
            "field_value":data.log_value,
            "limit_from":data.attentionFrom,
            "limit_to":data.attentionTo
           };
           await commonCLI.insert("battery_events",eventLogData);
        }

      } //end notification enable if

     }//end notification data if
     
  }
  /* Send notification to user by Email, SMS or push 
  *
  * @parms action sms,email or app
  * @parms jsonData json data
  * 
  */
  async sendNotificationUpdate(action, jsonData){
    if(action == 'sms'){
      twilio.messages.create(jsonData);
    }else if(action == 'email'){
      (async function(data) {
        try {
            const response = await axios.post(process.env["LOGIC_APP_URL"], jsonData);            
        } catch (error) {
            console.log('Error:'+error);                        
        }
      })(jsonData);
    }else if(action == 'app'){
      await commonCLI.insert("notifications",jsonData);
    }
  }
  
}//end class
module.exports = new NotificationModel;





