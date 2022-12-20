const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"], process.env["COSMOS_DB_RESOURCE_KEY"], process.env["COSMOS_DB_NAME"], process.env["ENCRYPTION_ALGORITHM"]);
class DashboardModel {
  /**
   * Get state of charge module data
   * 
   * @param user_id
   * 
   * if user id used then fetch all of devices for the user id otherwise load all
   * 
   * return json object
   * 
   */
  async getStateOfCharge(user_id = '') {
    var discharg = 0;
    var dischargItems = 0;
    var total = 0;
    var items = 0;
    var totalSum = 0;
    var above70 = 0;
    var above70Items = 0;
    var qry = "SELECT * FROM battery_detail as c WHERE c.status != 3";
    if (user_id != '') {
      qry = "SELECT * FROM battery_detail as c WHERE c.user_id='" + user_id + "' AND c.status != 3";
    }
    let batteryRecord = await commonCLI.select("battery_detail", qry);

    if (batteryRecord.length > 0) {
      for (var i = 0; i < batteryRecord.length; i++) {
        let battery = batteryRecord[i];
        totalSum += (battery?.state_of_charge) ? parseInt(battery.state_of_charge) : 0;
        if (battery.state_of_charge < 30) {
          discharg += (battery?.state_of_charge) ? parseInt(battery.state_of_charge) : 0;
          dischargItems = dischargItems + 1;
        } else if (battery.state_of_charge < 70 && battery.state_of_charge > 30) {
          total += parseInt(battery.state_of_charge);
          items = items + 1;
        } else if (battery.state_of_charge > 70) {
          above70 += battery.state_of_charge ? parseInt(battery.state_of_charge) : 0;
          above70Items = above70Items + 1;
        }
      }
    }
    ///Calculate State of charge
    let lessThen70 = total / items;
    let discharged = discharg / dischargItems;
    let total70 = 0;
    if ((total <= 0) && (discharg <= 0)) {
      total70 = 0;
    } else {
      total70 = lessThen70 + discharged;
    }

    //let full_charged = 100-total70;  
    let b70charged = (lessThen70 / totalSum) * 100;
    let dCharged = (discharged / totalSum) * 100;
    let full_charged = (above70 / totalSum) * 100;

    return { "full_charged": full_charged ? full_charged : 0, "charged_70": b70charged ? b70charged : 0, "discharged": dCharged ? dCharged : 0 };
  }
  /**
  * Get state of charge module data
  * 
  * @param user_id
  * 
  * if user id used then fetch all of devices for the user id otherwise load all
  * 
  * return json object
  * 
  */
  async getDeviceList(user_id = '', search = '', discart = false, offset = 0, limit = 0) {
    discart = (!discart) ? " WHERE c.status != 3" : " WHERE c.status != '' ";
    var qry = "SELECT * FROM battery_detail as c " + discart;
    //Check for user
    if (user_id != '') {
      qry = "SELECT * FROM battery_detail as c " + discart + " AND c.user_id='" + user_id + "' ";
    }
    //Set search
    if (search != '') {
      qry += " AND (LOWER(c.device_type) LIKE '%" + search + "%' OR (LOWER(c.macaddress) LIKE '%" + search + "%') OR (LOWER(c.serial_number) LIKE '%" + search + "%') )";
    }
    //Set limit
    if (limit > 0) {
      qry += " OFFSET " + offset + " LIMIT " + limit;
    }
    //Execute function to get batteries list
    let deviceData = await commonCLI.select("battery_detail", qry);
    var device_list = [];
    if (deviceData.length > 0) {
      deviceData.forEach(device => {
        //Get device status
        let status = '';
        if (device.status == 0) {
          status = 'Normal';
        } else if (device.status == 1) {
          status = 'Needs Attention';
        } else {
          status = 'Critical';
        }
        let serialNumber = '';
        if (device?.serial_number != '') {
          serialNumber = device.serial_number;
        } else if (device?.macaddress) {
          serialNumber = device.macaddress;
        }
        device_list.push({
          id: device?.id ? device.id : '',
          user_id: device?.user_id ? device.user_id : '',
          client_id: device?.client_id ? device.client_id : '',
          serial_number: serialNumber,
          manufacturer_name: device?.company_name ? device.company_name : '',
          status: status,
          model_id: device?.model_id ? device.model_id : '',
          model_name: device?.model_name ? device.model_name : '',
          device_type: device?.device_type ? device.device_type : '',
          reporting: false,
          state_of_charge: device?.state_of_charge ? device.state_of_charge : '',
          state_of_health: device?.state_of_health ? device.state_of_health : '',
        });
      });
    }
    return device_list;
  }
  /**
  * Get device message module data
  * 
  * @param user_id
  * 
  * if user id used then fetch all of devices for the user id otherwise load all
  * 
  * return json object
  * 
  */
  async getDeviceMessageList(user_id = '', discart = false, limit = 20) {
    //var msg_qry = "SELECT * FROM battery_logs as c WHERE c.serial_no IN (\""+deviceSerialNumberString+"\") AND c.critical=true ORDER BY c.timestamp DESC OFFSET 0 LIMIT "+limit+" ";
    var msg_qry = "SELECT * FROM battery_events as c ORDER BY c.timestamp DESC OFFSET 0 LIMIT " + limit + " ";
    let last_log_data = await commonCLI.select("battery_events", msg_qry);
    var deviceLogList = [];
    last_log_data.forEach(log => {

      let dateObj = commonCLI.getUserDateFormat(log.timestamp);
      let status = 1;
      if (log.event_type == 'critical') {
        status = 0
      } else if (log.event_type == 'Low') {
        status = 2
      }
      deviceLogList.push({
        "serial_number": log.serial_no,
        "sort": status,
        "status": log.event_type.charAt(0).toUpperCase() + log.event_type.slice(1).toLowerCase(),
        "message": log.message ? log.message : '',
        "date": dateObj.display_date + ' ' + dateObj.time
      }); //end push           
      deviceLogList.sort(function (a, b) {
        return a.sort - b.sort;
      });
    }); //end last_log_data foreach
    return deviceLogList;
  }
  /**
 * Get device location lat/long for map 
 * 
 * @param user_id
 * 
 * if user id used then fetch all of devices for the user id otherwise load all
 * 
 * return json object
 * 
 */
  async getDevicesGeoLocationData(user_id = '', search = '', sort = '', discart = false, limit = 20) {
    discart = (!discart) ? " WHERE c.status != 3" : " WHERE c.status != '' ";
    var qry = "SELECT * FROM battery_detail as c " + discart;
    //Check for user
    if (user_id != '') {
      qry = "SELECT * FROM battery_detail as c " + discart + " AND c.user_id='" + user_id + "' ";
    }
    //Set search
    if (search != '') {
      qry += " AND (LOWER(c.device_type) LIKE '%" + search + "%' OR (LOWER(c.serial_number) LIKE '%" + search + "%') OR (LOWER(c.macaddress) LIKE '%" + search + "%'))";
    }
    if (sort != '') {
      if (sort == 'asc') {
        qry += " ORDER BY c.serial_number ASC";
      } else if (sort == 'desc') {
        qry += " ORDER BY c.serial_number DESC";
      }
    }
    //Execute function to get batteries list
    let deviceData = await commonCLI.select("battery_detail", qry);

    let deviceLocationData = [];
    //Get all of devices serial number so that can get users devices logs
    if (deviceData.length > 0) {
      deviceData.forEach(device => {
        let soh_icon = 1;
        let soh = 'Normal';
        //set soh_icon and soh
        if (device.status == 0) {
          soh_icon = 1;
          soh = 'Normal';
        } else if (device.status == 1) {
          soh_icon = 2;
          soh = 'Need Attention';
        } else if (device.status == 2) {
          soh_icon = 3;
          soh = 'Critical';
        }
        let serialNumber = '';
        if (device?.serial_number != '') {
          serialNumber = device.serial_number;
        } else if (device?.macaddress) {
          serialNumber = device.macaddress;
        }
        //Push data
        deviceLocationData.push({
          "serial_number": serialNumber,
          "state_of_charge": device?.state_of_charge ? device.state_of_charge : 0,
          "state_of_health": soh,
          "state_of_health_icon": soh_icon,
          "firmware_version": device?.firmware_version ? device.firmware_version : '',
          "status": device?.status ? device.status : 0,
          "model_name": device?.model_name ? device.model_name : '',
          "device_type": device?.device_type ? device.device_type : '',
          "lat": device?.lat ? device.lat : '',
          "long": device?.long ? device.long : '',
          "reporting": false
        });
      });
    }
    //end last_log_data foreach
    return deviceLocationData;
  }
}//end class
module.exports = new DashboardModel;





