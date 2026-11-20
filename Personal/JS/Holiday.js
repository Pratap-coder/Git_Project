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
    if (dayOfWeek == 0 || dayOfWeek == 6) {
        isWorkingDay = false;
    } else {
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
	
    var controlDE = DataExtension.Init("28147ECF-F2A2-4FEE-A536-EAAF367B6E3C");
    controlDE.Rows.Update({"IsWorkingDay": isWorkingDay}, ["Id"], ["1"]);

} catch (e) {
    Write(Stringify(e));
}
</script>