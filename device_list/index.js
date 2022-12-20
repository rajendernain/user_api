const commonObj = require('../common/cosmos');
module.exports = async function (context, req) {
    //Get data from header
    var device_id = (typeof req.headers.device_id != 'undefined')?req.headers.device_id:'';
    var access_token = (typeof req.headers.access_token != 'undefined')?req.headers.access_token:'';
    //Get post data
    var search = (typeof req.body.search != 'undefined')?req.body.search:'';
    var sort = (typeof req.body.sort != 'undefined')?req.body.sort:'datetime';
    var limit = (typeof req.body.limit != 'undefined')?req.body.limit:10;
    var page_number = (typeof req.body.page != 'undefined')?req.body.page:1;    
    var offset = (typeof req.body.offset != 'undefined')?req.body.offset:0;
    var customer_id = (typeof req.body.customer_id != 'undefined')?req.body.customer_id:'';
    //Global variables
    var user_id = '';
    var errors = [];
    var authorizedUser;
    var new_token = '';
    //Validations
    if((device_id == '') || (access_token == '')){
        errors.push("You are not looking authorized user.");
    }else{
        var token_data = await commonObj.authenticate(device_id,access_token);
        if(typeof token_data.access_token != 'undefined'){
          new_token = token_data.access_token;
          user_id = token_data.user_id;
        }else if(typeof token_data.user_id != 'undefined'){
          user_id = token_data.user_id;
        }
    }     
    //Authentication check
    if(!user_id && (errors.length <= 0)){
        context.res = {
            status: 200,
           body: {
               status:"fail",
               authentication:0,
               message:"Authentication failed."
           }
       };
    } else if(errors.length <= 0){ //Proceed data
            let offset_value = (offset<=0)?((limit*page_number)-limit):offset; 
            var batteryListArr = [];           
            user_id = (customer_id != '')?customer_id:user_id;
            var allBatteryList =  await commonObj.getBatteryList(user_id,search,sort,false,offset_value,limit); 
            allBatteryList.forEach(battery => {
                batteryListArr.push(
                    {  
                        id:(typeof battery.id != 'undefined')?battery.id:'', 
                        user_id:(typeof battery.user_id != 'undefined')?battery.user_id:'',
                        client_id:(typeof battery.client_id != 'undefined')?battery.client_id:'',
                        serial_number:(typeof battery.serial_number != 'undefined')?battery.serial_number:'',
                        overheating_count:(typeof battery.overheating_count != 'undefined')?battery.overheating_count:'',
                        manufacturer_name:(typeof battery.company_name != 'undefined')?battery.company_name:'',
                        status:(typeof battery.status != 'undefined')?battery.status:'',
                        device_img:(typeof battery.device_img != 'undefined')?battery.device_img:'',
                        model_id:(typeof battery.model_id != 'undefined')?battery.model_id:'',
                        model_name:(typeof battery.model_name != 'undefined')?battery.model_name:'',                                        
                        ip:(typeof battery.ip != 'undefined')?battery.ip:'',
                        last_scanned:(typeof battery.last_scanned != 'undefined')?battery.last_scanned:'',
                        device_assigned_date:(typeof battery.device_assigned_date != 'undefined')?battery.device_assigned_date:'',
                    }
                );
            }); 
            context.res = {
                status: 200, /* Defaults to 200 */
                body: {
                    status:"success",
                    data:batteryListArr,
                    message:"Data fetched successfully."
                }
            };      
            //Add new access token
            if(new_token != ''){
              context.res.body.new_token = new_token;
            }     
    }else{
        context.res = {
            status: 200,
           body: {
               status:"fail",
               message:errors
           }
       };
    }    
}