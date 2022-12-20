const commonObj = require('../common/cosmos');
const batteryInfoObj = require('../model/battery_information');
const commonCLI = require('common-cls');
const notificationSettingObj = require("../model/notificationSetting");
module.exports = async function (context, req) {
    //Get data from header
    var device_id = (req?.headers?.device_id) ? req.headers.device_id : '';
    var access_token = (req?.headers?.access_token) ? req.headers.access_token : '';
    //Get post data
    var serial_number = (req?.body?.serial_number) ? req.body.serial_number.trim().toLowerCase() : 'CB33C2409519';
    var info_key = (req?.body?.graph_key) ? req.body.graph_key : ''; //temp,pressure,vibration,voltage,air_quality,humidity
    var filter = (req?.body?.filter) ? req.body.filter : '';
    var action = (req?.body?.action) ? req.body.action : '';
    var fieldItem = (typeof req.body.fieldItem != 'undefined') ? req.body.fieldItem : {};
    //Global variables
    var user_id = '';
    var errors = [];
    var authorizedUser;
    var new_token = '';
    //Validations
    if (serial_number == '') {
        errors.push("Unauthorized access.");
    }
    // if ((device_id == '') || (access_token == '')) {
    //     errors.push("You are not looking authorized user.");
    // } else if (serial_number == '') {
    //     errors.push("Unauthorized access.");
    // } else {
    //     var token_data = await commonObj.authenticate(device_id, access_token);
    //     if (typeof token_data.access_token != 'undefined') {
    //         new_token = token_data.access_token;
    //         user_id = token_data.user_id;
    //     } else if (typeof token_data.user_id != 'undefined') {
    //         user_id = token_data.user_id;
    //     }
    // }
    // //Authentication check
    // if (!user_id && (errors.length <= 0)) {
    //     context.res = {
    //         status: 200,
    //         body: {
    //             status: "fail",
    //             authentication: 0,
    //             message: "Authentication failed."
    //         }
    //     };
    // } else
    if (errors.length <= 0) {
        if (action == 'field_limitation') {
            var res = await commonCLI.update({
                "containername": "battery_detail",
                "partitionkey": "id",
                "whereclouse": " WHERE ((LOWER(c.serial_number)='" + serial_number + "') OR (LOWER(c.macaddress) = '" + serial_number + "'))",
                "newitem": { "field_limit": fieldItem }
            });
            if (res > 0) {
                context.res = {
                    status: 200,
                    body: {
                        status: "success",
                        message: ["Field limitation update successfully."]
                    }
                };
            } else {
                context.res = {
                    status: 200,
                    body: {
                        status: "success",
                        message: ["Device model settings not updated successfully."]
                    }
                };
            }
        } else if (action == 'device_registered') {
            //Get device details by device serial number 
            var batteryData = await commonObj.getBatteryDetailsByID(serial_number);

            if (batteryData.length > 0) {
                context.res = {
                    status: 200,
                    body: {
                        status: "success",
                        data: true,
                        message: "Device registered."
                    }
                };
            } else {
                context.res = {
                    status: 200,
                    body: {
                        status: "success",
                        data: false,
                        message: "Device registered."
                    }
                };
            }
        } else {
            var batteryData = [];
            if (serial_number != '') {
                //Get device details by device serial number 
                batteryData = await commonObj.getBatteryDetailsByID(serial_number);
            }

            var battery_detail = [];
            var cells = [];
            var deviceFieldLimitData = [];
            //let model_data = {}; 
            let model_data = {};
            let battery_full_capacity = 0;
            if (batteryData.length > 0) {
                //Get battery logs
                var logs = await commonObj.getBatteryLogs(serial_number);
                var device_current_log = (logs[0] != undefined) ? logs[0] : '';

                var element = batteryData[0]; //Get battery information

                battery_full_capacity = (element?.battery_capacity) ? element.battery_capacity : 0;
                let out_of_balance = element?.out_of_balance ? element.out_of_balance : 0;
                let user_id = element.user_id;
                let userName = '';
                //Get user details
                var userData = await commonObj.getUserByID(user_id);
                if (userData.length > 0) {
                    userName = userData[0].first_name + ' ' + userData[0].last_name;
                }
                var last_log_data = {};
                var singlecell_capacity = 0;
                var humidityrec = 0.00;
                var humidity = 0.00;

                if (device_current_log != '') {
                    cells = device_current_log?.cells ? device_current_log.cells : [];
                    //element.cell_tempratures = (device_current_log?.temperature)?device_current_log.temperature.toFixed(2):0.00;
                    humidityrec = (device_current_log?.humidity) ? Number.parseFloat(device_current_log.humidity).toFixed(2) : 0.00;
                    humidity = (humidityrec != NaN) ? 0 : humidityrec;
                    element.pressure = (device_current_log?.pressure) ? Number.parseFloat(device_current_log.pressure).toFixed(2) : 0.00;
                    element.last_request_to_BMS = device_current_log.timestamp;
                    last_log_data = {
                        battery_status: device_current_log?.battery_status ? device_current_log.battery_status : 0,
                        ip: device_current_log?.ip_address ? device_current_log.ip_address : '',
                        date_added: device_current_log?.timestamp ? device_current_log.timestamp : '',
                        location: device_current_log?.location ? device_current_log.location : '',
                        cycles: device_current_log?.cycles ? device_current_log.cycles : '',
                        temperature: device_current_log?.temperature ? device_current_log.temperature : 0,
                        charging_status: device_current_log?.device_state ? device_current_log.device_state : '',
                        connection_type: device_current_log?.connection_type ? device_current_log.connection_type : '',
                        vibration: device_current_log?.vibration ? device_current_log.vibration : 0,
                        voltage: device_current_log?.voltage ? device_current_log.voltage : 0,
                        humidity: device_current_log?.humidity ? device_current_log.humidity : 0,
                        internal_pressure: device_current_log?.pressure ? device_current_log.pressure : 0,
                        cellVh: device_current_log?.highest_cell_voltage ? device_current_log.highest_cell_voltage : '',
                        cellVl: device_current_log?.lowest_cell_voltage ? device_current_log.lowest_cell_voltage : '',
                        diffvolt: '',
                        avgvolt: device_current_log?.average_voltage ? device_current_log.average_voltage : '',
                        packvolt: device_current_log?.voltage ? device_current_log.voltage : '',
                        powerkw: '',
                        cells: device_current_log?.total_cells ? device_current_log.total_cells : 0,
                        user_id: device_current_log?.user_id ? device_current_log.user_id : '',
                        serial_no: device_current_log?.serial_no ? device_current_log.serial_no : '',
                    };
                }
                //Set icon according to model details
                let soc_icon = 1;
                let soh_icon = 1;
                let soh = 'Healthy'; //3 Critical, 2 Need attention, 1 Healthy based on number of critical events
                let vibration_icon = 1;
                let pressure_icon = 1;
                let temprature_icon = 1;
                let voltage_icon = 1;
                let diffvolt_icon = 1; //will dynamic later
                let charge_cycle_icon = 1;
                let critical_event_icon = 1;
                let excess_heat_icon = 1;
                let over_voltage_icon = 1;
                let under_voltage_icon = 1;
                let charge_rate_icon = 1;
                let discharge_rate_icon = 1;
                let leakage_rate_icon = 1;
                let out_of_balance_icon = 1;
                let excess_cold_icon = 1;

                var fieldsData = await commonCLI.select("battery_data_fields", "SELECT * FROM battery_data_fields as c ORDER BY c.sort_order ASC");
                var model_rec = await commonCLI.select("battery_model", "SELECT * FROM battery_model as c WHERE c.id = '" + element.model_id + "'");

                var field_limit = (typeof element.field_limit != 'undefined') ? element.field_limit : {};
                var deviceFieldData = {};

                if (element.model_id != '') {
                    for (let i = 0; i < fieldsData.length; i++) {
                        let field_list = fieldsData[i];
                        var limitData = {
                            "id": field_list.id,
                            "alias": field_list.alias,
                            "lable": field_list.label,
                            "critical": { from: 0, to: 0 },
                            "need_attention": { from: 0, to: 0 },
                            "healthy": { from: 0, to: 0 }
                        };

                        if (typeof field_limit[field_list.alias] != 'undefined') {
                            limitData.critical = field_limit[field_list.alias]['critical'];
                            limitData.need_attention = field_limit[field_list.alias]['need_attention'];
                            limitData.healthy = field_limit[field_list.alias]['healthy'];
                        } else if (typeof model_rec[0][field_list.alias] != 'undefined') {
                            limitData.critical = model_rec[0][field_list.alias]['critical'];
                            limitData.need_attention = model_rec[0][field_list.alias]['need_attention'];
                            limitData.healthy = model_rec[0][field_list.alias]['healthy'];
                        }

                        model_data[field_list.alias] = limitData;
                    }


                    for (var i in model_data) {
                        let mda = {};
                        let valType = typeof model_data[i];
                        if (valType == 'object') {
                            mda = model_data[i];
                            mda['alias'] = i;
                            deviceFieldLimitData.push(mda);
                        }
                    }

                }

                //Check for model data and update required information
                if (model_data != '') {
                    singlecell_capacity = (model_data.single_cell_full_capacity != 'undefined') ? model_data.single_cell_full_capacity : 0;
                    total_cells = (model_data.total_cells != 'undefined') ? model_data.total_cells : 0;
                    model_name = (model_data.model_name != 'undefined') ? model_data.model_name : '';
                    ///Set voltage_icon
                    if (typeof model_data.pack_volt_high != 'undefined') {
                        if (element.voltage >= model_data.pack_volt_high.critical) {
                            voltage_icon = 3;
                        } else if ((element.voltage < model_data.pack_volt_high.critical) && (element.voltage >= model_data.pack_volt_high.need_attention)) {
                            voltage_icon = 2;
                        } else if ((element.voltage >= model_data.pack_volt_high.healthy) && (element.voltage < model_data.pack_volt_high.need_attention)) {
                            voltage_icon = 1;
                        } else if ((element.voltage < model_data.pack_volt_low.healthy) && (element.voltage > model_data.pack_volt_low.need_attention)) {
                            voltage_icon = 2;
                        } else if ((element.voltage > model_data.pack_volt_low.need_attention) && (element.voltage <= model_data.pack_volt_low.critical)) {
                            voltage_icon = 3;
                        } else {
                            voltage_icon = 3;
                        }
                    }
                    //Set soc_icon
                    if (typeof model_data.capacity != 'undefined') {
                        if ((element.state_of_charge <= model_data.capacity.critical)) {
                            soc_icon = 3;
                        } else if ((element.state_of_charge > model_data.capacity.need_attention) && (element.state_of_charge > model_data.capacity.critical)) {
                            soc_icon = 2;
                        }
                    }
                    //set soh_icon and soh
                    if (element.status == 0) {
                        soh_icon = 1;
                        critical_event_icon = 1;
                        soh = 'Healthy';
                    } else if (element.status == 1) {
                        soh_icon = 2;
                        critical_event_icon = 2;
                        soh = 'Need Attention';
                    } else if (element.status == 2) {
                        soh_icon = 3;
                        critical_event_icon = 3;
                        soh = 'Critical';
                    }
                    //Set vibration_icon
                    if (typeof model_data.vibration != 'undefined') {
                        if (element.vibration >= model_data.vibration.critical) {
                            vibration_icon = 3;
                        } else if ((element.vibration < model_data.vibration.critical) && (element.vibration >= model_data.vibration.need_attention)) {
                            vibration_icon = 2;
                        }
                    }
                    //Set pressure_icon
                    if (typeof model_data.pressure != 'undefined') {
                        if (element.pressure >= model_data.pressure.critical) {
                            pressure_icon = 3;
                        } else if ((element.pressure < model_data.pressure.critical) && (element.pressure >= model_data.pressure.need_attention)) {
                            pressure_icon = 2;
                        }
                    }
                    //Set temprature_icon icon
                    if (typeof model_data.temperature != 'undefined') {
                        if (element.temperature >= model_data.temperature.critical) {
                            temprature_icon = 3;
                        } else if ((element.temperature < model_data.temperature.critical) && (element.temperature >= model_data.temperature.need_attention)) {
                            temprature_icon = 2;
                        }
                    }
                    //Set charge_cycle_icon
                    if (typeof model_data.cycle_count != 'undefined') {
                        if (element.cycle >= model_data.cycle_count.critical) {
                            charge_cycle_icon = 3;
                        } else if ((element.cycle < model_data.cycle_count.critical) && element.cycle >= model_data.cycle_count.need_attention) {
                            charge_cycle_icon = 2;
                        }
                    }
                    //Set discharge_rate_icon 
                    if (typeof model_data.discharge_rate != 'undefined') {
                        if (element.discharge_rate >= model_data.discharge_rate.critical) {
                            discharge_rate_icon = 3;
                        } else if ((element.discharge_rate < model_data.discharge_rate.critical) && (element.discharge_rate >= model_data.discharge_rate.need_attention)) {
                            discharge_rate_icon = 2;
                        }
                    }
                    //Excess Heat Icon 
                    if (typeof model_data.excess_heat != 'undefined') {
                        if (element.excess_heat >= model_data.excess_heat.critical) {
                            excess_heat_icon = 3;
                        } else if ((element.excess_heat < model_data.excess_heat.critical) && (element.excess_heat >= model_data.excess_heat.need_attention)) {
                            excess_heat_icon = 2;
                        }
                    }
                    //Over Voltage Icon 
                    if (typeof model_data.over_voltage != 'undefined') {
                        if (element.over_voltage >= model_data.over_voltage.critical) {
                            over_voltage_icon = 3;
                        } else if ((element.over_voltage < model_data.over_voltage.critical) && (element.over_voltage >= model_data.over_voltage.need_attention)) {
                            over_voltage_icon = 2;
                        }
                    }
                    //Under Voltage Icon 
                    if (typeof model_data.under_voltage != 'undefined') {
                        if (element.under_voltage >= model_data.under_voltage.critical) {
                            under_voltage_icon = 3;
                        } else if ((element.under_voltage < model_data.under_voltage.critical) && (element.under_voltage >= model_data.under_voltage.need_attention)) {
                            under_voltage_icon = 2;
                        }
                    }
                    //Charge Rate Icon 
                    if (typeof model_data.charge_rate != 'undefined') {
                        if (element.charge_rate >= model_data.charge_rate.critical) {
                            charge_rate_icon = 3;
                        } else if ((element.charge_rate < model_data.charge_rate.critical) && (element.charge_rate >= model_data.charge_rate.need_attention)) {
                            charge_rate_icon = 2;
                        }
                    }
                    //Discharge Rate Icon 
                    if (typeof model_data.discharge_rate != 'undefined') {
                        if (element.discharge_rate >= model_data.discharge_rate.critical) {
                            discharge_rate_icon = 3;
                        } else if ((element.discharge_rate < model_data.discharge_rate.critical) && (element.discharge_rate >= model_data.discharge_rate.need_attention)) {
                            discharge_rate_icon = 2;
                        }
                    }
                    //Discharge Rate Icon 
                    if (typeof model_data.leakage_rate != 'undefined') {
                        if (element.cell_leakage >= model_data.leakage_rate.critical) {
                            leakage_rate_icon = 3;
                        } else if ((element.cell_leakage < model_data.leakage_rate.critical) && (element.cell_leakage >= model_data.leakage_rate.need_attention)) {
                            leakage_rate_icon = 2;
                        }
                    }
                    //Out of balance Icon 
                    if (typeof model_data.out_of_balance != 'undefined') {
                        if (out_of_balance >= model_data.out_of_balance.critical) {
                            out_of_balance_icon = 3;
                        } else if ((out_of_balance < model_data.out_of_balance.critical) && (out_of_balance >= model_data.out_of_balance.need_attention)) {
                            out_of_balance_icon = 2;
                        }
                    }
                    //Out of balance Icon 
                    if (typeof model_data.excess_cold != 'undefined') {
                        if (element.excess_cold >= model_data.excess_cold.critical) {
                            excess_cold_icon = 3;
                        } else if ((element.excess_cold < model_data.excess_cold.critical) && (element.excess_cold >= model_data.excess_cold.need_attention)) {
                            excess_cold_icon = 2;
                        }
                    }
                }
                ///Set data for battery details
                let last_assigned_to_user = '06/30/2022';
                //let fTemp = (element?.cell_tempratures)?(element.cell_tempratures*(9/5)+32).toFixed(2):0;
                let fTemp = (element?.temperature) ? element.temperature.toFixed(2) : 0.00;
                let rsrp = 'Good';
                if (element.rsrp > -90) {
                    rsrp = 'Excellent';
                } else if (element.rsrp > -105 && element.rsrp < -90) {
                    rsrp = 'Good';
                } else if (element.rsrp > -120 && element.rsrp < -106) {
                    rsrp = 'Fair';
                } else if (element.rsrp < -120) {
                    rsrp = 'Poor';
                }
                var volt = (element.voltage > 1000) ? element.voltage / 1000 : element.voltage;
                battery_detail = {
                    id: element?.id ? element.id : '',
                    model_name: element?.model_name ? element.model_name : '',
                    device_type: element?.device_type ? element.device_type : '',
                    model_id: element?.model_id ? element.model_id : '',
                    user_id: user_id,
                    userName: userName,
                    serial_number: element?.serial_number ? element.serial_number : element.macaddress,
                    firmware_version: element?.firmware_version ? element.firmware_version : '',
                    company_name: element?.company_name ? element.company_name : '',
                    battery_status: element?.status ? element.status : 0, //enabled or dead
                    assigned_on: last_assigned_to_user,
                    battery_override: '',
                    manufacturer: element?.company_name ? element.company_name : '',
                    soc: element?.state_of_charge ? element.state_of_charge : 0.00,
                    soc_icon: soc_icon,
                    soh_icon: soh_icon,
                    soh: soh,
                    full_capacity: element.full_capacity,
                    assigned_to: userName,
                    vibration: element?.vibration ? element.vibration.toFixed(2) : 0.00,
                    vibration_icon: vibration_icon,
                    pressure: element?.pressure ? element.pressure : 0.00,
                    pressure_icon: pressure_icon,
                    temprature: fTemp,
                    temprature_icon: temprature_icon,
                    voltage: volt ? volt : 0,
                    voltage_icon: voltage_icon,
                    diffvolt: '',
                    diffvolt_icon: diffvolt_icon,
                    over_current_charge: '',
                    over_current_discharge: '',
                    charge_cycle: element?.charge_cycle ? element.charge_cycle : 0,
                    charge_cycle_icon: charge_cycle_icon,
                    critical_event: element?.critical_event ? element.critical_event : 0,
                    critical_event_icon: critical_event_icon,
                    storage_time: element?.storage_time ? element.storage_time : '',
                    charge_rate: element?.charge_rate ? element.charge_rate : 0,
                    charge_rate_icon: charge_rate_icon,
                    discharge_rate: element?.discharge_rate ? element.discharge_rate : 0,
                    discharge_rate_icon: discharge_rate_icon,
                    remaining_hours: 0,
                    last_scan_date: element?.last_request_to_BMS ? element.last_request_to_BMS : '',
                    battery_log: last_log_data,
                    excess_heat: element?.excess_heat ? element.excess_heat : '',
                    excess_heat_icon: excess_heat_icon,
                    excess_cold: element?.excess_cold ? element.excess_cold : '',
                    excess_cold_icon: excess_cold_icon,
                    charging_status: element.charging_status ? element.charging_status : '',
                    over_voltage_icon: over_voltage_icon,
                    over_voltage: element?.over_voltage ? element.over_voltage : '',
                    under_voltage_icon: under_voltage_icon,
                    under_voltage: element?.under_voltage ? element.under_voltage : '',
                    leakage_rate_icon: leakage_rate_icon,
                    cell_leakage: element?.cell_leakage ? element.cell_leakage : '',
                    out_of_balance: out_of_balance,
                    out_of_balance_icon: out_of_balance_icon,
                    model_info: deviceFieldLimitData,
                    //model_info:model_data,
                    //field_limit:deviceFieldLimitData,
                    humidity: humidity,
                    network: element?.nw ? element.nw : 'LTE-M',
                    band: element?.band ? element.band : 0,
                    ip_address: element?.ip ? element.ip : 'Not Available',
                    signal_strength: rsrp
                };

            }

            // console.log('!!!!!!!!!!model_data!!!!!!!!!!!!!!!!!!');
            // console.log(model_data);

            ///Add cell information
            battery_detail.cells = batteryInfoObj.getCellsData(cells, singlecell_capacity);
            if (info_key != '') {
                var graphs = {};
                for (var i in info_key.split(',')) {
                    let graph_type = info_key.split(',')[i];
                    switch (graph_type.toLowerCase()) {

                        case 'temp':
                            var logs = await commonObj.getBatteryLogs(serial_number, '', 'temperature');
                            graphs.temp = batteryInfoObj.tempratureGraphData(logs, model_data);
                            break;
                        case 'acc':
                            var logs = await commonObj.getBatteryLogs(serial_number, '', 'accelerometer');                            
                            graphs.acc = batteryInfoObj.accelerometerGraphData(logs, model_data);
                            break;    
                        case 'pressure':
                            var logs = await commonObj.getBatteryLogs(serial_number, '', 'pressure');
                            graphs.pressure = batteryInfoObj.pressurGraphData(logs, model_data);
                            break;
                        case 'vibration':
                            var logs = await commonObj.getBatteryLogs(serial_number, '', 'vibration');
                            graphs.vibration = batteryInfoObj.vibrationGraphData(logs, model_data);
                            break;
                        case 'voltage':
                            var logs = await commonObj.getBatteryLogs(serial_number, '', 'voltage');
                            graphs.voltage = batteryInfoObj.voltageGraphData(logs, model_data, battery_full_capacity);
                            break;
                        case 'air_quality':
                            var logs = await commonObj.getBatteryLogs(serial_number, '', 'air_quality');
                            graphs.air_quality = batteryInfoObj.airQualityGraphData(logs, model_data);
                            break;
                        case 'humidity':
                            var logs = await commonObj.getBatteryLogs(serial_number, '', 'humidity');
                            graphs.humidity = batteryInfoObj.humidityGraphData(logs, model_data);
                            break;
                        case 'charge':
                            graphs.charge = batteryInfoObj.chargeGraphData();
                            break;
                        default:
                            break;
                    }
                };
                battery_detail.graph = graphs;
            }

            if (battery_detail != '') {
                //Return response
                context.res = {
                    status: 200, /* Defaults to 200 */
                    body: {
                        body_data: req.body,
                        status: "success",
                        data: battery_detail,
                        message: "Record fetched successfully."
                    }
                };
                //Add new access token
                if (new_token != '') {
                    context.res.body.new_token = new_token;
                }
            }
            else {
                //Return response
                context.res = {
                    status: 200, /* Defaults to 200 */
                    body: {
                        status: "fail",
                        message: "Record not exist"
                    }
                };
                //Add new access token
                if (new_token != '') {
                    context.res.body.new_token = new_token;
                }
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
