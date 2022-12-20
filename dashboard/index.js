const commonObj = require("../common/cosmos");
const dashboardObj = require("../model/dashboard");

module.exports = async function (context, req) {
  //Get data from header
  var device_id = (req?.headers?.device_id) ? req.headers.device_id : '';
  var access_token = (req?.headers?.access_token) ? req.headers.access_token : '';
  var search = (req?.body?.search) ? req.body.search.trim().toLowerCase() : '';
  var sort = (typeof req.body.sort != 'undefined') ? req.body.sort : '';
  var limit = (req?.body?.limit) ? req.body.limit : 10;
  var offset = (req?.body?.offset) ? req.body.offset : 0;
  var dashboardModule = (req?.body?.module) ? req.body.module : '';
  //Global variables
  var user_id = '';
  var errors = [];
  var authorizedUser;
  var new_token = '';
  // if (dashboardModule == "geolocation") {
  //   access_token = access_token + "123";
  // }
  //Validations
  if ((device_id == '') || (access_token == '')) {
    errors.push("You are not looking authorized user.");
  } else if (!['devices', 'messages', 'soc', 'geolocation', 'all'].includes(dashboardModule)) {
    errors.push("Not recoganized dashboard module.");
  } else {
    var token_data = await commonObj.authenticate(device_id, access_token);
    if (typeof token_data.access_token != 'undefined') {
      new_token = token_data.access_token;
      user_id = token_data.user_id;
    } else if (typeof token_data.user_id != 'undefined') {
      user_id = token_data.user_id;
    }
  }
  //Authentication check
  if (!user_id && (errors.length <= 0)) {
    context.res = {
      status: 200,
      body: {
        status: "fail",
        authentication: 0,
        message: "Authentication failed."
      }
    };
  } else if (errors.length <= 0) {
    //Get data for modules 
    if (dashboardModule != '') {
      var responseData = {};
      if (dashboardModule == 'all') {
        let deviceList = await dashboardObj.getDeviceList('', search, false, offset, limit);
        let soc = await dashboardObj.getStateOfCharge();
        let messages = await dashboardObj.getDeviceMessageList('', false, 20);
        let deviceGeoLocation = await dashboardObj.getDevicesGeoLocationData('', false, 20);
        responseData = {
          "devices": deviceList,
          "soc": soc,
          "messages": messages,
          "geolocation": deviceGeoLocation
        };
      } else if (dashboardModule == 'soc') { //Get State of charge for State of health module
        responseData = await dashboardObj.getStateOfCharge();
      } else if (dashboardModule == 'devices') {
        responseData = await dashboardObj.getDeviceList('', search, false, offset, limit);
      } else if (dashboardModule == 'messages') {
        responseData = await dashboardObj.getDeviceMessageList('', false, 20);
      } else if (dashboardModule == 'geolocation') {
        responseData = await dashboardObj.getDevicesGeoLocationData('', search, sort, false, 20);
      }
      //Return response
      context.res = {
        status: 200, /* Defaults to 200 */
        body: {
          data: responseData,
          status: "success",
          message: "Data fetched successfully"
        }
      };
      //Add new access token
      if (new_token != '') {
        context.res.body.new_token = new_token;
      }
    }
  } else {
    context.res = {
      status: 200,
      body: {
        status: "fail",
        message: errors
      }
    };
  }
}
