const commonObj = require('../common/cosmos');
const notificationSettingObj = require("../model/notificationSetting");
const commonCLI = require('common-cls');
const axios = require('axios');
const twilio = require('twilio')(process.env["TWILIO_ACCOUNT_SID"], process.env["TWILIO_AUTH_TOKEN"]);
module.exports = async function (context, documents) {
  if (!!documents && documents.length > 0) {
    let device_serial_no = (typeof documents[0].serial_no != 'undefined') ? documents[0].serial_no : '';
    let device_macaddress = (typeof documents[0].mac_address != 'undefined') ? documents[0].mac_address : '';
    let connection_type = (typeof documents[0].connection_type != 'undefined') ? documents[0].connection_type : '';
    if (device_serial_no == '') {
      device_serial_no = device_macaddress;
    }
    //Send live progress to Bluetooth devices
    if (connection_type == 'BLE') {
      context.bindings.signalRMessages = [{
        "target": "newMessage",
        "arguments": [device_serial_no]
      }];
    }//end check BLE if
    var log_data = (typeof documents[0] != 'undefined') ? documents[0] : {};
    if (device_serial_no != '') {
      var serial_no = device_serial_no;
      var log_id = log_data['id'];
      //Get battery details by serial no
      var battery_data = await commonCLI.select("battery_detail", "SELECT * FROM battery_detail as c WHERE (c.serial_number='" + serial_no + "') || (c.macaddress='" + serial_no + "')");

      if (battery_data.length > 0) { //battery if --start              
        //Get battery field list
        var fieldsData = await commonCLI.select("battery_data_fields", "SELECT * FROM battery_data_fields as c ORDER BY c.label ASC");
        var model_data = await commonObj.getBatteryModel(battery_data[0]['model_id']);
        var battery_field_limit = (typeof battery_data[0]['field_limit'] != 'undefined') ? battery_data[0]['field_limit'] : {};
        var user_id = (typeof battery_data[0]['user_id'] != 'undefined') ? battery_data[0]['user_id'] : '';
        var device_id = (typeof battery_data[0]['id'] != 'undefined') ? battery_data[0]['id'] : '';
        var criticalEvent = (typeof battery_data[0]['critica l_event'] != 'undefined') ? battery_data[0]['critical_event'] : 0;
        var accessHeat = (typeof battery_data[0]['access_heat'] != 'undefined') ? battery_data[0]['access_heat'] : 0;
        var accessCold = (typeof battery_data[0]['access_heat'] != 'undefined') ? battery_data[0]['access_cold'] : 0;
        var underVoltage = (typeof battery_data[0]['under_voltage'] != 'undefined') ? battery_data[0]['under_voltage'] : 0;
        var overVoltage = (typeof battery_data[0]['over_voltage'] != 'undefined') ? battery_data[0]['over_voltage'] : 0;
        //var user_id = '99063e46-b149-4b9f-a4f6-f934a1774352'; //Hardcoded for testing purpose
        if (user_id != '') {
          //Get user details
          var userData = await commonObj.getUserByID(user_id);
          //Check user data exist
          if (userData.length > 0) {
            let userEmail = userData[0].email;
            let userPhone = userData[0].phone;
            let userClientID = userData[0].client_id;
            //Check either email or phone number and client ID not empty
            if (((userEmail != '') || (userPhone != '')) && (userClientID != '')) {
              //Get user setting for notification
              var notificationSettingData = [];
              var user_settings = await commonCLI.select("battery_field_notification_setting", "SELECT * FROM battery_field_notification_setting as c WHERE c.user_id='" + user_id + "'");
              if (user_settings.length > 0) {
                notificationSettingData = (typeof user_settings[0]['settings'] != 'undefined') ? user_settings[0]['settings'] : [];
              } else {
                var client_settings = await commonCLI.select("battery_field_notification_setting", "SELECT * FROM battery_field_notification_setting as c WHERE c.user_id='" + userClientID + "'");
                if (client_settings.length > 0) {
                  notificationSettingData = (typeof client_settings[0]['settings'] != 'undefined') ? client_settings[0]['settings'] : [];
                }
              }

              //Proceed further if notification settings are availble set either by user or client

              if (notificationSettingData.length > 0) {
                for (let i = 0; i < fieldsData.length; i++) {
                  let field = fieldsData[i];

                  if (battery_field_limit.length > 0) {

                    var batteryFieldData = battery_field_limit[0][field.alias];
                    var modelFieldData = model_data[0][field.alias];
                    //console.log("Alias:"+field.alias+" Log data:"+log_data[field.alias]+" Limit data:"+batteryFieldData);

                    if (typeof batteryFieldData != 'undefined') {

                      let criticalFrom = (batteryFieldData['critical']['from']) ? batteryFieldData['critical']['from'] : 0;
                      let criticalTo = (batteryFieldData['critical']['to']) ? batteryFieldData['critical']['to'] : 0;
                      let attentionFrom = (batteryFieldData['need_attention']['from']) ? batteryFieldData['need_attention']['from'] : 0;
                      let attentionTo = (batteryFieldData['need_attention']['to']) ? batteryFieldData['need_attention']['to'] : 0;
                      //console.log("Line 60 criticalFrom:"+criticalFrom+" criticalTo:"+criticalTo+" attentionFrom:"+attentionFrom+" attentionTo:"+attentionTo+" Log field value:"+log_data[field.alias]);
                      //Check for Critical event


                      await notificationSettingObj.sendUserNotification({
                        "device_id": device_id,
                        "log_id": log_id,
                        "serial_no": serial_no,
                        "critical_event": criticalEvent,
                        "access_heat": accessHeat,
                        "access_cold": accessCold,
                        "under_voltage": underVoltage,
                        "over_voltage": overVoltage,
                        "user_data": { "phone": userPhone, "email": userEmail, "user_id": user_id, "client_id": userClientID },
                        "log_value": (typeof log_data[field.alias] != 'undefined') ? log_data[field.alias] : null,
                        "criticalFrom": criticalFrom,
                        "criticalTo": criticalTo,
                        "attentionFrom": attentionFrom,
                        "attentionTo": attentionTo,
                        "notification_setting": notificationSettingData,
                        "generated_log_val": log_data,
                        "field": field,
                        "context": context
                      });

                    } else if (typeof modelFieldData != 'undefined') {
                      //Get data from model list
                      let criticalFrom = (modelFieldData['critical']['from']) ? modelFieldData['critical']['from'] : 0;
                      let criticalTo = (modelFieldData['critical']['to']) ? modelFieldData['critical']['to'] : 0;
                      let attentionFrom = (modelFieldData['need_attention']['from']) ? modelFieldData['need_attention']['from'] : 0;
                      let attentionTo = (modelFieldData['need_attention']['to']) ? modelFieldData['need_attention']['to'] : 0;

                      //Check for Critical event
                      await notificationSettingObj.sendUserNotification({
                        "device_id": device_id,
                        "log_id": log_id,
                        "serial_no": serial_no,
                        "critical_event": criticalEvent,
                        "access_heat": accessHeat,
                        "access_cold": accessCold,
                        "under_voltage": underVoltage,
                        "over_voltage": overVoltage,
                        "user_data": { "phone": userPhone, "email": userEmail, "user_id": user_id, "client_id": userClientID },
                        "log_value": (typeof log_data[field.alias] != 'undefined') ? log_data[field.alias] : null,
                        "criticalFrom": criticalFrom,
                        "criticalTo": criticalTo,
                        "attentionFrom": attentionFrom,
                        "attentionTo": attentionTo,
                        "notification_setting": notificationSettingData,
                        "generated_log_val": log_data,
                        "field": field,
                        "context": context
                      });
                    }
                  } else {
                    //Get data from model list
                    var modelFieldData = model_data[0][field.alias];
                    if (typeof modelFieldData != 'undefined') {
                      let criticalFrom = (modelFieldData['critical']['from']) ? modelFieldData['critical']['from'] : 0;
                      let criticalTo = (modelFieldData['critical']['to']) ? modelFieldData['critical']['to'] : 0;
                      let attentionFrom = (modelFieldData['need_attention']['from']) ? modelFieldData['need_attention']['from'] : 0;
                      let attentionTo = (modelFieldData['need_attention']['to']) ? modelFieldData['need_attention']['to'] : 0;
                      //Check for Critical event
                      await notificationSettingObj.sendUserNotification({
                        "device_id": device_id,
                        "log_id": log_id,
                        "serial_no": serial_no,
                        "critical_event": criticalEvent,
                        "access_heat": accessHeat,
                        "access_cold": accessCold,
                        "under_voltage": underVoltage,
                        "over_voltage": overVoltage,
                        "user_data": { "phone": userPhone, "email": userEmail, "user_id": user_id, "client_id": userClientID },
                        "log_value": (typeof log_data[field.alias] != 'undefined') ? log_data[field.alias] : null,
                        "criticalFrom": criticalFrom,
                        "criticalTo": criticalTo,
                        "attentionFrom": attentionFrom,
                        "attentionTo": attentionTo,
                        "notification_setting": notificationSettingData,
                        "generated_log_val": log_data,
                        "field": field,
                        "context": context
                      });
                    }//end model data undefined if                        
                  }//end else statement
                } //End for loop  
              } //End notificationSettingData if

            }//end battery details if
          }//End user data length if
        }//end email/phone if
      }//End user id if

    }//end main if   
  } //documents && documents.length > 0
}
