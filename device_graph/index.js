const commonObj = require('../common/cosmos');
const batteryInfoObj = require('../model/battery_information');
module.exports = async function (context, req) {
    //Get data from header
    var device_id    = req?.headers?.device_id?req.headers.device_id:'rrw9RD8iirmLO8u';
    var access_token = req?.headers?.access_token?req.headers.access_token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiJycnc5UkQ4aWlybUxPOHUiLCJ1c2VyX2lkIjoiMzZlYTM4N2EtNWJhOS00Y2ZjLTljMzktOGM0YjhjNzdkNDQ0IiwiaWF0IjoxNjcxNDM1OTg0LCJleHAiOjE2NzE0NTAzODR9.jo7rRbkYlu6ITzYDyiE-JLID7fj3Tm5TuRsN4GJKXgU';
    //Get post data
    var serial_number= req?.body?.serial_number?req.body.serial_number:'CCC3FB470D32';
    var graph_key    = req?.body?.graph_key?req.body.graph_key:'temp,pressure,vibration,voltage,air_quality,humidity';
    var filter       = req?.body?.filter?req.body.filter:'';
    //Global variables
   var user_id = '';
    var errors = [];
    var authorizedUser;
    var new_token = '';
    //Validations
    if((device_id == '') || (access_token == '')){
        errors.push("You are not looking authorized user.");
    } else if((serial_number == '') && (graph_key=='')){
        errors.push("Required information missing.");
    } else {
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
        var batteryData = await commonObj.getBatteryDetailsByID(serial_number);        
        var battery_detail = [];
        if(batteryData.length > 0){
            let batteryObj = (batteryData[0] != 'undefined')?batteryData[0]:{};
            let battery_capacity = batteryObj?.battery_capacity?batteryObj.battery_capacity:0;
            battery_detail={
                battery_id:batteryObj?.id?batteryObj.id:'',
                user_id:batteryObj?.user_id?batteryObj.user_id:'',
                battery_model_id:batteryObj?.model_id?batteryObj.model_id:'',
                id:batteryObj?.serial_number?batteryObj.serial_number:'',
                name:batteryObj?.company_name?batteryObj.company_name:'',
                charge_cycle:batteryObj?.charge_cycle?batteryObj.charge_cycle:'',
                red_state:batteryObj?.red_state?batteryObj.red_state:'',
                cycle:batteryObj?.cycle?batteryObj.cycle:'',
                pressure:batteryObj?.pressure?batteryObj.pressure:'',
                temprature:batteryObj?.temprature?batteryObj.temprature:'',
                voltage:batteryObj?.voltage?batteryObj.voltage:'',
                hours:batteryObj?.hours?batteryObj.hours:'',
                percentages:batteryObj?.percentages?batteryObj.percentages:'',
                field_limit:batteryObj?.field_limit?batteryObj.field_limit:{},
            };     
            //Get graph data    
            var graphs = {};
            if(battery_detail.battery_id != ''){
                //Get battery model details
                let model_data = {};
                               
                //Get model details
                if(battery_detail.battery_model_id != ''){//element.model_id
                    //Get device model data
                    if(battery_detail.field_limit.length > 0){
                        model_data=battery_detail.field_limit[0];
                    }else{
                        var modelData = await commonObj.getBatteryModel(battery_detail.battery_model_id);
                        if(modelData.length > 0){ 
                            model_data = (modelData[0] != 'undefined')?modelData[0]:''; 
                        }
                    }
                }

                //Get battery logs data
                //var battery_logs = await commonObj.getBatteryLogs(serial_number, filter);
                //Get graph data for each key
                for (var i in  graph_key.split(',') ) {
                    let graph_type = graph_key.split(',')[i];
                    switch(graph_type.toLowerCase()){
                        case'temp':
                            var battery_logs = await commonObj.getBatteryLogs(serial_number, filter,'temperature');
                            graphs.temp= batteryInfoObj.tempratureGraphData(battery_logs,model_data);
                        break;
                        case 'acc':
                            var battery_logs = await commonObj.getBatteryLogs(serial_number, filter, 'accelerometer');                            
                            graphs.acc = batteryInfoObj.accelerometerGraphData(battery_logs, model_data);
                            break;   
                        case'pressure':
                            var battery_logs = await commonObj.getBatteryLogs(serial_number, filter,'pressure');
                            graphs.pressure = batteryInfoObj.pressurGraphData(battery_logs,model_data);
                        break;
                        case'vibration':
                            var battery_logs = await commonObj.getBatteryLogs(serial_number, filter,'vibration');
                            graphs.vibration = batteryInfoObj.vibrationGraphData(battery_logs,model_data);
                        break;
                        case'voltage':
                            var battery_logs = await commonObj.getBatteryLogs(serial_number, filter,'voltage');
                            graphs.voltage = batteryInfoObj.voltageGraphData(battery_logs,model_data,battery_capacity);
                        break;
                        case'air_quality':
                                var battery_logs = await commonObj.getBatteryLogs(serial_number, filter,'air_quality');
                                graphs.air_quality = batteryInfoObj.airQualityGraphData(battery_logs,model_data);
                        break;
                        case'humidity':
                            var battery_logs = await commonObj.getBatteryLogs(serial_number, filter,'humidity');
                            graphs.humidity = batteryInfoObj.humidityGraphData(battery_logs,model_data);
                        break;
                        default:
                        break;
                    }    
                }  
            }                 
            battery_detail.graph = graphs; //Add graph data to battery detail object   
            ///success response
            context.res = {
                status: 200, /* Defaults to 200 */
                body: {
                    test:req.body,
                    data:battery_detail,
                    status:"success",
                    message:"Record fetched successfully"
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
                   message:"Data not exist."
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