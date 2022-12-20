const CosmosClient = require('@azure/cosmos').CosmosClient;
const jwt = require('jsonwebtoken');
const commonCLI = require('common-cls');
class Cosmos {
  static client;

  constructor() {

    this.setDBObj();
    /* let a = this.getRoles();
    console.log("Line 8");
    console.log(a); */
  }
  /**
   * Create database connection
   * 
   *
   * @return database connection object
   *  
  */
  setDBObj() {
    try {
      this.client = new CosmosClient({
        endpoint: process.env["COSMOS_DB_URL"],
        key: process.env["COSMOS_DB_RESOURCE_KEY"]
      });
    } catch (err) {
      return false;
    }
    //return db;
  }
  /**
   * Get User roles
   * 
   * @return all of user roles
   * 
  */
  async getRoles() {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user_role");
      //Get database records
      let qry = "SELECT * FROM user_role ";
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get User roles
   * 
   * @return all of user roles
   * 
  */
  async getRoleByName(rolename = '') {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user_role");
      //Get database records
      let qry = "SELECT * FROM c WHERE c.name='" + rolename + "'";
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get User roles
   * 
   * @return all of user roles
   * 
  */
  async getRoleByID(role_id = '') {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user_role");
      //Get database records
      let qry = "SELECT * FROM c WHERE c.role_id='" + role_id + "'";
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Add User roles
   * 
   * @return all of user roles
   * 
  */
  async addRole(role_name) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user_role");
      //Get database records
      let qry = "SELECT * FROM user_role ";
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get help content
   * 
   * 
  */
  async getHelpContent(type) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("information");
      //Get database records
      let qry = "SELECT * FROM information where information.content_type = '" + type + "'";
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get Battery details by serial number OR battery id
   * 
   * @return battery detail
   * 
  */
  async getBatteryDetailsByID(serial_number) {
    try {
      serial_number = serial_number.toLowerCase();
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_detail");
      //Get database records
      let qry = "SELECT * FROM c where ((LOWER(c.serial_number)='" + serial_number + "') OR (LOWER(c.macaddress) = '" + serial_number + "')) OFFSET 0 LIMIT 1";
      const result = await container.items.query(qry).fetchAll();
      //console.log(qry);
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get Battery details by serial number OR battery id
   * 
   * @return battery detail
   * 
  */
  async getBatteryDetailsByUniqueID(battery_unique_id) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_detail");
      //Get database records
      let qry = "SELECT * FROM c where c.battery_unique_id = '" + battery_unique_id + "' OFFSET 0 LIMIT 1";
      console.log(qry);
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get total batteries
   * 
   * @return total number of list
   * 
  */
  async getTotalBattries(user_id = 0, discart = false) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_detail");
      //Get database records
      let qry = "SELECT COUNT(c.user_id) as total FROM c WHERE c.user_id = '" + user_id + "' ";
      if (!discart) {
        qry += " AND c.status != 3";
      }
      const result = await container.items.query(qry).fetchAll();
      //Return result
      //console.log(qry);
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get Battery list by client_id OR filtered data
   * 
   * @return battery list
   * 
  */
  async getClientBatteryList(client_id = 0, search = '', sort = '', discart = false, offset = 0, limit = 0) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_detail");
      //Get database records
      let qry = "SELECT * FROM c WHERE c.client_id = '" + client_id + "' ";
      if (!discart) {
        qry += " AND c.status != 3";
      }
      //console.log(qry);
      if (search != '') {
        qry += " AND (LOWER(c.company_name) LIKE '%" + search + "%' OR LOWER(c.serial_number) LIKE '%" + search + "%')";
      }
      if (sort != '') {
        if (sort == 'name_asc') {
          qry += " ORDER BY c.company_name ASC";
        } else if (sort == 'name_desc') {
          qry += " ORDER BY c.company_name DESC";
        } else if (sort == 'serial_number') {
          qry += " ORDER BY c.serial_number ASC";
        } else {
          qry += " ORDER BY c.company_name DESC";
        }
      }
      ///Set limit
      if (limit > 0) {
        qry += " OFFSET " + offset + " LIMIT " + limit;
      }
      const result = await container.items.query(qry).fetchAll();
      //Return result
      //console.log(qry);
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get Battery list by user_id OR filtered data
   * 
   * @return battery list
   * 
  */
  async getBatteryList(user_id = 0, search = '', sort = '', discart = false, offset = 0, limit = 0) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_detail");
      //Get database records
      //let qry = "SELECT * FROM c WHERE c.user_id = '"+user_id+"' ";
      let qry = "SELECT * FROM c ";
      if (!discart) {
        qry += " Where c.status != 3 ";
      }

      //console.log(qry);
      if (search != '') {
        qry += " AND (LOWER(c.company_name) LIKE LOWER('%" + search + "%') OR LOWER(c.serial_number) LIKE LOWER('%" + search + "%'))";
      }
      if (sort != '') {
        if (sort == 'name_asc') {
          qry += " ORDER BY c.company_name ASC";
        } else if (sort == 'name_desc') {
          qry += " ORDER BY c.company_name DESC";
        } else if (sort == 'serial_number') {
          qry += " ORDER BY c.serial_number ASC";
        } else if (sort == 'datetime') {
          qry += " ORDER BY c._ts DESC";
        } else {
          qry += " ORDER BY c.company_name DESC";
        }
      }
      ///Set limit
      if (limit > 0) {
        qry += " OFFSET " + offset + " LIMIT " + limit;
      }
      //console.log(qry);    
      const result = await container.items.query(qry).fetchAll();
      //Return result
      //console.log(qry);
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }


  /**
   * Get Battery list by user id OR filtered data
   * 
   * @return battery list
   * 
  */
  async getUserBatteryList(user_id = 0, search = '', sort = '', discart = false, offset = 0, limit = 0) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_detail");
      //Get database records
      let qry = "SELECT * FROM c WHERE c.user_id = '" + user_id + "' ";
      if (!discart) {
        qry += " AND c.status != 3";
      }
      //console.log(qry);
      if (search != '') {
        qry += " AND (LOWER(c.company_name) LIKE '%" + search + "%' OR LOWER(c.serial_number) LIKE '%" + search + "%')";
      }
      if (sort != '') {
        if (sort == 'name_asc') {
          qry += " ORDER BY c.company_name ASC";
        } else if (sort == 'name_desc') {
          qry += " ORDER BY c.company_name DESC";
        } else if (sort == 'serial_number') {
          qry += " ORDER BY c.serial_number ASC";
        } else {
          qry += " ORDER BY c.company_name DESC";
        }
      }
      ///Set limit
      if (limit > 0) {
        qry += " OFFSET " + offset + " LIMIT " + limit;
      }
      const result = await container.items.query(qry).fetchAll();
      //Return result
      //console.log(qry);
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get total batteries
   * 
   * @return total number of list
   * 
  */
  async getAllBatterys(search = '', sort = '', offset = 0, limit = 0) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_detail");
      //Get database records
      let qry = "SELECT * FROM c where c.id != '' ";
      if (limit > 0) {
        qry += " OFFSET " + offset + " LIMIT " + limit;
      }
      const result = await container.items.query(qry).fetchAll();
      //Return result
      //console.log(qry);
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Add Battery
   * 
   * @return Add battery 
   * 
  */
  async addBattery(battery_data) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_detail");
      //Get database records      
      const result = await container.items.create(battery_data);
      //Return result
      return result && result.resource ? result.resource : [];
    } catch (err) {
      return err;
    }
  }


  /**
   * Assign battery to user
   * 
   * @return assign battery 
   * 
  */
  async assignBattery(data_object) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_to_user");
      //Get database records      
      const result = await container.items.create(data_object);
      //Return result
      return result && result.resource ? result.resource : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get Client to Pilot list by ID
   * 
   * @return Pilot list
   * 
  */
  async getClientPilotList(user_id = '') {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_to_user");
      //Get database records 
      let qry = "SELECT * FROM c where c.user_id = '" + user_id + "' ";
      //console.log(qry);
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Add Battery logs
   * 
   * @return 
   * 
  */
  async addBatteryLogs(log_data) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_logs");
      //Get database records      
      const result = await container.items.create(log_data);

      //Return result
      return result && result.resource ? result.resource : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get Customer list by ID
   * 
   * @return Customer list
   * 
  */
  async getCustmersList(role_id, client_id = '') {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user");
      //Get database records  
      let qry = "SELECT * FROM c where c.client_id = '" + client_id + "' AND c.role_id = '" + role_id + "' ";
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get Client list by ID
   * 
   * @return Customer list
   * 
  */
  async getClientList(status = '', search = '', sort = '', subscription = '', OFFSET = 0, limit = 0) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user");
      //Get database records  
      let qry = "SELECT * FROM c WHERE c.role_id='2'";
      if (status != '') {
        qry += " AND c.status = '" + status + "'";
      }
      if (search != '') {
        qry += " AND (LOWER(c.first_name) LIKE '%" + search + "%' OR LOWER(c.email) LIKE '%" + search + "%')";
      }
      if ((subscription != '') && (subscription == 'false')) {
        qry += " AND NOT IS_DEFINED(c.subscription_details) OR (c.subscription_details = '') ";
      } else if ((subscription != '') && (subscription == 'true')) {
        qry += " AND IS_DEFINED(c.subscription_details) AND (c.subscription_details != '') ";
      }
      ////Sort data
      if (sort != '') {
        if (sort == 'name_asc') {
          qry += " ORDER BY c.first_name ASC";
        } else if (sort == 'name_desc') {
          qry += " ORDER BY c.first_name DESC";
        } else if (sort == 'date_desc') {
          qry += " ORDER BY c.date_added DESC";
        } else if (sort == 'date_asc') {
          qry += " ORDER BY c.date_added ASC";
        }
      }
      ///Set limit
      if (limit > 0) {
        qry += " OFFSET " + OFFSET + " LIMIT " + limit;
      }
      //console.log(qry);          
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get battery log by battery id
   * 
   * @return log list
   * 
  */
  async getBatteryLogByBatteryID(serial_no = '', sort = '', order = 'ASC', offset = 0, limit = 0) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_logs");
      //Get database records  
      let qry = '';
      if (serial_no != '') {
        qry = "SELECT * FROM c where c.serial_no = '" + serial_no + "'";
      }
      ////Sort data      
      if (sort == 'timestamp') {
        qry += " ORDER BY c.timestamp " + order;
      }
      ///Set limit
      if (limit > 0) {
        qry += " OFFSET " + offset + " LIMIT " + limit;
      }
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get battery log by battery id
   * 
   * @return log list
   * 
  */
  async getBatteryLogBySerialNo(serial_no = '', sort = '', order = 'DESC', offset = 0, limit = 0) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_logs");
      //Get database records  
      let qry = '';
      if (serial_no != '') {
        //qry = "SELECT * FROM c where c.serial_no = '" + serial_no + "'";
        qry = "SELECT * FROM c where c.serial_no='" + serial_no + "' OR c.mac_address = '" + serial_no + "'";
      }
      ////Sort data      
      if (sort == 'timestamp') {
        qry += " ORDER BY c.timestamp " + order;
      }
      ///Set limit
      if (limit > 0) {
        qry += " OFFSET " + offset + " LIMIT " + limit;
      } 
      
      const result = await container.items.query(qry).fetchAll();

      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
  * Get battery log by battery id
  * 
  * @return log list
  * 
 */
  async getBatteryModel(model_id = '', sort = '', order = 'ASC', offset = 0, limit = 0, search = '') {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_model");
      //Get database records  
      let qry = "SELECT * FROM c ";
      if (model_id != '') {
        qry += " WHERE c.id = '" + model_id + "'";
      }
      if (search != '') {
        qry += " WHERE LOWER(c.model_name) LIKE '%" + search + "%' ";
      }
      ////Sort data      
      if (sort == 'date_added') {
        qry += " ORDER BY c._ts " + order;
      }
      ///Set limit
      if (limit > 0) {
        qry += " OFFSET " + offset + " LIMIT " + limit;
      }
      //console.log(qry);
      const result = await container.items.query(qry).fetchAll();

      //Return result        
      return result && result.resources ? result.resources : [];

    } catch (err) {
      return err;
    }
  }
  /**
   * Get battery log by user id
   * 
   * @return Pilot list
   * 
  */
  async getBatteryLogByUserID(user_id = '', sort = '', offset = 0, limit = 0) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_logs");
      //Get database records  
      let qry = '';
      if (user_id != '') {
        qry = "SELECT * FROM c where c.user_id = '" + user_id + "'";
      }
      ////Sort data      
      if (sort == 'status') {
        qry += " ORDER BY c.battery_status DESC";
      }
      ///Set limit
      if (limit > 0) {
        qry += " OFFSET " + offset + " LIMIT " + limit;
      }

      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get Battery logs by ID
   * 
   * @return Battery list
   * 
  */
  async getBatteryLogs(serial_no, filterRec = '', type = '') {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_logs");

      var datetime = new Date();
      var curentDate = datetime.toISOString().slice(0, 10);
      var before7 = commonCLI.getFormatedDateTime('previous', 10080);
      //var before7 = commonCLI.getFormatedDateTime('previous',4320);
      var beforeM = commonCLI.getFormatedDateTime('previous', 43200);
      serial_no = serial_no.toLowerCase();
      //Get database records
      let qry = '';
      if (filterRec != '') {
        var splited = filterRec.split('to');
        if (filterRec == 'last_week') {
          qry = "SELECT * FROM c where ((LOWER(c.serial_no)='" + serial_no + "') OR (LOWER(c.mac_address) = '" + serial_no + "')) AND c.timestamp < '" + curentDate + "' AND c.timestamp > '" + before7.full_db_date + "' ORDER BY c._ts DESC";
        } else if (filterRec == 'last_month') {
          qry = "SELECT * FROM c where ((LOWER(c.serial_no)='" + serial_no + "') OR (LOWER(c.mac_address) = '" + serial_no + "')) AND c.timestamp < '" + curentDate + "' AND c.timestamp > '" + beforeM.full_db_date + "' ORDER BY c._ts DESC";
        } else {
          qry = "SELECT * FROM c where ((LOWER(c.serial_no)='" + serial_no + "') OR (LOWER(c.mac_address) = '" + serial_no + "')) AND c.timestamp < '" + splited[1] + "' AND c.timestamp > '" + splited[0] + "' ORDER BY c._ts DESC";
        }
      }
      if (type != '') {
        if (type == 'accelerometer') {
          qry = "SELECT * FROM c where ((LOWER(c.serial_no)='" + serial_no + "') OR (LOWER(c.mac_address) = '" + serial_no + "')) AND c." + type + " != '' ORDER BY c._ts DESC";
        }else{
          qry = "SELECT * FROM c where ((LOWER(c.serial_no)='" + serial_no + "') OR (LOWER(c.mac_address) = '" + serial_no + "')) AND c." + type + " > 0 ORDER BY c._ts DESC";
        }
      }
       else {
        qry = "SELECT * FROM c where ((LOWER(c.serial_no)='" + serial_no + "') OR (LOWER(c.mac_address) = '" + serial_no + "')) ORDER BY c._ts DESC";
      }

      qry += " OFFSET 0 LIMIT 100 ";

      // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      // console.log(qry);

      const result = await container.items.query(qry).fetchAll();
      var returnData = [];
      var items = result && result.resources ? result.resources : [];

      items.sort(function (a, b) {
        return a._ts - b._ts;
      });

      items.forEach(item => {
        returnData.push({
          "serial_no": item.serial_no,
          "timestamp": item.timestamp,
          "temperature": item.temperature,
          "humidity": item.humidity,
          "air_quality": item.air_quality,
          "pressure": item.pressure,
          "voltage": (item.voltage > 1000) ? item.voltage / 1000 : item.voltage,
          "vibration": item.vibration,
          "accelerometer": item.accelerometer,
          "ip_address": item.ip_address,
          "connection_type": item.connection_type,
          "id": item.id
        });
      });
      //Return result
      return returnData;
    } catch (err) {
      return err;
    }
  }

  /**
   * Get overview logs by serial number
   * 
   * @return log list
   * 
  */
  async getOverviewLogs(serial_no, offset = 0, limit = 1) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container    
      let container = await db.container("battery_logs");
      //Get database records  
      let qry = '';
      if (serial_no != '') {
        qry = "SELECT * FROM c where c.serial_no = '" + serial_no + "' ORDER BY c.timestamp DESC";
      }
      if (limit > 0) {
        qry += " OFFSET " + offset + " LIMIT " + limit;
      }
      // console.log(qry);
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
  * Get Battery details by id
  * 
  * @return battery detail
  * 
 */
  async getBatteryDataID(id, search = '') {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_detail");
      //Get database records
      let qry = "SELECT * FROM c where c.id = '" + id + "'";
      //console.log(qry);
      if (search != '') {
        qry += " AND LOWER(c.serial_number) LIKE '%" + search.toLowerCase() + "%'";
      }

      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get Pilot list by ID
   * 
   * @return Pilot list
   * 
  */
  async getPilotList(client_id = '', search = '', status = '', sort = '', OFFSET = 0, limit = 0) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user");
      //Get database records  
      let qry = '';
      if (client_id != '') {
        qry = "SELECT * FROM c where c.client_id = '" + client_id + "' AND c.role_id='3' AND c.status= '" + status + "'";
      } else {
        qry = "SELECT * FROM c WHERE c.role_id='3' AND c.status= '" + status + "'";
      }

      if (search != '') {
        qry += " AND ((LOWER(c.first_name) LIKE LOWER('%" + search + "%')) OR (LOWER(c.email) LIKE LOWER('%" + search + "%')) OR (LOWER(c.phone) LIKE LOWER('%" + search + "%')))";
      }
      ////Sort data
      if (sort != '') {
        if (sort == 'name_asc') {
          qry += " ORDER BY c.first_name ASC";
        } else if (sort == 'name_desc') {
          qry += " ORDER BY c.first_name DESC";
        } else if (sort == 'date_desc') {
          qry += " ORDER BY c.date_added DESC";
        } else if (sort == 'date_asc') {
          qry += " ORDER BY c.date_added ASC";
        }
      }
      ///Set limit
      if (limit > 0) {
        qry += " OFFSET " + OFFSET + " LIMIT " + limit;
      }
      //console.log(qry);
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get Pilot list by user_id OR search data
   * 
   * @return Pilot list
   * 
  */
  /*async getPilotList(user_id,search){
    try{
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);  
      //Select the container 
      let container = await db.container("user");
      //Get database records  
      let qry = "SELECT * FROM c where c.client_id = '"+user_id+"' "; 
      if(search != ''){
        qry += " AND LOWER(c.first_name) LIKE '%"+search+"%'";
      } 
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    }catch(err){
      return err;
    }    
  }*/
  /**
   * Get User data
   * 
   * @return User data by id 
   * 
  */
  async getUserByID(user_id, search = '', limit = 1) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user");
      //Get database records
      let qry = "SELECT * FROM c where c.id = '" + user_id + "'";
      if (search != '') {
        qry += " AND (LOWER(c.first_name) LIKE '%" + search + "%')";
      }
      if (limit > 0) {
        qry += " OFFSET 0 LIMIT 1";
      }
      console.log(qry);
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }

  /**
   * Get User data by email Or Phone number
   * 
   * @return User data 
   * 
  */
  async getUserByEmail(str, user_id = '') {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user");
      //Get database records
      let qry = "SELECT * FROM c where c.email = '" + str + "' AND c.id != '" + user_id + "'";
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get User data by email Or Phone number
   * 
   * @return User data 
   * 
  */
  async getUserByPhone(str) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user");
      //Get database records
      let qry = "SELECT * FROM c where c.phone = '" + str + "'";
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get User otp
   * 
   * @return Otp 
   * 
  */
  async getUserOtp(sign_field, otpDateTime = '', new_tsDate = '', OFFSET = 0, limit = 0) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("otp_details");
      //Get database records
      let qry = "SELECT * FROM c where c.send_to = '" + sign_field + "' ";
      if (otpDateTime != '') {
        qry += " AND c.send_date_time >= '" + otpDateTime + "'";
      }
      if (new_tsDate != '') {
        qry += " AND c._ts >= " + new_tsDate + "";
      }
      qry += " ORDER BY c.send_date_time DESC";
      if (limit > 0) {
        qry += " OFFSET " + OFFSET + " LIMIT " + limit;
      }
      console.log(qry);
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Add otp
   * 
   * @return Add otp 
   * 
  */
  async addOtp(otp_data) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("otp_details");
      //Get database records      
      const result = await container.items.create(otp_data);
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Check User data
   * 
   * @return User data 
   * 
  */
  async checkUser(username = '', password = '', role = '') {
    try {
      let role_id = 0;
      //Get user role by user role name
      if (isNaN(role)) {
        let role_data = await this.getRoleByName(role);
        if (role_data.length > 0) {
          role_data.forEach(role => {
            role_id = role.role_id;
          });
        }
      } else {
        role_id = role;
      }

      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user");
      //Get database records
      let qry = "SELECT * FROM c where (c.phone = '" + username + "' OR LOWER(c.email) = '" + username.toLowerCase() + "') ";
      if (role_id != '') {
        qry += " AND c.role_id='" + role_id + "' ";
      }
      //Password check   
      if (password != '') {
        qry += " AND c.password='" + password + "'";
      }

      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  // /**
  //  * Get User subscription data
  //  * 
  //  * @return User subscription data 
  //  * 
  // */  
  //  async getSubscriptionDetails(subscription_id){
  //   try{      
  //     //Select database by passing the database name
  //     let db = await this.client.database(process.env["COSMOS_DB_NAME"]);  
  //     //Select the container 
  //     let container = await db.container("subscription_detail");
  //     //Get database records
  //     let qry = "SELECT * FROM c where c.status=1 AND c.id='"+subscription_id+"' ";        
  //     const result = await container.items.query(qry).fetchAll();
  //     //Return result
  //     return result && result.resources ? result.resources : [];
  //   }catch(err){
  //     return err;
  //   }    
  // }
  // /**
  //  * Get subscription plans
  //  * 
  //  * @return Subscription plans 
  //  * 
  // */  
  //  async getSubscriptionPlans(){
  //   try{      
  //     //Select database by passing the database name
  //     let db = await this.client.database(process.env["COSMOS_DB_NAME"]);  
  //     //Select the container 
  //     let container = await db.container("subscription_detail");
  //     //Get database records
  //     let qry = "SELECT * FROM c where c.status=1";        
  //     const result = await container.items.query(qry).fetchAll();
  //     //Return result
  //     return result && result.resources ? result.resources : [];
  //   }catch(err){
  //     return err;
  //   }    
  // }
  /**
   * Add user
   * 
   * @return Add user 
   * 
  */
  async addUser(user_data) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user");
      //add database records      
      const result = await container.items.create(user_data);
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Add user
   * 
   * @return Add user login log 
   * 
  */
  async addUserLoginLog(log_data) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user_login_logs");
      //add database records      
      const result = await container.items.create(log_data);
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get User login log data
   * 
   * @return User login log data by id 
   * 
  */
  async getUserLoginLogByID(user_id, status = '', OFFSET = 0, limit = 0) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user_login_logs");
      //Get database records
      let qry = "SELECT * FROM c where c.user_id = '" + user_id + "'";
      if (status != '') {
        qry += " AND c.sign_in_status='" + status + "' ";
      }
      qry += " ORDER BY c._ts DESC";
      if (limit > 0) {
        qry += " OFFSET " + OFFSET + " LIMIT " + limit;
      }
      //console.log(qry);
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get Users login log data by id
   * 
   * @return User login log data 
   * 
  */
  async getUsersLoginLogsById(user_id) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user_login_logs");
      //Get database records
      let qry = "SELECT * FROM c where c.user_id = '" + user_id + "'";
      qry += " ORDER BY c._ts DESC";
      //console.log(qry);
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Update user
   * 
   * @return user details 
   * 
  */
  async updateUser(user_id, newItem) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user");
      var row_id = "";
      var partition_key_value = "";
      //Update database records    
      let qry = "SELECT * FROM c WHERE c.id = '" + user_id + "'";
      const { resources: users } = await container.items.query(qry).fetchAll();
      if (users.length > 0) {
        users.forEach(user => {
          partition_key_value = user.id; ///Container Partition Key
          row_id = user.id; //Container document id          
          const userObj = Object.assign({}, user, newItem);
          const result = container.item(row_id, partition_key_value).replace(userObj);
        });
        return 1;
      } else {
        return 0;
      }
    } catch (err) {
      return err;
    }

  }
  /**
  * Update model
  * 
  * @return model details 
  * 
 */
  async updateModel(model_id, newItem) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_model");
      var row_id = "";
      var partition_key_value = "";
      //Update database records    
      let qry = "SELECT * FROM c WHERE c.id = '" + model_id + "'";
      const { resources: model } = await container.items.query(qry).fetchAll();
      if (model.length > 0) {
        model.forEach(battery_model => {
          partition_key_value = battery_model.id; ///Container Partition Key
          row_id = battery_model.id; //Container document id          
          const batteryModelObj = Object.assign({}, battery_model, newItem);
          const result = container.item(row_id, partition_key_value).replace(batteryModelObj);
        });
        return 1;
      } else {
        return 0;
      }
    } catch (err) {
      return err;
    }

  }
  /**
   * Delete model data
   * 
   * @return Delete 
   * 
  */
  async deleteModelData(model_id) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_model");
      var row_id = "";
      var partition_key_value = "";
      //Update database records    
      let qry = "SELECT * FROM c WHERE c.id = '" + model_id + "'";
      const { resources: modelData } = await container.items.query(qry).fetchAll();
      if (modelData.length > 0) {
        modelData.forEach(data => {
          partition_key_value = data.id; ///Container Partition Key
          row_id = data.id;
          const result = container.item(row_id, partition_key_value).delete();
        });
        return 1;
      } else {
        return 0;
      }
    } catch (err) {
      return err;
    }
  }
  /**
   * Add model
   * 
   * @return 
   * 
  */
  async addModel(model_data) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_model");
      //Get database records      
      const result = await container.items.create(model_data);
      //Return result
      return result && result.resource ? result.resource : [];
    } catch (err) {
      return err;
    }
  }
  /**
  * Update battery
  * 
  * @return battery details 
  * 
 */
  async updateBattery(battery_id, newItem) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_detail");
      var row_id = "";
      var partition_key_value = "";
      //Update database records    
      let qry = "SELECT * FROM c WHERE c.id = '" + battery_id + "'";
      const { resources: batterys } = await container.items.query(qry).fetchAll();
      if (batterys.length > 0) {
        batterys.forEach(battery_detail => {
          partition_key_value = battery_detail.id; ///Container Partition Key
          row_id = battery_detail.id; //Container document id   
          const batteryObj = Object.assign({}, battery_detail, newItem);
          const result = container.item(row_id, partition_key_value).replace(batteryObj);
        });
        return 1;
      } else {
        return 0;
      }
    } catch (err) {
      return err;
    }

  }
  /**
   * Delete user
   * 
   * @return Delete user details 
   * 
  */
  async deleteUser(user_id) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("user");
      var row_id = "";
      var partition_key_value = "";
      //Update database records    
      let qry = "SELECT * FROM c WHERE c.id = '" + user_id + "'";
      const { resources: users } = await container.items.query(qry).fetchAll();
      if (users.length > 0) {
        users.forEach(user => {
          partition_key_value = user.id; ///Container Partition Key
          row_id = user.id; //Container document id
          //const userObj = Object.assign({},user,newItem);
          const result = container.item(row_id, partition_key_value).delete();
        });
        return 1;
      } else {
        return 0;
      }
    } catch (err) {
      return err;
    }
  }
  /**
    * Authenticate user 
    * 
    * @parms device_id, access_token
    * 
    * @return true on success and false on failure
    * 
   */
  async authenticate(device_id = '', access_token = '') {
    try {
      var tokenData = jwt.verify(access_token, process.env["ACCESS_TOKEN_SECRET"]);
      if (tokenData?.device_id == device_id) {
        //Get access token details from database
        //var tokenData = await commonCLI.select("authentication_details","SELECT c.id FROM authentication_details as c WHERE c.access_token='"+access_token+"' AND c.status='active' ORDER BY c._ts DESC OFFSET 0 LIMIT 1 ");
        //if(tokenData.length > 0){
        let newItem = {
          status: 'active',
          last_access_date: new Date()
        };
        await commonCLI.update({
          "containername": "authentication_details",
          "partitionkey": "id",
          "whereclouse": " WHERE c.access_token = '" + access_token + "' ",
          "newitem": newItem
        });
        return { "user_id": (tokenData?.user_id) ? tokenData.user_id : false }
        // }//end if
        // else{
        //   return false;
        // }        
      } else {
        return false;
      }
    } catch (error) {
      return await this.reGenerateAccessToken(access_token);
    }
  }
  /**
   * Re-Generate access token
   * 
   * @parms device_id, old_access_token
   * 
   * @return new token details in json format
   * 
  */
  async reGenerateAccessToken(exist_access_token = '') {
    if (exist_access_token != '') {
      //Get expired token details
      var user_data_list = await commonCLI.select("authentication_details", "SELECT * FROM authentication_details as c WHERE c.access_token='" + exist_access_token + "' ORDER BY c._ts DESC OFFSET 0 LIMIT 1 ");
      if (user_data_list.length > 0) {
        var userData = (typeof user_data_list[0] != undefined) ? user_data_list[0] : {};
        let device_id = (userData?.device_id) ? userData.device_id : '';
        let user_id = (userData?.user_id) ? userData.user_id : '';
        let id = (userData?.id) ? userData.id : '';
        let last_access_date = (userData?.last_access_date) ? new Date(userData.last_access_date) : '';
        const current_date = new Date();
        const diffTime = Math.abs(current_date - last_access_date);
        const diff_date = new Date(diffTime);
        const diffMins = diff_date.getMinutes();
        if ((device_id != '') && (user_id != '') && (diffMins <= process.env["TOKEN_RECHECK_MINS"])) {
          //Get settings    
          var settings = await this.getSecuritySetting();

          let token_expiry = (settings?.session_timeout) ? settings.session_timeout : "12";  //in months
          const access_token = jwt.sign({ device_id: device_id, user_id: user_id }, process.env["ACCESS_TOKEN_SECRET"],
            {
              expiresIn: token_expiry + "m", //in months
            });

          let newItem = {
            status: 'active',
            access_token: access_token,
            last_access_date: current_date,
            date_updated: current_date
          };
          await commonCLI.update({
            "containername": "authentication_details",
            "partitionkey": "id",
            "whereclouse": " WHERE c.id = '" + id + "' ",
            "newitem": newItem
          });

          return { user_id: user_id, access_token: access_token };
        }//end device_id && user_id if 
        else {
          return false;
        }

      }//End if user_data_list  
      else {
        return false;
      }
    }//End expired_access_token if
    else {
      return false;
    }
  }
  /**
   * Delete user
   * 
   * @return Delete user details 
   * 
  */
  async deleteAccessToken(device_id = '') {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("authentication_details");
      var row_id = "";
      var partition_key_value = "";
      //Update database records    
      let qry = "SELECT * FROM c where c.device_id='" + device_id + "'";
      const { resources: tokens } = await container.items.query(qry).fetchAll();
      if (tokens.length > 0) {
        tokens.forEach(token => {
          partition_key_value = token.device_id; ///Container Partition Key
          row_id = token.id; //Container document id
          const result = container.item(row_id, partition_key_value).delete();
        });
        return 1;
      } else {
        return 0;
      }
    } catch (err) {
      return err;
    }
  }
  customDateTimeFormate(dt) {

    var current_date = dt.getDate(),
      current_month = dt.getMonth() + 1,
      current_year = dt.getFullYear(),
      current_hrs = dt.getHours(),
      current_mins = dt.getMinutes(),
      current_secs = dt.getSeconds(),
      current_milli_secs = dt.getMilliseconds();

    // Add 0 before date, month, hrs, mins or secs if they are less than 0
    current_date = current_date < 10 ? '0' + current_date : current_date;
    current_month = current_month < 10 ? '0' + current_month : current_month;
    current_hrs = current_hrs < 10 ? '0' + current_hrs : current_hrs;
    current_mins = current_mins < 10 ? '0' + current_mins : current_mins;
    current_secs = current_secs < 10 ? '0' + current_secs : current_secs;
    current_milli_secs = current_milli_secs < 10 ? '0' + current_milli_secs : current_milli_secs;

    // Current datetime
    // String such as 2016-07-16T19:20:30
    return current_year + '-' + current_month + '-' + current_date + 'T' + current_hrs + ':' + current_mins + ':' + current_secs + "." + current_milli_secs + "Z";

  }

  /**
  * Get Notification by User ID
  * 
  * @return Notification list
  * 
 */
  async getUserNotification(user_id, OFFSET = 0, limit = 0) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("notifications");
      //Get database records  
      let qry = "SELECT * FROM c WHERE c.send_to='" + user_id + "' AND c.status='show' ORDER BY c.date_added DESC";
      ///Set limit
      if (limit > 0) {
        qry += " OFFSET " + OFFSET + " LIMIT " + limit;
      }
      //console.log(qry);          
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
  * Get Notification settings
  * 
  * @return Notification setting list
  * 
 */
  async getNotificationSettings() {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("battery_data_fields");
      //Get database records  
      let qry = "SELECT * FROM c WHERE c.id!='' ";
      console.log(qry);
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Update notification
   * 
   * @return notification details 
   * 
  */
  async updateNotification(id, newItem) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("notifications");
      var row_id = "";
      var partition_key_value = "";
      //Update database records    
      let qry = "SELECT * FROM c WHERE c.id = '" + id + "'";
      const { resources: notificationsData } = await container.items.query(qry).fetchAll();
      if (notificationsData.length > 0) {
        notificationsData.forEach(notifications => {
          partition_key_value = notifications.id; ///Container Partition Key
          row_id = notifications.id; //Container document id   
          const notificationsObj = Object.assign({}, notifications, newItem);
          const result = container.item(row_id, partition_key_value).replace(notificationsObj);
        });
        return 1;
      } else {
        return 0;
      }
    } catch (err) {
      return err;
    }

  }
  /**
     * Update notification
     * 
     * @return notification details 
     * 
    */
  async addErrorLog(log_data) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("error_logs");
      //add database records      
      const result = await container.items.create(log_data);
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
    * Get Battery details by serial number OR battery id
    * 
    * @return battery detail
    * 
   */
  async getSettings() {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("setting");
      //Get database records
      let qry = "SELECT * FROM c";
      const result = await container.items.query(qry).fetchAll();
      //console.log(qry);
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Add Notification
   * 
   * @return 
   * 
  */
  async addNotification(notification_data) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("notifications");
      //Get database records      
      const result = await container.items.create(notification_data);
      //Return result
      return result && result.resource ? result.resource : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Add Nordicboard data
   * 
   * @return Add data 
   * 
  */
  async addNordicboardData(nordicboard_data) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("nordicboard_data");
      //Get database records      
      const result = await container.items.create(nordicboard_data);
      //Return result
      return result && result.resource ? result.resource : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Get Nordic data
   * 
   * @return nordic board data 
   * 
  */
  async getNordicData(offset = 0, limit = 0) {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("nordicboard_data");
      //Get database records
      let qry = "SELECT * FROM c where c.id != '' ORDER BY c._ts DESC";
      ///Set limit
      if (limit > 0) {
        qry += " OFFSET " + offset + " LIMIT " + limit;
      }
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    } catch (err) {
      return err;
    }
  }
  /**
   * Delete nordic board data
   * 
   * @return Delete 
   * 
  */
  async deleteNordicData() {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("nordicboard_data");
      var row_id = "";
      var partition_key_value = "";
      //Update database records    
      let qry = "SELECT * FROM c ";
      const { resources: nordicData } = await container.items.query(qry).fetchAll();
      if (nordicData.length > 0) {
        nordicData.forEach(data => {
          partition_key_value = data.id; ///Container Partition Key
          row_id = data.id;
          const result = container.item(row_id, partition_key_value).delete();
        });
        return 1;
      } else {
        return 0;
      }
    } catch (err) {
      return err;
    }
  }
  /**
   * Get total Nordic boards entries
   * 
   * @return total
   * 
  */
  async getTotalNordicDataLogs(battery_unique_id = '') {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("nordicboard_data");
      //Get database records
      let qry = "SELECT COUNT(c.battery_unique_id) as total FROM c WHERE c.battery_unique_id = '" + battery_unique_id + "' ";

      const result = await container.items.query(qry).fetchAll();
      //Return result
      let total_records = result && result.resources ? result.resources : [];
      let total_logs = 0;
      if (total_records.length > 0) {
        total_records.forEach((data) => {
          total_logs = data['total'];
        });
      }
      return total_logs;
    } catch (err) {
      return err;
    }
  }
  /**
  * Get security settings
  * 
  * @return security settings json
  * 
 */
  async getSecuritySetting() {
    try {
      //Select database by passing the database name
      let db = await this.client.database(process.env["COSMOS_DB_NAME"]);
      //Select the container 
      let container = await db.container("setting");
      //Get database records  
      let qry = "SELECT * FROM c where c.id != '' ORDER BY c._ts DESC OFFSET 0 LIMIT 1";
      const result = await container.items.query(qry).fetchAll();
      //Return result
      let securitySettings = result && result.resources ? result.resources : [];
      let returnData = {};
      if (securitySettings.length > 0) {
        securitySettings.forEach(data => {
          returnData = {
            "complexity": data?.complexity ? data.complexity : '',
            "session_timeout": data?.session_timeout ? data.session_timeout : 0,
            "login_attempts": data?.login_attempts ? data.login_attempts : 0,
            "two_factor_authentication": data?.two_factor_authentication ? data.two_factor_authentication : 0,
            "notification_send_to_user": data?.notification_send_to_user ? data.notification_send_to_user : '',
            "notification_severity_include": data?.notification_severity_include ? data.notification_severity_include : '',
            "notification_filters": data?.notification_filters ? data.notification_filters : '',
            "deployment_notification_subscription": data?.deployment_notification_subscription ? data.deployment_notification_subscription : '',
            "id": data.id
          };
        });
      }
      return returnData;
    } catch (err) {
      return err;
    }
  }
  convertFromStringToDate(dateString = '') {
    let formattedDateTime = '';
    if (dateString != '') {
      // let unix_timestamp = Date.parse(dateString);                
      let date = new Date(dateString);
      console.log("Line 1506");
      console.log(date);
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let hours = date.getHours();
      let minutes = "0" + date.getMinutes();
      let seconds = "0" + date.getSeconds();
      formattedDateTime = day + '/' + month + '/' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    }
    return formattedDateTime;

  }

}//end class
module.exports = new Cosmos;