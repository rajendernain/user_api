const commonObj = require('../common/cosmos');
const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"],process.env["COSMOS_DB_RESOURCE_KEY"],process.env["COSMOS_DB_NAME"],process.env["ENCRYPTION_ALGORITHM"]);

module.exports = async function (context, req) {
     //Get data from header
     var device_id = (typeof req.headers.device_id != 'undefined')?req.headers.device_id:'8BpytqV8yJBPQpV';
     var access_token = (typeof req.headers.access_token != 'undefined')?req.headers.access_token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiI4QnB5dHFWOHlKQlBRcFYiLCJ1c2VyX2lkIjoiMzZlYTM4N2EtNWJhOS00Y2ZjLTljMzktOGM0YjhjNzdkNDQ0IiwiaWF0IjoxNjcxNDIxMzc4LCJleHAiOjE2NzE0MzU3Nzh9.KH5hyP3PrLpFiVIoFGSfVCx9hHfTztHBrtnburkKgoM';
     //Get post data
    var serial_number = (typeof req.body.serial_number != 'undefined')?req.body.serial_number:'CCC3FB470D32';
    var search = (typeof req.body.search != 'undefined')?req.body.search:'';
    var sort = (typeof req.body.sort != 'undefined')?req.body.sort:'';
    var limit = (typeof req.body.limit != 'undefined')?req.body.limit:10;
    var page_number = (typeof req.body.page != 'undefined')?req.body.page:1;
    var offset = (typeof req.body.offset != 'undefined')?req.body.offset:0;
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
        let userlogs_data = [];    
        let offset_value = (offset<=0)?((limit*page_number)-limit):offset;      
        //Get device logs data  
        if(serial_number == ''){
            console.log('......................11111111111111.................');
            var allBatteryList =  await commonObj.getBatteryList(user_id,search,sort,false,offset_value,limit);
            for (let i = 0; i < allBatteryList.length; i++) {
                let element = allBatteryList[i];                
                var logs = await commonObj.getBatteryLogBySerialNo(element.serial_number,'timestamp', 'DESC', 0,1);
                if(logs.length > 0){
                    logs.forEach(log => { //Start foreach loop 
                        let date = commonCLI.getUserDateFormat(log.timestamp);
                        userlogs_data.push(
                            {  
                                serial_number:log.serial_no,
                                battery_status:log.status?log.serial_no:'0',
                                ip:log.ip_address,
                                last_scanned:date.display_date+' '+date.time,
                                location:log.location?log.location:'not found',
                                connection_type:log.connection_type,
                                temperature:log.temperature,
                                humidity:log.humidity,
                                pressure:log.pressure,
                                voltage:log.voltage,
                                vibration:log.vibration
                            }
                        );
                    });
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
            }
           
           
        }else{
            var logs = await commonObj.getBatteryLogBySerialNo(serial_number,'timestamp', 'DESC', 0,limit);

            logs.forEach(log => { //Start foreach loop 
                
                let date = commonCLI.getUserDateFormat(log.timestamp);
                userlogs_data.push(
                    {  
                        serial_number:log.serial_no,
                        battery_status:log.status?log.serial_no:'0',
                        ip:log.ip_address,
                        last_scanned:date.display_date+' '+date.time,
                        location:log.location?log.location:'not found',
                        connection_type:log.connection_type,
                        temperature:log.temperature,
                        humidity:log.humidity,
                        pressure:log.pressure,
                        voltage:log.voltage,
                        vibration:log.vibration
                    }
                );
            });// End foreach loop   
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