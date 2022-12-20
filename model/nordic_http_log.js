const commonObj = require('../common/cosmos');
class NordicHTTPLog {
    serial_no = '';
    isBatteryInfoCorrect = false;
    #bms_UUID = "67890";
    #voltage = 0.00; //Total voltage
    #temperature = 0; //Pack temperature
    #current = 0.00; //Current in amp
    #cellVh = 0; //High voltage in cell
    #cellVl = 0; //Low voltage in cell
    #max_mv_cell = 0; //High voltage cell
    #min_mv_cell = 0; //Low voltage cell number
    #max_temp = 0; //Max temperature
    #max_temp_cell = 0; //Max temperature cell number
    #min_temp = 0; //Minimum cell temperature
    #min_temp_cell = 0; //Minimum cell temperature cell number
    #chg_mos = 0; // Battery charge MOS
    #dischg_mos = 0; //Battery discharge MOS
    #remaining_capacity = 0; //Remaining capacity in mAH
    #total_cell_in_battery = 0; //Total number of cells in battery pack
    #bms_total_temperature_sensors = 0; //Toal number of temperature sensors attached to BMS
    #charger_status = 0; //Battery charging status ie charging or discharging
    #load_on_bms = 0; //How much load on BMS on charging or discharging

    #charge_cycle = 0; //bms_life
    #excess_heat = 0;
    #excess_cold = 0;
    #critical_event = 0; //Count according to other battery logs
    #vibration = 0; //Vibration from sensor
    #pressure = 0; //Pressure from sensor
    #charge_rate = 0; //current
    #discharge_rate = 0;
    #under_voltage = 0;
    #over_voltage = 0;
    #cell_leakage = 0; //not clear
    #charging_status = 0; //Charging or not charging
    #percentage = 0; //Battery remaining voltage in percentage
    #out_of_balance = 0; //Not sure about balance limit  
    #cells = []; //Contain per cell voltage
    #temperature_sensors = []; //Contain per sensor data
    #cell_bal = [];
    #fault_bytes = [];
    #bms_hex_data = '';
    #pressureHex = '';
    #vibrationHex = '';
    /**
    * Inotialize battery pack data
    * 
    * @parameters encodedData
    * 
   */
    init(encodedData = '') {
        if (encodedData != '') {
            this.#bms_hex_data = encodedData?.BMS_Data ? encodedData.BMS_Data : '';
            this.#pressureHex = encodedData?.Pressure ? encodedData.Pressure : '';
            this.#vibrationHex = encodedData?.Vibration ? encodedData.Vibration : '';
            this.serial_no = encodedData?.Nordic_Id ? encodedData.Nordic_Id : '';
            //Break data in required format for each BMS part           
            var nordic_data_arr = this.#bms_hex_data.split("A5");

            if (nordic_data_arr.length > 0) {
                this.isBatteryInfoCorrect = true;
                nordic_data_arr.forEach(slot => {
                    var slotStr = "A5" + slot;
                    var slot_data = slotStr.split(" ");
                    //Decode BMS Data
                    this.#decodeBMSData(slot_data);
                });
            }
            //Pressure on battery
            if (this.#pressureHex != '') {
                this.#pressure = parseInt(this.#pressureHex, 16);
            }
            //Vibration in battery
            if (this.#vibrationHex != '') {
                this.#vibration = parseInt(this.#vibrationHex, 16);
            }
        }
    }
    /**
     * Get battery log in json
     * 
     * @return log in JSON format
     */
    get batteryLog() {
        return {
            "serial_no": this.serial_no,
            "bms_unique_id": this.#bms_UUID,
            "temperature": this.#temperature,
            "voltage": this.#voltage,
            "cellVh": this.#cellVh,
            "cellVl": this.#cellVl,
            "pressure": this.#pressure,
            "vibration": this.#vibration,
            "cells": this.#cells,
            "max_mv_cell": this.#max_mv_cell,
            "min_mv_cell": this.#min_mv_cell,
            "max_temp": this.#max_temp,
            "max_temp_cell": this.#max_temp_cell,
            "min_temp": this.#min_temp,
            "min_temp_cell": this.#min_temp_cell,
            "chg_mos": this.#chg_mos,
            "dischg_mos": this.#dischg_mos,
            "remaining_capacity": this.#remaining_capacity,
            "charger_status": this.#charger_status,
            "load_on_bms": this.#load_on_bms,
            "charge_cycle": this.#charge_cycle,
            "excess_heat": this.#excess_heat,
            "excess_cold": this.#excess_cold,
            "critical_event": this.#critical_event,
            "charge_rate": this.#charge_rate,
            "discharge_rate": this.#discharge_rate,
            "under_voltage": this.#under_voltage,
            "over_voltage": this.#over_voltage,
            "cell_leakage": this.#cell_leakage,
            "charging_status": this.#charging_status,
            "percentage": this.#percentage,
            "out_of_balance": this.#out_of_balance,
            "cell_bal": this.#cell_bal,
            "fault_bytes": this.#fault_bytes,
            "BMS_hex_data": this.#bms_hex_data,
            "BMS_pressure_hex": this.#pressureHex,
            "BMS_vibration_hex": this.#vibrationHex
        };
    }
    /**
     * Get battery pack voltage
     * 
     * 
     */
    get packVoltage() {
        return this.#voltage;
    }
    /**
     * Set battery pack voltage
     * 
     * 
     */
    //    get packVoltage(){
    //     this.#voltage = volt;
    //    }   
    /**
     * Decode BMS data from Hex to decimal
     * 
     * @parameters bms_buffer
     * 
    */
    #decodeBMSData(bms_buffer) {
        switch (bms_buffer[2]) {
            case '90': {
                let total_volt = parseInt(bms_buffer[4], 16) * 256 + parseInt(bms_buffer[5], 16);
                this.#voltage = parseFloat(total_volt) / 10;// final value to display and use in APP
                let cell_current = parseInt(bms_buffer[8], 16) * 256 + parseInt(bms_buffer[9], 16);
                cell_current = cell_current - 30000;
                this.#current = cell_current / 10; //Final value to display and use in APP
                let cell_soc = parseInt(bms_buffer[10], 16) * 256 + parseInt(bms_buffer[11], 16);
                this.#percentage = cell_soc / 10;// final value to display and use in APP charge percentage             
                break;
            }
            case '91': {
                let max_mv = parseInt(bms_buffer[4], 16) * 256 + parseInt(bms_buffer[5], 16);
                let max_mv_cell = parseInt(bms_buffer[6], 16);
                let min_mv = parseInt(bms_buffer[7], 16) * 256 + parseInt(bms_buffer[8], 16);
                let min_mv_cell = parseInt(bms_buffer[9], 16);
                this.#cellVh = (max_mv > 0) ? max_mv / 1000 : 0;
                this.#max_mv_cell = max_mv_cell;
                this.#cellVl = (min_mv > 0) ? min_mv / 1000 : 0;
                this.#min_mv_cell = min_mv_cell;
                break;
            }
            case '92': {
                let max_temp = parseInt(bms_buffer[4], 16);
                max_temp = max_temp - 40; //Max temperature in centigrade
                this.#max_temp = max_temp;
                let max_temp_cell = parseInt(bms_buffer[5], 16); //Max temperature cell number
                this.#max_temp_cell = max_temp_cell;
                let min_temp = parseInt(bms_buffer[6], 16);
                min_temp = min_temp - 40; // Min temperature in centigrade
                this.#min_temp = min_temp;
                let min_temp_cell = parseInt(bms_buffer[7], 16); //Min temperature cell number
                this.#min_temp_cell = min_temp_cell;
                break;
            }
            case '93': {
                let device_state = parseInt(bms_buffer[4], 16); //0 idle, 1 charging, 2 discharging
                let chg_mos = parseInt(bms_buffer[5], 16);
                let dischg_mos = parseInt(bms_buffer[6], 16);
                let bms_life = parseInt(bms_buffer[7], 16);  //charge/discharge cycles,
                this.#charging_status = device_state;
                this.#chg_mos = chg_mos;
                this.#dischg_mos = dischg_mos;
                this.#charge_cycle = bms_life;
                let rem_cap = 0; //Remaining capacity in mAH,
                rem_cap = (parseInt(bms_buffer[8], 16) << 24);
                rem_cap |= (parseInt(bms_buffer[9], 16) << 16);
                rem_cap |= (parseInt(bms_buffer[10], 16) << 8);
                rem_cap |= (parseInt(bms_buffer[11], 16));
                this.#remaining_capacity = rem_cap;
                break;
            }
            case '94': {
                this.#total_cell_in_battery = parseInt(bms_buffer[4], 16); //Number of cells supported BMS
                this.#bms_total_temperature_sensors = parseInt(bms_buffer[5], 16); //Number of temperature sensors in BMS
                this.#charger_status = parseInt(bms_buffer[6], 16); //0 charger status disconnect, 1 currently connected
                this.#load_on_bms = parseInt(bms_buffer[7], 16); //Load on BMS, load access, 0 no load, 1 Driving load
                break;
            }
            case '95': { //Per cell voltage
                let cellsCounter = this.#cells.length;
                for (var i = 0; i < 6; i += 2) { //every 95 entry have maximum 3 records
                    if (cellsCounter < this.#total_cell_in_battery) { //Get cell data
                        let cellVolt = parseInt(bms_buffer[5 + i], 16) * 256 + parseInt(bms_buffer[6 + i], 16);
                        cellVolt = cellVolt / 1000; //Per cell voltage
                        this.#cells.push(cellVolt);
                    }
                    cellsCounter++;
                }
                break;
            }
            case '96': { //Per sensor temperature
                let sensorCounter = this.#temperature_sensors.length;
                for (var i = 0; i < 3; i++) { //every 95 entry have maximum 3 records
                    if (sensorCounter < this.#bms_total_temperature_sensors) { //Get cell data
                        let sensor_temp = parseInt(bms_buffer[5], 16) - 40;
                        this.#temperature_sensors.push(sensor_temp);
                        this.temperature = sensor_temp;
                    }
                    sensorCounter++;
                }

                break;
            }
            case '97': {
                var j = 0, k = 4, m = 128, a = 0;
                var bal_bytes = [];

                while (k < 10) {
                    while (j < 8) {
                        if (parseInt(bms_buffer[k], 16) & (m)) {
                            bal_bytes[a] = 1;
                        } else {
                            bal_bytes[a] = 0;
                        }
                        m = m / 2;
                        j++;
                        a++;
                    }
                    k++;
                    m = 128;
                    j = 0;
                }
                this.#cell_bal = bal_bytes;
                break;
            }
            case '98': {
                var j = 0, k = 4, m = 128, a = 0;
                var fault_bytes = [];

                while (k < 11) {
                    while (j < 8) {
                        if (parseInt(bms_buffer[k], 16) & (m)) {
                            fault_bytes[a] = 1;
                        } else {
                            fault_bytes[a] = 0;
                        }
                        m = m / 2;
                        j++;
                        a++;
                    }
                    k++;
                    m = 128;
                    j = 0;
                }
                //this.#fault_bytes = bms_buffer[0][12];
                this.#fault_bytes = fault_bytes;
                break;
            }
        }//end switch
    }
}//End class
module.exports = new NordicHTTPLog;