const CosmosClient = require('@azure/cosmos').CosmosClient;
class Cosmos {
  static client;
  constructor(){     
     this.setDBObj();
  }
  /**
   * Create database connection
   * 
   *
   * @return database connection object
   *  
  */
  setDBObj(){
    try{
      this.client = new CosmosClient({
          endpoint: process.env["nrfCOSMOS_DB_URL"],
          key:process.env["nrfCOSMOS_DB_RESOURCE_KEY"]
        });      
    } catch(err){
      return false;
    }    
    //return db;
  } 

  async getData(){
    try{
      //Select database by passing the database name
      let db = await this.client.database(process.env["nrfCOSMOS_DB_NAME"]);  
      //Select the container 
      let container = await db.container("updates");
      //Get database records
      let qry = "SELECT * FROM updates ";
      const result = await container.items.query(qry).fetchAll();
      //Return result
      return result && result.resources ? result.resources : [];
    }catch(err){
      return err;
    }    
  }
  
  
  
}//end class
module.exports = new Cosmos;