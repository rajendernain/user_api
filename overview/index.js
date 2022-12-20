const commonObj = require('../common/cosmos');
const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"],process.env["COSMOS_DB_RESOURCE_KEY"],process.env["COSMOS_DB_NAME"],process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {
  //Get data from header
  var device_id = req?.headers?.device_id?req.headers.device_id:'X3ph56AHhlre0c7';
  var access_token = req?.headers?.access_token?req.headers.access_token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiJYM3BoNTZBSGhscmUwYzciLCJ1c2VyX2lkIjoiZjdiNTg5MTItYzA3MS00ZTJmLWI5ZTctNjk1OWM0Zjk0ODFjIiwiaWF0IjoxNjYwNzA5NDk4LCJleHAiOjE2NjA3MjM4OTh9.Lv6gDXbkypfK_W010iqG2uqW1RyyGJrOenH5wzEgzRM';  
  //Global variables
  var user_id = '';
  var errors = [];
  var authorizedUser;
  var new_token = '';
  //Validations
  if((device_id == '') || (access_token == '')){
      errors.push("You are not looking authorized user.");
  } else{
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
    var deviceData = {};
    var  qry = "SELECT * FROM battery_detail as c WHERE c.status != 3";
    if(user_id != ''){
       qry = "SELECT * FROM battery_detail as c WHERE c.user_id='"+user_id+"' AND c.status != 3";
    }
    let batteryRecord =  await commonCLI.select("battery_detail",qry);
    //Check device record length
    if(batteryRecord.length > 0){
      let maxYIncrement = 5;
      let airq_minX = 0;
      let airq_minY = 0;
      let airq_maxY = 0;
      let airq_data = [];
      let vibration_minY = 0;
      let vibration_maxY = 0;
      let vibration_data = [];
      let temp_minY = 0;
      let temp_maxY = 0;
      let temp_data = []; 
      let xCounter = 0;
      for(var i=0; i<batteryRecord.length; i++) {            
        let logQry = "SELECT * FROM battery_logs as c WHERE c.serial_no='"+batteryRecord[i]["serial_number"]+"' ORDER BY c._ts DESC OFFSET 0 LIMIT 1";
        let logs = await commonCLI.select("battery_logs",logQry);            
        //Get logs data 
        //sort according to requirement
        logs.forEach(log => {              
          let airQuality = (log?.air_quality)?log?.air_quality:0;
          let vibration  = (log?.vibration)?log?.vibration:0;
          let tamperature  = (log?.temperature)?log?.temperature:0;
          let serial_no = (log?.serial_no)?log?.serial_no:'';
          //Get air quality Y min/max
          airq_minY = ((airq_minY == 0) || (airq_minY > airQuality))?airQuality:airq_minY;
          //airq_maxY = ((airq_maxY == 0) || (airq_minX < airQuality))?airQuality:airq_minY;

          if(airQuality>airq_maxY){
            airq_maxY=airQuality;
          }
          //Get vibration Y min/max             
          vibration_minY = ((vibration_minY == 0) || (vibration_minY > vibration))?vibration:vibration_minY;      
         // vibration_maxY = ((vibration_maxY == 0) || (vibration_maxY < vibration))?airQuality:vibration_maxY;
          if(vibration>vibration_maxY){
            vibration_maxY=vibration;
          }
          //Get tamperature Y min/max             
          temp_minY = ((temp_minY == 0) || (temp_minY > tamperature))?tamperature:temp_minY;      
          temp_maxY = ((temp_maxY == 0) || (temp_maxY < tamperature))?tamperature:temp_maxY;              
          //FLSPOTS
          airq_data.push({
            "serial_no":serial_no,
            "x":xCounter,
            "y":airQuality  
          });
          vibration_data.push({
            "serial_no":serial_no,
            "x":xCounter,
            "y":vibration  
          });
          temp_data.push({
            "serial_no":serial_no,
            "x":xCounter,
            "y":tamperature  
          } );                       
          xCounter++;
        });            
      } //end for
      deviceData = {
        "air_quality":{
          "min_x": 0,
          "max_x": batteryRecord.length,
          "min_y": 0,
          //"max_y": Math.ceil(airq_maxY+maxYIncrement),
          "max_y": airq_maxY+50,
          "color_lines": {"red_lines": 300, "yellow_lines": 100},
          "data": airq_data
        },
        "vibration":{
          "min_x": 0,
          "max_x": batteryRecord.length,
          "min_y": 0,
          //"max_y": Math.ceil(vibration_maxY+maxYIncrement),
          "max_y": vibration_maxY+50,
          "color_lines": {"red_lines": 200, "yellow_lines": 150},
          "data": vibration_data
        },
        "tamperature":{
          "min_x": 0,
          "max_x": batteryRecord.length,
          "min_y": 0,
          "max_y": Math.ceil(temp_maxY+maxYIncrement),
          "color_lines": {"red_lines": 70, "yellow_lines": 2},
          "data": temp_data
        }
      };
    }                  
      //Return response
      context.res = {
          status: 200, /* Defaults to 200 */
          body: {
              data:deviceData,
              status:"success",
              message:"Data fetched successfully"
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