const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"],process.env["COSMOS_DB_RESOURCE_KEY"],process.env["COSMOS_DB_NAME"],process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, req) {
    //Get data from header
    var device_id    = req?.headers?.device_id?req.headers.device_id:'';
    var access_token = req?.headers?.access_token?req.headers.access_token:'';
    var ip_address   = req?.headers['x-forwarded-for']?req.headers['x-forwarded-for']:'';
   
    //Validate device, access token and user id and authenticate device access
    if((device_id == '') || (access_token == '')){
       
        context.res = {
            status: 200,
            body: {
                status:"fail",
                message:"You are not looking authorized user."
            }
        };
    }
    else
    {
        //Token expired and status change from active to inactive
        let newItem = {
            status:'inactive',
            logout_date:new Date()
        };            
        await commonCLI.update({
            "containername":"authentication_details",
            "partitionkey":"id",
            "whereclouse":" WHERE c.access_token = '"+access_token+"' ",
            "newitem":newItem
        });
        context.res = {
            status: 200,
            body: {
                status:"success",
                message:"Logout successfully."
            }
        };  
    }   
    

}