<script runat="server">
Platform.Load("core", "1.1.1");
try {
    // 1. Get current date in France (SFMC server is CST, so add ~7 hours to be safe)
    var serverTime = new Date();
    var frTime = new Date(serverTime.getTime() + (7 * 60 * 60 * 1000));
    var yyyy = frTime.getFullYear();
    var mm = (frTime.getMonth() + 1).toString();
    if(mm.length < 2) mm = '0' + mm;
    var dd = frTime.getDate().toString();
    if(dd.length < 2) dd = '0' + dd;
    var todayStr = yyyy + '-' + mm + '-' + dd;
    var isWorkingDay = true;
    var dayOfWeek = frTime.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Check if weekend
    if (dayOfWeek == 0 || dayOfWeek == 6) {
        isWorkingDay = false;
    } else {
        // Check if public holiday
        var req = new Script.Util.HttpRequest("https://calendrier.api.gouv.fr/jours-feries/metropole.json");
        req.emptyContentHandling = 0;
        req.retries = 2;
        req.continueOnError = true;
        req.method = "GET";
        var resp = req.send();
        if (resp.statusCode == 200) {
            var holidays = Platform.Function.ParseJSON(String(resp.content));
            if (holidays[todayStr]) {
                isWorkingDay = false; 
            }
        }
    }
	
    var deCustomerKey = "28147ECF-F2A2-4FEE-A536-EAAF367B6E3C";
    
    // 2. Clear the Data Extension to ensure it is completely empty
    var prox = new Script.Util.WSProxy();
    prox.performItem("DataExtension", { CustomerKey: deCustomerKey }, "ClearData", null);

    // 3. If it's a working day, add exactly 1 record back into the DE
    if (isWorkingDay) {
        var controlDE = DataExtension.Init(deCustomerKey);
        controlDE.Rows.Add({ "Id": "1", "IsWorkingDay": true });
    }

} catch (e) {
    Write(Stringify(e));
}
</script>