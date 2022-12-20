const commonObj = require('../common/cosmos');
class BatteryInformation {
  /**
   * Get data for tempareture graph
   * 
   * Read data from device log, read tempareture data from logs
   * 
   * @return graph data
   * 
  */
  tempratureGraphData(battery_logs,model_data) {      
    var graph_data = {};
    if(battery_logs.length > 0){
    var x_y_data = [];
    var xdata=0;
    var mx_y = 0;
      battery_logs.forEach(batteryObject => {   
        if(typeof batteryObject.temperature != 'undefined'){
          let temperature = batteryObject.temperature.toFixed(2);  
          if(mx_y < batteryObject.temperature){
            mx_y=Math.ceil(temperature);
          }
          x_y_data.push({"x":xdata,"y":temperature});
          xdata++;
        }       
      }); 
      if(x_y_data.length > 0){
        var red_line_low = (typeof model_data['lowest_battery_temp']['critical']['to']!='undefined')?model_data['lowest_battery_temp']['critical']['to']:0;
        var red_line_high = (typeof model_data['highest_battery_temp']['critical']['to']!='undefined')?model_data['highest_battery_temp']['critical']['to']:0;
        var orange_line_low = (typeof model_data['lowest_battery_temp']['need_attention']['to']!='undefined')?model_data['lowest_battery_temp']['need_attention']['to']:0;
        var orange_line_high = (typeof model_data['highest_battery_temp']['need_attention']['to']!='undefined')?model_data['highest_battery_temp']['need_attention']['to']:0;
        var minTemperature = getMinValue(battery_logs,'temperature'); 

          red_line_low=Math.ceil(red_line_low);
          red_line_high=Math.ceil(red_line_high);
          orange_line_low=Math.ceil(orange_line_low);
          orange_line_high=Math.ceil(orange_line_high);
          
          graph_data.color_lines = {
          "red_lines_low": red_line_low,
          "red_lines_high": red_line_high,
          "orange_lines_low": orange_line_low,
          "orange_lines_high": orange_line_high
        };
        var minTemp = (minTemperature > 0)?Math.floor(minTemperature):0;
        
        graph_data.line = {
          "min_x":0,
          "max_x":x_y_data.length,
          "min_y":((minTemp-3) > 0)?(minTemp-3):minTemp,
          "mx_y":parseInt(mx_y+5)
        };             
        graph_data.fl_spots = x_y_data;
      }else{
        graph_data.status = false;
      }
    }else{
      graph_data.status = false;
    }
    return graph_data;                     
   }

   /**
   * Get data for accelerometer graph
   * 
   * Read data from device log, read accelerometer data from logs
   * 
   * @return graph data
   * 
  */
  accelerometerGraphData(battery_logs,model_data) {  
    var graph_data = {};
    if(battery_logs.length > 0){
    var x_data = [];
    var y_data = [];
    var z_data = [];
    var xdata=0;
    var mx_y = 0;
      battery_logs.forEach(batteryObject => {  
        if(typeof batteryObject.accelerometer != 'undefined'){
          let accelerometerX = batteryObject.accelerometer.x;       
          let accelerometerY = batteryObject.accelerometer.y;       
          let accelerometerZ = batteryObject.accelerometer.z;   
          // if(mx_y < batteryObject.accelerometerX){
          //   mx_y=Math.ceil(accelerometerX);
          // }
          x_data.push({"x":xdata,"y":accelerometerX});
          y_data.push({"x":xdata,"y":accelerometerY});
          z_data.push({"x":xdata,"y":accelerometerZ});
          xdata++;
        }       
      }); 
      if(x_data.length > 0){
        var minAccelerometerX = getMinAccelerometerValue(battery_logs,'x'); 
        var minAccelerometerY = getMinAccelerometerValue(battery_logs,'y'); 
        var minAccelerometerZ = getMinAccelerometerValue(battery_logs,'z'); 
          
        graph_data.color_lines = {
          "red_lines_low": 10,
          "red_lines_high": 100,
          "orange_lines_low": 20,
          "orange_lines_high": 80
        };
        
        graph_data.line = {
          "min_x":minAccelerometerX,
          "max_x":x_data.length,
          "min_y":minAccelerometerY,
          "max_y":y_data.length,
          "min_z":minAccelerometerZ,
          "max_z":z_data.length,
        };             
        graph_data.fl_spots = {
         "accelerometerX": x_data,
         "accelerometerY": y_data,
         "accelerometerZ": z_data
        };
      }else{
        graph_data.status = false;
      }
    }else{
      graph_data.status = false;
    }
    return graph_data;                     
   }

   /**
   * Get Pressor graph data
   * 
   * @return battery pressor data
   * 
  */
  pressurGraphData(battery_logs,model_data) {
    var graph_data = {};
    if(battery_logs.length > 0){
      var x_y_data = [];
      var graphData = [];
      var xdata=0;
      var red_line = 100;
      var orange_line = 75; 
      battery_logs.forEach(batteryObject => {
        if(typeof batteryObject.pressure != 'undefined'){
          graphData=batteryObject;
          if(red_line < batteryObject.pressure){
            red_line=parseInt(batteryObject.pressure);
          }
          if(orange_line == '' || orange_line > batteryObject.pressure){
            orange_line=parseInt(batteryObject.pressure);
          } 
          x_y_data.push({"x":xdata,"y":graphData.pressure});      
          xdata++;
        }
      });

      if(x_y_data.length > 0){
        var maxPressure = getMaxValue(battery_logs,'pressure');
        const digits = Math.max(Math.floor(Math.log10(Math.abs(maxPressure))), 0) + 1;
        if(maxPressure <= 0){
          graph_data.status=false;
          
        }
        var minPressure = getMinValue(battery_logs,'pressure');      
        graph_data.color_lines = {
          "red_lines":Math.ceil(red_line),
          "yello_lines":Math.ceil(orange_line)
        };

        let addNum=0;
        if(digits == 5){
          addNum=5000;
        }else if(digits == 4){
          addNum=1000;
        }else{
          addNum=10;
        }

        graph_data.line = {
          "min_x":0,
          "max_x":x_y_data.length,
          // "min_y":parseInt(orange_line),
          "min_y":(minPressure > 0)?Math.floor(minPressure):0,
          "mx_y":parseInt(maxPressure)+addNum
        }; 
        graph_data.fl_spots = x_y_data;
      }else{
        graph_data.status=false;
      }
    }else{
      graph_data.status=false;
    }
       return graph_data;                     
    }
    /**
   * Get Vibration graph data
   * 
   * @return battery vibration data
   * 
  */
  vibrationGraphData(battery_logs,model_data) { 
    var graph_data = {};
    if(battery_logs.length > 0){ 
          var x_y_data = [];    
          var red_line =15;
          var orange_line =10;
          var xdata=0;
          var mx_y = 0;
          battery_logs.forEach(batteryObject => { 
            if(typeof batteryObject.vibration != 'undefined'){
              let vibration = (batteryObject.vibration+10).toFixed(2); 

              if(mx_y < (batteryObject.vibration+10)){
                mx_y = Math.ceil(vibration);         
              }        
              x_y_data.push({"x":xdata,"y":vibration});
              xdata++;
            }
        });  
        if(x_y_data.length > 0){    
          var maxValue = getMaxValue(battery_logs,'vibration');
          if(maxValue <= 2){
            graph_data.status=false;
          }

          red_line=Math.ceil(red_line);
          orange_line=Math.ceil(orange_line);

          graph_data.color_lines = {
            "red_lines": Number.isInteger(red_line)?red_line:0,
            "yello_lines": Number.isInteger(orange_line)?orange_line:0
          };
          graph_data.line = {
            "min_x":0,
            "max_x":x_y_data.length,
            "min_y":0,
            "mx_y":Number.isInteger(parseInt(mx_y))?parseInt(mx_y+10):0
          }; 
          graph_data.fl_spots = x_y_data;
        }//end if
        else
        {
          graph_data.status=false;
        }

    }else{    
      graph_data.status=false;
    }    
     return graph_data;                     
  }
  /**
 * Get Vibration graph data
 * 
 * @return battery vibration data
 * 
*/
airQualityGraphData(battery_logs,model_data) {  
  var graph_data = {};
  if(battery_logs.length > 0){ 
    var x_y_data = [];
    var red_line =200;
    var orange_line =100;
    var xdata=0;
    var mx_y = 0;
    battery_logs.forEach(batteryObject => { 
      if(typeof batteryObject.air_quality != 'undefined'){
        let air_quality = (batteryObject.air_quality > 0)?Number.parseFloat(batteryObject.air_quality).toFixed(2):0;       
        if(mx_y < batteryObject.air_quality){
          mx_y = Math.ceil(air_quality);         
        }        
        x_y_data.push({"x":xdata,"y":air_quality});
        xdata++;
      }//end if
    });

    if(x_y_data.length > 0){
      red_line=Math.ceil(red_line);
      orange_line=Math.ceil(orange_line);

      graph_data.color_lines = {
        "red_lines": red_line,
        "yello_lines": orange_line
      };
      graph_data.line = {
        "min_x":0,
        "max_x":x_y_data.length,
        "min_y":0,
        "mx_y":parseInt(mx_y+5)
      }; 
      graph_data.fl_spots = x_y_data;
    }else{
      graph_data.status=false;
    }

  }else{
    graph_data.status=false;
  }    
  
   return graph_data;                     
}
/**
 * Get Humidity graph data
 * 
 * @return battery humidity data
 * 
*/
humidityGraphData(battery_logs,model_data) {  
  var graph_data = {};
  if(battery_logs.length > 0){
    var x_y_data = [];
    var red_line =10;
    var orange_line =20;
    var xdata=0;
    var mx_y = 0;
  
      battery_logs.forEach(batteryObject => {  
        if(typeof batteryObject.humidity != 'undefined'){    
          let humidity = (batteryObject.humidity > 0)?Number.parseFloat(batteryObject.humidity).toFixed(2):0; 
          if(mx_y < batteryObject.humidity){
            mx_y = Math.ceil(humidity);         
          }        
          x_y_data.push({"x":xdata,"y":humidity});
        xdata++;
        }
     });
      if(x_y_data.length > 0){
        red_line=Math.ceil(red_line);
        orange_line=Math.ceil(orange_line);

        graph_data.color_lines = {
          "red_lines": red_line,
          "yello_lines": orange_line
        };
        graph_data.line = {
          "min_x":0,
          "max_x":x_y_data.length,
          "min_y":0,
          "mx_y":parseInt(mx_y+5)
        }; 
        graph_data.fl_spots = x_y_data;
      } else {
       graph_data.status=false;
      }
  } else {
    graph_data.status=false;
  }    
  return graph_data;                     
}
/**
 * Get Voltage graph data
 * 
 * @return battery voltage graph data
 * 
*/
  voltageGraphData(battery_logs,battery_model,battery_full_capacity) {
    var graph_data  = {};
    if(battery_logs.length > 0){
      var x_y_data    = [];
      var xdata = 0;    
      battery_logs.forEach(graphData => {        
        if(typeof graphData.voltage != 'undefined'){
          x_y_data.push({"x":xdata,"y":graphData.voltage});       
          xdata++;
        }
      });
     if(x_y_data.length > 0){
      var mx_y = 0;
        var min_y = 0;        
        var red_line_low = (typeof battery_model['lowest_cell_voltage']['critical']['to']!='undefined')?battery_model['lowest_cell_voltage']['critical']['to']:0;
        var red_line_high = (typeof battery_model['highest_cell_voltage']['critical']['to']!='undefined')?battery_model['highest_cell_voltage']['critical']['to']:0;
        var orange_line_low = (typeof battery_model['lowest_cell_voltage']['need_attention']['to']!='undefined')?battery_model['lowest_cell_voltage']['need_attention']['to']:0;
        var orange_line_high = (typeof battery_model['highest_cell_voltage']['need_attention']['to']!='undefined')?battery_model['highest_cell_voltage']['need_attention']['to']:0;
        
           
        
          var maxVoltage = getMaxValue(battery_logs,'voltage');
          var minVoltage = getMinValue(battery_logs,'voltage');
          mx_y = maxVoltage;
          min_y = minVoltage;
          //graph_data.line_difference = ((Math.ceil(mx_y)-Math.floor(min_y))/10);
          if(maxVoltage <= 2){
            graph_data.status=false;
          }

              
        
        graph_data.line = {
          "min_x":0,
          "max_x":x_y_data.length,
          "min_y": 0,
          "mx_y": (battery_full_capacity > 0)?battery_full_capacity:maxVoltage+15
        }; 
        
        graph_data.color_lines = {
          "red_lines_low": red_line_low,
          "red_lines_high": red_line_high,
          "orange_lines_low": orange_line_low,
          "orange_lines_high": orange_line_high
        };

        graph_data.fl_spots = x_y_data;
      }else{
        graph_data.status=false;
      }
     
    }else{
      graph_data.status=false;

    }
     return graph_data;                     
  }
  /**
   * Get Overview Air Graph data
   * 
   * @return battery voltage graph data
   * 
  */
  overviewAirGraphData(battery_logs,model_data) {
    var graph_data = {};
    if(battery_logs.length > 0){      
      var x_y_data = [];   
      var xdata=0;
      var mx_y = 0;    
        battery_logs.forEach(batteryObject => {   
        if(typeof batteryObject.humidity != 'undefined'){
          let humidity = batteryObject.humidity.toFixed(2);  
          if(mx_y < batteryObject.humidity){
            mx_y=Math.ceil(humidity);
          }
          x_y_data.push({"x":xdata,"y":humidity});
          xdata++;
        }
      });      
      if(x_y_data.length > 0){
        var red_line = (typeof model_data['air_quality']['critical']['to']!='undefined')?model_data['air_quality']['critical']['to']:0;
        var orange_line = (typeof model_data['air_quality']['need_attention']['to']!='undefined')?model_data['air_quality']['need_attention']['to']:0;
        var green_line = (typeof model_data['air_quality']['healthy']['to']!='undefined')?model_data['air_quality']['healthy']['to']:0;  
        
        graph_data.color_lines = {
          "red_lines": red_line,
          "green_line": green_line,
          "yello_lines": orange_line
        };
        graph_data.line = {
          "min_x":0,
          "max_x":x_y_data.length,
          "min_y":0,
          "mx_y":parseInt(mx_y)
        };     
        graph_data.fl_spots = x_y_data;
      }else{
        graph_data.status=false;
      }
    }else{
      graph_data.status=false;
    }
    return graph_data;                     
  }
/**
 * Get Overview Vibration Graph data
 * 
 * @return battery vibration graph data
 * 
*/
  overviewVibGraphData(battery_logs,model_data) {
    var graph_data = {};   
    if(battery_logs.length > 0){
      var x_y_data = [];
      var xdata=0;
      var mx_y = 0;
      var min_y = 0;
        battery_logs.forEach(batteryObject => {   
          if(typeof batteryObject.vibration != 'undefined'){
            let vibration = batteryObject.vibration.toFixed(2);  
            if(mx_y < batteryObject.vibration){
              mx_y=Math.ceil(vibration);
            }else{
              min_y=Math.ceil(vibration);
            }
            x_y_data.push({"x":xdata,"y":vibration});
            xdata++;
          }//end if
        }); 
        if(x_y_data.length > 0){
        var red_line = (typeof model_data['air_quality']['critical']!='undefined')?model_data['air_quality']['critical']:0;
        var orange_line = (typeof model_data['air_quality']['need_attention']!='undefined')?model_data['air_quality']['need_attention']:0;
        var green_line = (typeof model_data['air_quality']['healthy']!='undefined')?model_data['air_quality']['healthy']:0;       

        red_line=Math.ceil(red_line);
        orange_line=Math.ceil(orange_line);     
        graph_data.color_lines = {
          "red_lines": red_line,
          "green_line": green_line,
          "yello_lines": orange_line
        };
        graph_data.line = {
          "min_x":0,
          "max_x":x_y_data.length,
          "min_y":min_y,
          "mx_y":parseInt(mx_y)
        };     
        graph_data.fl_spots = x_y_data;
      }else{
        graph_data.status=false;
      }

    }else{
      graph_data.status=false;
    }
    return graph_data;                     
   } 
  /**
 * Get Overview Tamperature Graph data
 * 
 * @return battery Temperature graph data
 * 
*/
  overviewTemGraphData(battery_logs,model_data) {    
    var graph_data = {};
    if(battery_logs.length > 0){
      var x_y_data = [];
      var xdata=0;
      var mx_y = 0;
      var min_y = 0;
      battery_logs.forEach(batteryObject => {  
        if(typeof batteryObject.temperature != 'undefined') {
          let temperature = batteryObject.temperature.toFixed(2);  
          if(mx_y < batteryObject.temperature){
            mx_y=Math.ceil(temperature);
          }else{
            min_y=Math.ceil(temperature);
          }
          x_y_data.push({"x":xdata,"y":temperature});
          xdata++;
        }//end if
      }); 

      if(x_y_data.length > 0){
        var red_line = (typeof model_data['air_quality']['critical']!='undefined')?model_data['air_quality']['critical']:0;
        var orange_line = (typeof model_data['air_quality']['need_attention']!='undefined')?model_data['air_quality']['need_attention']:0;
        
        red_line=Math.ceil(red_line);
        orange_line=Math.ceil(orange_line);
        
        graph_data.color_lines = {
          "red_lines": red_line,
          "yello_lines": orange_line
        };
        graph_data.line = {
          "min_x":0,
          "max_x":x_y_data.length,
          "min_y":min_y,
          "mx_y":parseInt(mx_y)
        };     
        graph_data.fl_spots = x_y_data;
      }else{
        graph_data.status=false;
      }
    }else{
      graph_data.status=false;
    }
    return graph_data;                     
   }  

  /**
   * Get Charge graph data
   * 
   * @return battery charge data
   * 
  */
   chargeGraphData() {
    var graph_data = {};
    graph_data.color_lines = {
                               "red_lines":[1.5],
                               "yello_lines":["-0.5"]
                             };
    graph_data.line = {
                        "min_x":0,
                        "max_x":6,
                        "min_y":"-2.5",
                        "mx_y":"2.5"
                      }; 
   graph_data.fl_spots = [
                             {"x":0.3,"y":0},
                             {"x":1.1,"y":.65},
                             {"x":1.8,"y":"-0.25"},
                             {"x":2.4,"y":0.35},
                             {"x":3,"y":"-0.70"},
                             {"x":3.4,"y":0.80},
                             {"x":3.9,"y":1},
                             {"x":4.4,"y":1.4},
                             {"x":5.5,"y":1}
                         ]; 
     return graph_data;                     
  }
  /**
   * Get Charge graph data
   * 
   * @return battery charge data
   * 
  */
   getCellsData(data,cell_full_capcity=0) {
    var cells = [];
    if(data.length > 0){
      for(var i=0; i < data.length; i++){
        var status = "dead";
      var charging_level = 0;      
      if((data[i] > 0) && (cell_full_capcity > 0)){
        status = "active";
        charging_level = parseInt((data[i] * 100)/cell_full_capcity);
      }
      cells.push({
        "status":status,
        "charging_level":charging_level 
      });
      }
      
    }else { //remove after all demo data removed from database
      cells = [
        {
         "status":"active",
         "charging_level":100      
         },
         {
         "status":"active",
           "charging_level":70
         },
         {
           "status":"active",
           "charging_level":50
         },
         {
           "status":"active",
           "charging_level":30
         },
         {
           "status":"active",
           "charging_level":10
         },
         {
           "status":"dead",
           "charging_level":0
          }
       
      ];
    }
     
        return cells;
   }
   /**
   * Get Charge cycle graph data
   * 
   * @return battery Charge cycle data
   * 
  */
    cycleChargeGraphData(data,sort,search) {
      var graph_data = {};
      graph_data.color_lines = {
                                 "red_lines":[1.5],
                                 "yello_lines":["-0.5"]
                               };
      graph_data.line = {
                          "min_x":0,
                          "max_x":6,
                          "min_y":"-2.5",
                          "mx_y":"2.5"
                        }; 
     graph_data.fl_spots = [
                               {"x":0.3,"y":0},
                               {"x":1.1,"y":".65"},
                               {"x":1.5,"y":"-0.25"},
                               {"x":2.2,"y":"0.35"},
                               {"x":3,"y":"-0.70"},
                               {"x":3.4,"y":0.80},
                               {"x":3.6,"y":1},
                               {"x":4.4,"y":1.4},
                               {"x":5.9,"y":1}
                           ]; 
       return graph_data;                      
    }
    /**
   * Get Event graph data
   * 
   * @return battery Event data
   * 
  */
     eventGraphData(data,sort,search) {
      var graph_data = {};
      graph_data.color_lines = {
                                 "red_lines":[1.5],
                                 "yello_lines":["-0.5"]
                               };
      graph_data.line = {
                          "min_x":0,
                          "max_x":6,
                          "min_y":"-2.5",
                          "mx_y":"2.5"
                        }; 
     graph_data.fl_spots = [
                               {"x":0.3,"y":0},
                               {"x":1.1,"y":".65"},
                               {"x":1.5,"y":"-0.25"},
                               {"x":2.2,"y":"0.35"},
                               {"x":3,"y":"-0.70"},
                               {"x":3.4,"y":0.80},
                               {"x":3.6,"y":1},
                               {"x":4.4,"y":1.4},
                               {"x":5.9,"y":1}
                           ]; 
       return graph_data;                     
    }
      /**
       * Get Discharge Rate graph data
       * 
       * @return battery Discharge Rate data
       * 
      */
       dischargeRateGraphData(data,sort,search) {
        var graph_data = {};
        graph_data.color_lines = {
                                   "red_lines":[1.5],
                                   "yello_lines":["-0.5"]
                                 };
        graph_data.line = {
                            "min_x":0,
                            "max_x":6,
                            "min_y":"-2.5",
                            "mx_y":"2.5"
                          }; 
       graph_data.fl_spots = [
                                 {"x":0.3,"y":0},
                                 {"x":1.1,"y":".65"},
                                 {"x":1.5,"y":"-0.25"},
                                 {"x":2.2,"y":"0.35"},
                                 {"x":3,"y":"-0.70"},
                                 {"x":3.4,"y":0.80},
                                 {"x":3.6,"y":1},
                                 {"x":4.4,"y":1.4},
                                 {"x":5.9,"y":1}
                             ]; 
        graph_data.status=false; ///Forcelly disabled
         return graph_data;                     
      }  
      /**
       * Get Stroage graph data
       * 
       * @return battery Stroage data
       * 
      */
       stroageGraphData(data,sort,search) {
        var graph_data = {};
        graph_data.color_lines = {
                                   "red_lines":[1.5],
                                   "yello_lines":["-0.5"]
                                 };
        graph_data.line = {
                            "min_x":0,
                            "max_x":6,
                            "min_y":"-2.5",
                            "mx_y":"2.5"
                          }; 
       graph_data.fl_spots = [
                                 {"x":0.3,"y":0},
                                 {"x":1.1,"y":".65"},
                                 {"x":1.5,"y":"-0.25"},
                                 {"x":2.2,"y":"0.35"},
                                 {"x":3,"y":"-0.70"},
                                 {"x":3.4,"y":0.80},
                                 {"x":3.6,"y":1},
                                 {"x":4.4,"y":1.4},
                                 {"x":5.9,"y":1}
                             ]; 
         return graph_data;                     
      }  
      /**
       * Get Cell leakage graph data
       * 
       * @return battery Cell leakage data
       * 
      */
       cellleakageGraphData(data,sort,search) {
        var graph_data = {};
        graph_data.color_lines = {
                                   "red_lines":[1.5],
                                   "yello_lines":["-0.5"]
                                 };
        graph_data.line = {
                            "min_x":0,
                            "max_x":6,
                            "min_y":"-2.5",
                            "mx_y":"2.5"
                          }; 
       graph_data.fl_spots = [
                                 {"x":0.3,"y":0},
                                 {"x":1.1,"y":".65"},
                                 {"x":1.5,"y":"-0.25"},
                                 {"x":2.2,"y":"0.35"},
                                 {"x":3,"y":"-0.70"},
                                 {"x":3.4,"y":0.80},
                                 {"x":3.6,"y":1},
                                 {"x":4.4,"y":1.4},
                                 {"x":5.9,"y":1}
                             ]; 
         return graph_data;                     
      }  

}//end class
module.exports = new BatteryInformation;



function getMaxValue(battery_logs,index) {
  var max_val = '';
  battery_logs.forEach(batteryObject => {    
      let log_val = (typeof batteryObject[index] != 'undefined')?batteryObject[index].toFixed(2):0; 
      if(max_val == ''){
        max_val = log_val;
      }else if(max_val < log_val){
        max_val = log_val;
      }
  });
  return max_val; 
}
function getMinValue(battery_logs,index) {
  var min_val = '';
  battery_logs.forEach(batteryObject => {  
     if(typeof batteryObject[index] != 'undefined'){  
      let log_val = batteryObject[index].toFixed(2);       
      if(min_val == ''){
        min_val = log_val;
      }else if(min_val > log_val){
        min_val = log_val;
      }
    }
  });  
  return min_val;  
}

function getMinAccelerometerValue(battery_logs,index) {
  var min_val = '';
  battery_logs.forEach(batteryObject => {  
     if(typeof batteryObject['accelerometer'] != 'undefined'){  
      let log_val = batteryObject['accelerometer'][index];   
      if(min_val == ''){
        min_val = log_val;
      }else if(min_val > log_val){
        min_val = log_val;
      }
    }
  });  
  return min_val;  
}




