const httpLog = require("../model/nordic_http_log");
const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"], process.env["COSMOS_DB_RESOURCE_KEY"], process.env["COSMOS_DB_NAME"], process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {
    if (req.body != '') {
        var dateObj = commonCLI.getFormatedDateTime("current");
        var ip_address = (typeof req.headers['x-forwarded-for'] != 'undefined') ? req.headers['x-forwarded-for'] : '';
        var bms_data_arr = req.body;
        //A5 01 90 08 01 B3 00 00 75 30 01 F4 8C A5 01 91 08 13 88 09 06 35 06 01 F4 19 A5 01 92 08 00 01 00 01 35 06 01 F4 72 A5 01 93 08 00 00 00 32 00 00 3A 98 45 A5 01 94 08 0C 01 00 00 02 00 00 98 E9 A5 01 95 08 01 0C C0 0D D2 0D B2 98 46 A5 01 95 08 02 0D 1E 0D B3 06 32 98 00 A5 01 95 08 03 13 88 13 88 13 88 98 AF A5 01 95 08 04 09 52 0E 70 0E 46 98 0C A5 01 96 08 01 00 00 00 00 00 00 00 45 A5 01 96 08 02 00 00 00 00 00 00 00 46 A5 01 97 08 00 00 00 00 00 00 00 00 45 A5 01 97 08 00 00 00 00 00 00 00 00 45
        // var bms_data_arr = {"BMS_Data": "A5 01 90 08 01 1A 00 00 75 30 01 2F 2E A5 01 91 08 0F D8 04 0F 8C 06 01 2F FB A5 01 92 08 39 01 39 01 8C 06 01 2F 76 A5 01 93 08 00 01 01 4D 00 00 23 82 35 A5 01 94 08 07 01 00 00 00 00 00 82 CC A5 01 95 08 01 0F D3 0F D8 0F CE 82 6C A5 01 95 08 02 0F D8 0F D7 0F 8C 82 2F A5 01 95 08 03 0F 9C 0F D7 0F 8C 82 F4 A5 01 96 08 01 39 00 00 00 00 00 82 00 A5 01 97 08 00 00 00 00 00 00 00 00 45 A5 01 98 08 00 00 00 00 00 00 00 00 46",
        //                     "Pressure": "0000005F",
        //                     "Vibration": "00000060",
        //                     "Nordic_Id": "C6BA2567E576A59A"
        //                    };

        //Initialize HTTP log data
        httpLog.init(bms_data_arr);
        bms_data_arr.date_added = dateObj.display_date + " " + dateObj.time;
        await commonCLI.insert('nordic_http_data', bms_data_arr); ///Insert data for testing purpose only          
        //Check for correct information and update database accordingly.

        var full_log_data;
        if (httpLog.isBatteryInfoCorrect) {
            try {
                //Get battery details by battery unique id
                let batteryDetails = await commonCLI.select("battery_detail", "SELECT c.id, c.user_id, c.client_id FROM battery_detail as c WHERE c.serial_no='" + httpLog.serial_no + "'");

                let user_id = '';
                let client_id = '';
                let battery_id = '';
                if (batteryDetails.length > 0) {
                    batteryDetails.forEach(battery => {
                        client_id = battery.client_id;
                        user_id = battery.user_id;
                        battery_id = battery.id;
                    });
                }

                //Get battery full log
                full_log_data = httpLog.batteryLog;
                //Set battery details for log
                full_log_data.battery_id = battery_id;
                full_log_data.client_id = client_id;
                full_log_data.user_id = user_id;
                full_log_data.ip_address = ip_address;
                full_log_data.connection_type = "wifihttp";
                full_log_data.timestamp = new Date();
                //console.log(full_log_data);
                //Get battery current information
                let battery_current_info = {};
                battery_current_info["last_request_to_BMS"] = dateObj.display_date + " " + dateObj.time;
                battery_current_info["ip_address"] = ip_address;
                battery_current_info["voltage"] = httpLog.packVoltage;
                //console.log("Line 56");    
                //console.log(battery_current_info);
                await commonCLI.insert('nordicboard_data', full_log_data);
                await commonCLI.insert('battery_logs', full_log_data);
                await commonCLI.update({
                    "containername": "battery_detail",
                    "partitionkey": "id",
                    "whereclouse": " WHERE c.serial_no='" + httpLog.serial_no + "'",
                    "newitem": battery_current_info
                });
            } catch (error) {
                console.log("Error:" + error);
            }
        }
        //////////End here////////////////////////////
        context.res = {
            status: 200,
            body: {
                Status: "success", //success, fail
                Header: req.headers,
                Message: bms_data_arr,
                Decrypted: full_log_data
            }
        };
    }
    //***********************************************    
}