const jwt = require('jsonwebtoken');
const commonCLI = require('common-cls');
commonCLI.init(process.env["COSMOS_DB_URL"],process.env["COSMOS_DB_RESOURCE_KEY"],process.env["COSMOS_DB_NAME"],process.env["ENCRYPTION_ALGORITHM"]);
module.exports = async function (context, myTimer) {
    var activeTokenList = await commonCLI.select("authentication_details","SELECT * FROM authentication_details as c WHERE c.status='active' AND c.role_id='3' ORDER BY c._ts DESC");
    if(activeTokenList.length > 0){
        var break_loop = false;
        for (let index = 0; index < activeTokenList.length; index++) {
            if(!break_loop){
                const tokenArr = activeTokenList[index];        
                let user_id = tokenArr.user_id;
                let device_id = tokenArr.device_id;       
                let id = tokenArr.id;
                let last_access_date = (tokenArr?.last_access_date)?new Date(tokenArr.last_access_date):'';  
                const current_date = new Date();
                const diffTime = Math.abs(current_date - last_access_date);
                const diff_date = new Date(diffTime);
                const diffMins = diff_date.getMinutes();
                //context.log("user_id:"+user_id+" device_id:"+device_id+" role_id:"+role_id+" last_access_date:"+last_access_date+" current_date:"+current_date+" diffMins:"+diffMins);
                if((device_id != '') && (user_id != '') && (diffMins > process.env["TOKEN_RECHECK_MINS"])){            
                //if((device_id != '') && (user_id != '')){
                    try {
                        var tokenData = jwt.verify(tokenArr.access_token,process.env["ACCESS_TOKEN_SECRET"]);   
                    }
                    catch(e){
                        break_loop = true;
                        context.bindings.signalRMessages = [{
                            "target": "usertokenexpire",
                            "arguments": [user_id]
                        }];
                    //Update access token status to expire
                    await commonCLI.update({
                        containername:"authentication_details",
                        partitionkey:"id",
                        whereclouse:" WHERE c.id='"+id+"'",
                        newitem:{status:'inactive'}
                    });
                    break; //break loop
                    } //end catch                    
                } //end if device_id, user_id 
            }//end if break_loop
        }//end for loop
    }
    // var timeStamp = new Date().toISOString();
    // context.log("Hi");
    // if (myTimer.isPastDue)
    // {
    //     context.log('JavaScript is running late!');
    // }
    // context.log('JavaScript timer trigger function ran!', timeStamp);   
};