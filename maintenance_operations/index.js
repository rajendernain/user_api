const commonObj = require('../common/cosmos');
const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"],process.env["COSMOS_DB_RESOURCE_KEY"],process.env["COSMOS_DB_NAME"],process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {
    //Get data from header
    var device_id    = (req?.headers?.device_id)?req.headers.device_id:'SygU7iNfHE61i7N';
    var access_token = (req?.headers?.access_token)?req.headers.access_token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiJTeWdVN2lOZkhFNjFpN04iLCJ1c2VyX2lkIjoiOTkwNjNlNDYtYjE0OS00YjlmLWE0ZjYtZjkzNGExNzc0MzUyIiwiaWF0IjoxNjU3NjkzMDkwLCJleHAiOjE2NTc2OTM5OTB9.5oDVfPCFgu6q6_hpC7O31iQ9HjbP4YUEpm27jQWgJkg';
    //Get post data
    var serial_number = (req?.body?.serial_number)?req.body.serial_number:'351358811475034';
    //Global variables
    var errors = [];
    var authorizedUser;
    var new_token = '';
    //Validations
    if((device_id == '') || (access_token == '')){
        errors.push("You are not looking authorized user.");
    } else if(serial_number == ''){
        errors.push("Unauthorized access.");
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
    } else if(errors.length <= 0){    

        var maintenance_detail = [];   
        var maintenanceData = await commonCLI.select("battery_detail","SELECT * FROM battery_detail as c WHERE c.serial_number='"+serial_number+"'"); 
        var maintenance = maintenanceData[0];
        var modelData = await commonCLI.select("battery_model","SELECT * FROM battery_model as c WHERE c.id='"+maintenance.model_id+"'");
        var modelRec = modelData[0];

        if(modelData.length > 0){  
            let date = commonCLI.getUserDateFormat(maintenance.last_scanned);
            maintenance_detail={
                serial_number:serial_number,
                inverter:modelRec['model_name']?modelRec['model_name']:'',
                bms:modelRec['bms_information']['model']?modelRec['bms_information']['model']:'',
                battery_model:maintenance?.model_name?maintenance.model_name:'',
                install_info:date.display_date?date.display_date:'',
                reporting:'Yes',
                grid_up:(maintenance.charging_status==0)?'Yes':'No',
                ambient_temprature:maintenance?.temperature?maintenance.temperature:'',
                enclosure_open:'No',
                installer: maintenance?.installer?maintenance?.installer:'',
                technicians_note: maintenance?.technical_note?maintenance?.technical_note:''
            }
        }

        //Return response
        context.res = {
            status: 200, /* Defaults to 200 */
            body: {
                body_data: req.body,
                status:"success",
                data:maintenance_detail,
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