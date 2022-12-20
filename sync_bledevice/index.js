const commonObj = require('../common/cosmos');
const commonCLI = require('common-cls');
const crypto = require('crypto');
commonCLI.init(process.env["COSMOS_DB_URL"], process.env["COSMOS_DB_RESOURCE_KEY"], process.env["COSMOS_DB_NAME"], process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {
    if (req.body != '') { //Start if       
        var log_data = req.body;
        let qry = "SELECT * FROM battery_detail as c WHERE LOWER(c.macaddress) = LOWER('" + log_data.mac_address + "') ";
        let batteryRecord = await commonCLI.select("battery_detail", qry);

        var logData = {};
        var batteryLogJson = {};

        if (batteryRecord.length > 0) {
            if (batteryRecord[0]['id'] != null) {
                logData.battery_id = batteryRecord[0]['id'];
            }
            if (batteryRecord[0]['serial_number'] != null) {
                logData.serial_no = batteryRecord[0]['serial_number'];
            }
        }
        if (log_data.mac_address != null) {
            logData.mac_address = log_data.mac_address;
            logData.connection_type = 'BLE';
            logData.timestamp = log_data.timestamp;
            logData.critical = false;
        }
        if (log_data.is_memory_log != null) {
            logData.is_memory_log = log_data.is_memory_log;
        }
        if (log_data.temp != null) {
            logData.temperature = Number(log_data.temp);
            batteryLogJson.temperature = Number(log_data.temp);
        }
        if (log_data.hum != null && parseFloat(log_data.hum) > 0) {
            logData.humidity = Number(log_data.hum);
        }
        if (log_data.atmp != null && parseFloat(log_data.atmp) > 0) {
            logData.pressure = Number(log_data.atmp);
        }
        if (log_data.bsec_iaq != null && parseFloat(log_data.bsec_iaq) > 0) {
            logData.air_quality = Number(log_data.bsec_iaq);
        }
        if (log_data.vibration != null) {
            logData.vibration = Number(log_data.vibration);
            batteryLogJson.vibration = Number(log_data.vibration);
        }
        if (log_data.red != null && parseFloat(log_data.red) > 0) {
            logData.red = log_data.red;
        }
        if (log_data.green != null && parseFloat(log_data.green) > 0) {
            logData.green = log_data.green;
        }
        if (log_data.blue != null && parseFloat(log_data.blue) > 0) {
            logData.blue = log_data.blue;
        }
        if (log_data.ir_sensor != null && parseFloat(log_data.ir_sensor) > 0) {
            logData.ir_sensor = log_data.ir_sensor;
        }
        if (log_data.bms_pack_ampere != null) {
            logData.bms_pack_ampere = log_data.bms_pack_ampere;
            batteryLogJson.discharge_rate = log_data.bms_pack_ampere;
        }
        if (log_data.highest_cell_voltage != null) {
            logData.highest_cell_voltage = log_data.highest_cell_voltage;
        }
        if (log_data.lowest_cell_voltage != null) {
            logData.lowest_cell_voltage = log_data.lowest_cell_voltage;
        }
        if (log_data.highest_battery_temp != null) {
            logData.highest_battery_temp = log_data.highest_battery_temp;
        }
        if (log_data.lowest_battery_temp != null) {
            logData.lowest_battery_temp = log_data.lowest_battery_temp;
        }
        if (log_data.acc != null) {
            logData.accelerometer = log_data.acc;
        }
        if (log_data.imu != null) {
            logData.imu = log_data.imu;
        }
        if (log_data.average_temp != null) {
            logData.average_temp = log_data.average_temp;
        }
        if (log_data.bms_pack_voltage != null) {
            logData.voltage = Number(log_data.bms_pack_voltage);
            batteryLogJson.voltage = Number(log_data.bms_pack_voltage);
        }
        if (log_data.bms_state_of_charge != null) {
            logData.bms_state_of_charge = log_data.bms_state_of_charge;
            batteryLogJson.state_of_charge = log_data.bms_state_of_charge;
        }
        if (log_data.lowest_voltage_cell_no != null) {
            logData.lowest_voltage_cell_no = log_data.lowest_voltage_cell_no;
        }
        if (log_data.highest_voltage_cell_no != null) {
            logData.highest_voltage_cell_no = log_data.highest_voltage_cell_no;
        }
        if (log_data.highest_temp_cell_no != null) {
            logData.highest_temp_cell_no = log_data.highest_temp_cell_no;
        }
        if (log_data.lowest_temp_cell_no != null) {
            logData.lowest_temp_cell_no = log_data.lowest_temp_cell_no;
        }
        if (log_data.bms_life != null) {
            logData.bms_life = log_data.bms_life;
            batteryLogJson.charge_cycle = log_data.bms_life;
        }
        if (log_data.total_cells != null) {
            logData.total_cells = log_data.total_cells;
        }
        if (log_data.total_temp_sensors != null) {
            logData.total_temp_sensors = log_data.total_temp_sensors;
        }
        if (log_data.charger_status != null) {
            logData.charger_status = log_data.charger_status;
        }
        if (log_data.load_status != null) {
            logData.load_status = log_data.load_status;
        }
        if (log_data.average_voltage != null) {
            logData.average_voltage = log_data.average_voltage;
        }
        if (log_data.device_state != null) {
            logData.device_state = log_data.device_state;
            batteryLogJson.charging_status = log_data.device_state;
        }
        if (log_data.cell_balance_state != null) {
            logData.cell_balance_state = log_data.cell_balance_state;
            //batteryLogJson.out_of_balance=log_data.cell_balance_state;       
            batteryLogJson.out_of_balance = 0;
        }
        if (log_data.fault_code != null) {
            logData.fault_code = log_data.fault_code;
        }
        if (log_data.lat != null) {
            logData.lat = log_data.lat;
            batteryLogJson.lat = log_data.lat;
        }
        if (log_data.long != null) {
            logData.long = log_data.long;
            batteryLogJson.long = log_data.long;
        }
        //Insert log data in logs and battery details table
        if (log_data.mac_address != null) {
            var randomStr = crypto.randomUUID;
            logData.random_key = randomStr;
            commonCLI.insert("battery_logs", logData);
            if (batteryRecord.length > 0) {
                await commonObj.updateBattery(batteryRecord[0]['id'], batteryLogJson);
            }
            context.res = {
                status: 200,
                body: {
                    Status: "success", //success, fail
                    Data: randomStr,
                    Message: 'Record updated successfully.',
                }
            };
        }
    } else {
        context.res = {
            status: 200,
            body: {
                Status: "Fail", //success, fail
                Message: 'Mac address not exist.',
            }
        };
    } //end if
} //end module