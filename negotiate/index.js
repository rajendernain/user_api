module.exports = async function (context, req,connectionInfo) {
    //This function used for SignalR request token,
    //This function called automatically by app on connection creation.
   context.res = {
        body: connectionInfo
    };
}