const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"],process.env["COSMOS_DB_RESOURCE_KEY"],process.env["COSMOS_DB_NAME"],process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {
    var action = (req?.body?.action)?req.body.action:'get';
    var search = (typeof req.body.search != 'undefined')?req.body.search:'';
    var liveData = [];
    if(action == 'delete'){
      let aa =  await commonCLI.delete({
            "containername":"device_feed",
            "partitionkey":"id",
            "whereclouse":" WHERE c.id != '' "
        });
        //Return response
        context.res = {
            status: 200, /* Defaults to 200 */
            body: {
                status:"success",
                message:"Data deleted successfully"
            }
        }; 
    }else{
        let device_info = [];
        liveData =  await commonCLI.select("device_feed","SELECT * FROM device_feed as c ORDER BY c._ts DESC  OFFSET 0 LIMIT 5 ");
        //Return response
        liveData.forEach(device => {
            delete device.id;
            delete device._rid;
            delete device._self;
            delete device._etag;
            delete device._attachments;
            delete device._ts;
            device_info.push(device)
        });          
        context.res = {
            status: 200, /* Defaults to 200 */
            body: {
                data:device_info,
                status:"success",
                message:"Data fetched successfully"
            }
        }; 
    }
}
