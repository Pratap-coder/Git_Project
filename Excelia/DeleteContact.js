<script runat='server'>

    Platform.Load("core","1.1.5");
    
    var logDE = 'DE_log_purgeContacts';
    var log = DataExtension.Init(logDE);
    
    log.Rows.Add({"date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "********************************"});
    log.Rows.Add({"date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "Script purge starting..."});
    
    // Initialise the DE containing the contacts to purge
    var DE = '639DB07D-2262-4776-BF2D-8AE06646D232';
    
    //AUTHENTICATE
    var url = "https://mcbsrzt7n96hl-f2h14jssf7z1c4.auth.marketingcloudapis.com/v2/token";
    var contentType = "application/json";
    
    var payload = '{"grant_type": "client_credentials",';
        payload += '"client_id": "rgx61lale901vxkksinvo2os",';
        payload += '"client_secret": "BNbAX9WgZGVcehw5D57WojvF"}';

    var accessTokenResult = HTTP.Post(url, contentType, payload);
    var accessToken = Platform.Function.ParseJSON(accessTokenResult["Response"][0]).access_token;
    log.Rows.Add({"date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "accessToken: " + accessToken});
   
    if (accessToken != "") {
        //EXECUTE
            var deleteUrl = 'https://mcbsrzt7n96hl-f2h14jssf7z1c4.rest.marketingcloudapis.com/contacts/v1/contacts/actions/delete?type=listReference';
            
            var payload = '{"deleteOperationType":"ContactAndAttributes",';
            	payload += '"targetList": {';
            	payload += '"listType": {';
            	payload += '"listTypeID": 3},';
            	payload += '"listKey": "' + DE + '"},';
            	payload += '"deleteListWhenCompleted": false,';
            	payload += '"deleteListContentsWhenCompleted": false}';
            
            log.Rows.Add({"date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "payload: " + payload});
            
            var headerNames = ["Authorization"];
            var headerValues = ["Bearer " + accessToken];
            
            log.Rows.Add({"date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "headerNames: " + headerNames});
            log.Rows.Add({"date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "headerValues: " + headerValues});
            log.Rows.Add({"date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "contentType: " + contentType});
            
            
            
            try {
                var result = HTTP.Post(deleteUrl, contentType, payload, headerNames, headerValues);
                result = Stringify(result).replace(/[\n\r]/g, '');
                log.Rows.Add({"date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "result: " + result});

            } catch (e) {
                
                e = Stringify(e).replace(/[\n\r]/g, '');
                log.Rows.Add({"date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "error: " + e});
                
            }
    }
   
    log.Rows.Add({"date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "Script purge ending..."});
    log.Rows.Add({"date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "********************************"});

  
  
</script>