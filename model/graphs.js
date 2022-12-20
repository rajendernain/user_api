
class GraphInformation {
  
  /**
   * Get Temprature graph data
   * 
   * @return battery temprature data
   * 
  */
   tempratureGraphData(data,sort,search) {
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
   * Get Pressor graph data
   * 
   * @return battery pressor data
   * 
  */
    pressurGraphData(data,sort,search) {
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
                               {"x":1.8,"y":"-0.25"},
                               {"x":2.4,"y":"0.35"},
                               {"x":3,"y":"-0.70"},
                               {"x":3.4,"y":0.80},
                               {"x":3.9,"y":1},
                               {"x":4.4,"y":1.4},
                               {"x":5.5,"y":1}
                           ]; 
       return graph_data;                     
    }
    /**
   * Get Vibration graph data
   * 
   * @return battery vibration data
   * 
  */
    vibrationGraphData(data,sort,search) {
    var graph_data = {};
    /*graph_data.color_lines = {
                               "red_lines":"-2,2",
                               "yello_lines":"-3,3"
                             };*/
      graph_data.color_lines = {
                              "red_lines":["-2",2],
                              "yello_lines":["-3",3]
                            };                         
    graph_data.line = {
                        "min_x":0,
                        "max_x":6,
                        "min_y":"-4",
                        "mx_y":"4"
                      }; 
   graph_data.fl_spots = [
                             {"x":0,"y":0},
                             {"x":0.4,"y":0},
                             {"x":0.6,"y":"-0.4"},
                             {"x":0.7,"y":0.5},
                             {"x":1.2,"y":"-0.7"},
                             {"x":1.4,"y":0.8},
                             {"x":1.5,"y":"-0.9"},
                             {"x":1.8,"y":"1.3"},
                             {"x":2,"y":"-1.4"},
                             {"x":2.3,"y":"1.7"},
                             {"x":2.6,"y":"-1.7"},
                             {"x":2.9,"y":"2"},
                             {"x":3.2,"y":"-2"},
                             {"x":3.6,"y":"1.7"},
                             {"x":3.8,"y":"-1.7"},
                             {"x":4,"y":"1.4"},
                             {"x":4.3,"y":"-1.4"},
                             {"x":4.6,"y":"0.9"},
                             {"x":4.8,"y":"-0.9"},
                             {"x":5,"y":"0"},
                             {"x":5.3,"y":"0"},
                             {"x":5.6,"y":"-0.4"},
                             {"x":5.8,"y":"0.5"},
                             {"x":6,"y":"0"}
                         ]; 
     return graph_data;                     
  }
  /**
   * Get Voltage graph data
   * 
   * @return battery voltage data
   * 
  */
   voltageGraphData(data,sort,search) {
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
   chargeGraphData(data,sort,search) {
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
   getCellsData(data) {
     var cells = [
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
        return cells;
   }
   /**
   * Get client graph data
   * 
   * @return client graph data
   * 
  */
 getClientData(days){
    var graph_data = {};
    switch(days){
      case 1:
        graph_data = {"subscribed":1,"free":3};
      break;
      case 7:
        graph_data = {"subscribed":10,"free":30};
      break;
      case 30:
        graph_data = {"subscribed":50,"free":70};
      break;
    }
    return graph_data;
 }
 /**
   * Get devices graph data
   * 
   * @return devices graph data
   * 
  */
  getDevicesGraphData(week){
    var graph_data = {};
    switch(week){
      case 1:
        graph_data.line = {                        
                            "min_y":0,
                            "mx_y":4
                          }; 
        graph_data.fl_spots = {"total":{"x":1,"y":[3.5,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
      case 2:
        graph_data.line = {                        
          "min_y":0,
          "mx_y":4
        };
        graph_data.fl_spots = {"total":{"x":1,"y":[3.7,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
      case 3:
        graph_data.line = {                        
          "min_y":0,
          "mx_y":4
        };
        graph_data.fl_spots = {"total":{"x":1,"y":[3.5,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
      case 4:
        graph_data.line = {                        
          "min_y":0,
          "mx_y":4
        };
        graph_data.fl_spots = {"total":{"x":1,"y":[3.8,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
      case 5:
        graph_data.line = {                        
          "min_y":0,
          "mx_y":4
        };
        graph_data.fl_spots = {"total":{"x":1,"y":[3.5,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
      case 6:
        graph_data.line = {                        
          "min_y":0,
          "mx_y":4
        };
        graph_data.fl_spots = {"total":{"x":1,"y":[3.9,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
      case 7:
        graph_data.line = {                        
          "min_y":0,
          "mx_y":4
        };
        graph_data.fl_spots = {"total":{"x":1,"y":[4,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
      case 8:
        graph_data.line = {                        
          "min_y":0,
          "mx_y":4
        };
        graph_data.fl_spots = {"total":{"x":1,"y":[3.7,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
      case 9:
        graph_data.line = {                        
          "min_y":0,
          "mx_y":4
        };
        graph_data.fl_spots = {"total":{"x":1,"y":[3.1,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
      case 10:
        graph_data.line = {                        
          "min_y":0,
          "mx_y":4
        };
        graph_data.fl_spots = {"total":{"x":1,"y":[2.5,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
      case 11:
        graph_data.line = {                        
          "min_y":0,
          "mx_y":4
        };
        graph_data.fl_spots = {"total":{"x":1,"y":[2.3,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
      case 12:
        graph_data.line = {                        
          "min_y":0,
          "mx_y":4
        };
        graph_data.fl_spots = {"total":{"x":1,"y":[4,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
      case 13:
        graph_data.line = {                        
          "min_y":0,
          "mx_y":4
        };
        graph_data.fl_spots = {"total":{"x":1,"y":[1.5,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
      case 14:
        graph_data.line = {                        
          "min_y":0,
          "mx_y":4
        };
        graph_data.fl_spots = {"total":{"x":1,"y":[2.5,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
      case 15:
        graph_data.line = {                        
          "min_y":0,
          "mx_y":4
        };
        graph_data.fl_spots = {"total":{"x":1,"y":[3.5,3,2.2,1.5]},"enrolled":{"x":2,"y":[3.5,3,2.2,1.5]},"not_enrolled":{"x":3,"y":[3.5,3,2.2,1.5]},"recycling":{"x":4,"y":[3.5,3,2.2,1.5]}};
      break;
    }
    return graph_data;
  }
  /**
   * Get devices fault activity graph data
   * 
   * @return devices fault activity graph data
   * 
  */
 deviceFaultActivity(week){
  var graph_data = {};
  switch(week){
    case 1:
      graph_data.line = {
        "min_x":0,
        "max_x":6,
        "min_y":0,
        "mx_y":6
      }; 
      graph_data.fl_spots = {"voltage":[{"x":0.6,"y":0.3},{"x":0.8,"y":0.9},{"x":1.3,"y":1},{"x":1.6,"y":2.6},{"x":2.5,"y":2.6},{"x":3.5,"y":3.6}],
                             "pressure":[{"x":0.3,"y":1.2},{"x":0.9,"y":1.5},{"x":2,"y":1.1},{"x":3,"y":2},{"x":3.7,"y":2.4}],
                             "high_temprature":[{"x":0.3,"y":2.2},{"x":1.6,"y":1.3},{"x":2.7,"y":1.8},{"x":3.2,"y":2},{"x":2.9,"y":2.3},{"x":3,"y":1.7},{"x":3.7,"y":5}]
                            };
    break;
    case 2:
      graph_data.line = {
        "min_x":0,
        "max_x":6,
        "min_y":0,
        "mx_y":6
      }; 
      graph_data.fl_spots = {"voltage":[{"x":0.6,"y":0.3},{"x":0.8,"y":0.9},{"x":1.3,"y":1},{"x":1.6,"y":2.6},{"x":2.5,"y":2.6},{"x":3.5,"y":3.6}],
                             "pressure":[{"x":0.3,"y":1.2},{"x":0.9,"y":1.5},{"x":2,"y":1.1},{"x":3,"y":2},{"x":3.7,"y":2.4}],
                             "high_temprature":[{"x":0.3,"y":2.2},{"x":1.6,"y":1.3},{"x":2.7,"y":1.8},{"x":3.2,"y":2},{"x":2.9,"y":2.3},{"x":3,"y":1.7},{"x":3.7,"y":5}]
                            };
    break;
    case 3:
      graph_data.line = {
        "min_x":0,
        "max_x":6,
        "min_y":0,
        "mx_y":6
      }; 
      graph_data.fl_spots = {"voltage":[{"x":0.6,"y":0.3},{"x":0.8,"y":0.9},{"x":1.3,"y":1},{"x":1.6,"y":2.6},{"x":2.5,"y":2.6},{"x":3.5,"y":3.6}],
                             "pressure":[{"x":0.3,"y":1.2},{"x":0.9,"y":1.5},{"x":2,"y":1.1},{"x":3,"y":2},{"x":3.7,"y":2.4}],
                             "high_temprature":[{"x":0.3,"y":2.2},{"x":1.6,"y":1.3},{"x":2.7,"y":1.8},{"x":3.2,"y":2},{"x":2.9,"y":2.3},{"x":3,"y":1.7},{"x":3.7,"y":5}]
                            };
    break;
    case 4:
      graph_data.line = {
        "min_x":0,
        "max_x":6,
        "min_y":0,
        "mx_y":6
      }; 
      graph_data.fl_spots = {"voltage":[{"x":0.6,"y":0.3},{"x":0.8,"y":0.9},{"x":1.3,"y":1},{"x":1.6,"y":2.6},{"x":2.5,"y":2.6},{"x":3.5,"y":3.6}],
                             "pressure":[{"x":0.3,"y":1.2},{"x":0.9,"y":1.5},{"x":2,"y":1.1},{"x":3,"y":2},{"x":3.7,"y":2.4}],
                             "high_temprature":[{"x":0.3,"y":2.2},{"x":1.6,"y":1.3},{"x":2.7,"y":1.8},{"x":3.2,"y":2},{"x":2.9,"y":2.3},{"x":3,"y":1.7},{"x":3.7,"y":5}]
                            };
    break;
    case 5:
      graph_data.line = {
        "min_x":0,
        "max_x":6,
        "min_y":0,
        "mx_y":6
      }; 
      graph_data.fl_spots = {"voltage":[{"x":0.6,"y":0.3},{"x":0.8,"y":0.9},{"x":1.3,"y":1},{"x":1.6,"y":2.6},{"x":2.5,"y":2.6},{"x":3.5,"y":3.6}],
                             "pressure":[{"x":0.3,"y":1.2},{"x":0.9,"y":1.5},{"x":2,"y":1.1},{"x":3,"y":2},{"x":3.7,"y":2.4}],
                             "high_temprature":[{"x":0.3,"y":2.2},{"x":1.6,"y":1.3},{"x":2.7,"y":1.8},{"x":3.2,"y":2},{"x":2.9,"y":2.3},{"x":3,"y":1.7},{"x":3.7,"y":5}]
                            };
    break;
    case 6:
      graph_data.line = {
        "min_x":0,
        "max_x":6,
        "min_y":0,
        "mx_y":6
      }; 
      graph_data.fl_spots = {"voltage":[{"x":0.6,"y":0.3},{"x":0.8,"y":0.9},{"x":1.3,"y":1},{"x":1.6,"y":2.6},{"x":2.5,"y":2.6},{"x":3.5,"y":3.6}],
                             "pressure":[{"x":0.3,"y":1.2},{"x":0.9,"y":1.5},{"x":2,"y":1.1},{"x":3,"y":2},{"x":3.7,"y":2.4}],
                             "high_temprature":[{"x":0.3,"y":2.2},{"x":1.6,"y":1.3},{"x":2.7,"y":1.8},{"x":3.2,"y":2},{"x":2.9,"y":2.3},{"x":3,"y":1.7},{"x":3.7,"y":5}]
                            };
    break;
    case 7:
      graph_data.line = {
        "min_x":0,
        "max_x":6,
        "min_y":0,
        "mx_y":6
      }; 
      graph_data.fl_spots = {"voltage":[{"x":0.6,"y":0.3},{"x":0.8,"y":0.9},{"x":1.3,"y":1},{"x":1.6,"y":2.6},{"x":2.5,"y":2.6},{"x":3.5,"y":3.6}],
                             "pressure":[{"x":0.3,"y":1.2},{"x":0.9,"y":1.5},{"x":2,"y":1.1},{"x":3,"y":2},{"x":3.7,"y":2.4}],
                             "high_temprature":[{"x":0.3,"y":2.2},{"x":1.6,"y":1.3},{"x":2.7,"y":1.8},{"x":3.2,"y":2},{"x":2.9,"y":2.3},{"x":3,"y":1.7},{"x":3.7,"y":5}]
                            };
    break;
    case 8:
      graph_data.line = {
        "min_x":0,
        "max_x":6,
        "min_y":0,
        "mx_y":6
      }; 
      graph_data.fl_spots = {"voltage":[{"x":0.6,"y":0.3},{"x":0.8,"y":0.9},{"x":1.3,"y":1},{"x":1.6,"y":2.6},{"x":2.5,"y":2.6},{"x":3.5,"y":3.6}],
                             "pressure":[{"x":0.3,"y":1.2},{"x":0.9,"y":1.5},{"x":2,"y":1.1},{"x":3,"y":2},{"x":3.7,"y":2.4}],
                             "high_temprature":[{"x":0.3,"y":2.2},{"x":1.6,"y":1.3},{"x":2.7,"y":1.8},{"x":3.2,"y":2},{"x":2.9,"y":2.3},{"x":3,"y":1.7},{"x":3.7,"y":5}]
                            };
    break;
    case 9:
      graph_data.line = {
        "min_x":0,
        "max_x":6,
        "min_y":0,
        "mx_y":6
      }; 
      graph_data.fl_spots = {"voltage":[{"x":0.6,"y":0.3},{"x":0.8,"y":0.9},{"x":1.3,"y":1},{"x":1.6,"y":2.6},{"x":2.5,"y":2.6},{"x":3.5,"y":3.6}],
                             "pressure":[{"x":0.3,"y":1.2},{"x":0.9,"y":1.5},{"x":2,"y":1.1},{"x":3,"y":2},{"x":3.7,"y":2.4}],
                             "high_temprature":[{"x":0.3,"y":2.2},{"x":1.6,"y":1.3},{"x":2.7,"y":1.8},{"x":3.2,"y":2},{"x":2.9,"y":2.3},{"x":3,"y":1.7},{"x":3.7,"y":5}]
                            };
    break;
    case 10:
      graph_data.line = {
        "min_x":0,
        "max_x":6,
        "min_y":0,
        "mx_y":6
      }; 
      graph_data.fl_spots = {"voltage":[{"x":0.6,"y":0.3},{"x":0.8,"y":0.9},{"x":1.3,"y":1},{"x":1.6,"y":2.6},{"x":2.5,"y":2.6},{"x":3.5,"y":3.6}],
                             "pressure":[{"x":0.3,"y":1.2},{"x":0.9,"y":1.5},{"x":2,"y":1.1},{"x":3,"y":2},{"x":3.7,"y":2.4}],
                             "high_temprature":[{"x":0.3,"y":2.2},{"x":1.6,"y":1.3},{"x":2.7,"y":1.8},{"x":3.2,"y":2},{"x":2.9,"y":2.3},{"x":3,"y":1.7},{"x":3.7,"y":5}]
                            };
    break;
  }
  return graph_data
 }
 /**
   * Get devices high temprature graph data
   * 
   * @return devices high temprature graph data
   * 
  */
  deviceHighTemprature(week){
    var graph_data = {};
    switch(week){
      case 1:
        graph_data.color_lines = {
          "red_lines":[3],
          "yello_lines":[2.5]
        };
        graph_data.line = {
          "min_x":0,
          "max_x":6,
          "min_y":0,
          "mx_y":4
        }; 
        graph_data.fl_spots = {"x":0.4,"y":0.4},{"x":1.9,"y":3.6},{"x":2.2,"y":1},{"x":2.8,"y":3.3},{"x":3.3,"y":1.2},{"x":3.6,"y":2.9},{"x":3.9,"y":1.6},{"x":4.3,"y":2.6};
      break;
    }
  }
   /**
   * Get devices high temprature graph data
   * 
   * @return devices high temprature graph data
   * 
  */
    devicePressure(week){
      var graph_data = {};
      switch(week){
        case 1:
          graph_data.color_lines = {
            "red_lines":[3],
            "yello_lines":[2.5]
          };
          graph_data.line = {
            "min_x":0,
            "max_x":6,
            "min_y":0,
            "mx_y":4
          }; 
          graph_data.fl_spots = {"x":0.4,"y":0.4},{"x":1.9,"y":3.6},{"x":2.2,"y":1},{"x":2.8,"y":3.3},{"x":3.3,"y":1.2},{"x":3.6,"y":2.9},{"x":3.9,"y":1.6},{"x":4.3,"y":2.6};
        break;
      }
    }
     /**
   * Get devices high temprature graph data
   * 
   * @return devices high temprature graph data
   * 
  */
  deviceVoltage(week){
    var graph_data = {};
    switch(week){
      case 1:
        graph_data.color_lines = {
          "red_lines":[3],
          "yello_lines":[2.5]
        };
        graph_data.line = {
          "min_x":0,
          "max_x":6,
          "min_y":0,
          "mx_y":4
        }; 
        graph_data.fl_spots = {"x":0.4,"y":0.4},{"x":1.9,"y":3.6},{"x":2.2,"y":1},{"x":2.8,"y":3.3},{"x":3.3,"y":1.2},{"x":3.6,"y":2.9},{"x":3.9,"y":1.6},{"x":4.3,"y":2.6};
      break;
    }
  }
}//end class
module.exports = new GraphInformation;