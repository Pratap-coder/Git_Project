<script runat="server">
Platform.Load("Core", "1.1.5");
 
var logDE = 'UAT_log_SSJS_toINO';
var log = DataExtension.Init(logDE);
 
log.Rows.Add({ "date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "********************************" });
log.Rows.Add({ "date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "Script Segments_to_INO starting..." });
 

// =========================================================================
// STEP 1: AUTHENTICATION CALL TO GET THE BEARER TOKEN
// =========================================================================

// UPDATE THESE VARIABLES FOR YOUR AUTHENTICATION ENDPOINT
var authUrl = 'https://api-auth.arkea.com/oauth2/token'; // <-- Change to your actual Token Endpoint URL
var authContentType = 'application/x-www-form-urlencoded'; // <-- Could also be 'application/json' depending on the API
var authPayload = 'grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET'; // <-- Change to your new key/payload

var accessToken = "";
var isAuthSuccess = false;

try {
    // Send request to get the token
    var authResponse = HTTP.Post(authUrl, authContentType, authPayload);
    
    if (authResponse.StatusCode == 200) {
        // Parse the JSON response
        var authJson = Platform.Function.ParseJSON(authResponse.Response[0]);
        accessToken = authJson.access_token; // Assumes the response has {"access_token": "..."}
        isAuthSuccess = true;
        
        log.Rows.Add({ "date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "Auth successful: Bearer token retrieved." });
    } else {
        log.Rows.Add({ "date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "Auth Failed. Status: " + authResponse.StatusCode });
    }
} catch (e) {
    log.Rows.Add({ "date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "Auth Error: " + String(e) });
}

// =========================================================================
// STEP 2: ONLY PROCEED TO SEND SEGMENTS IF WE HAVE THE TOKEN
// =========================================================================

if (isAuthSuccess && accessToken != "") {

    var segmentsDEKey = '7457F7EB-CA96-4006-ABCD-8C14BBFC6BA4';
    var deSegments = DataExtension.Init(segmentsDEKey);
     
    var RefDEKey = 'A9234E65-9141-479C-9D0B-46ABAB5C4439';
    var deRef = DataExtension.Init(RefDEKey);
     
    var allRef = deRef.Rows.Retrieve();
    var campagneSet = {};
     
    for (var i = 0; i < allRef.length; i++) {
        var camp = allRef[i].CampagneId;
        campagneSet[camp] = true;
    }
     
    // API headers for the main segment request
    var apikey = 'rFU3V24gIEj6ZN4I6kOEbklcN5U5GTGA';
    var kid = 'rFU3V24gIEj6ZN4I6kOEbklcN5U5GTGA';
     
    for (var campagneId in campagneSet) {
     
        var hasMore = true;
        while (hasMore) {
     
            // Récupération des lignes non envoyées pour cette campagne
            var filtre = { Property: "CampagneId", SimpleOperator: "equals", Value: campagneId };
            var filtre2 = { Property: "Flag_Envoye_INO", SimpleOperator: "equals", Value: "False" };
     
            var filtreCombi = {
                LeftOperand: filtre,
                LogicalOperator: "AND",
                RightOperand: filtre2
            };
     
            var rows = deSegments.Rows.Retrieve(filtreCombi);
     
            if (rows.length === 0) {
                log.Rows.Add({"date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "Aucun contact à envoyer pour " + campagneId + ""});
                hasMore = false
                break;
            }
     
            // Génération du XML
            var xmlBody = '<?xml version="1.0" encoding="UTF-8"?><contacts>';
            var clientsToUpdate = [];
            var inoCampagneId = ""; // Added to fix the URL variable bug safely
     
            for (var j = 0; j < rows.length; j++) {
                var r = rows[j];
                
                // Grab the INO_CampagneId from the first row safely
                if (j === 0) { inoCampagneId = r.INO_CampagneId; }
                
                var phone = r.numero_telephone ? "+" + r.numero_telephone : "";
     
                xmlBody += '<contact>';
                xmlBody += '<customerId>' + r.numero_tiers + '</customerId>';
                xmlBody += '<phoneNumber>' + phone + '</phoneNumber>';
                xmlBody += '<companyId>' + r.code_societe + '</companyId>';
                xmlBody += '<priority>100</priority>';
                xmlBody += '<contractId>' + r.numero_etude + '</contractId>';
                xmlBody += '<targetLayoutId>8</targetLayoutId>';
                xmlBody += '<displayedCallerId>' + r.numero_presentation + '</displayedCallerId>';
                xmlBody += '<efsCode>' + r.codeEFS + '</efsCode>';
                xmlBody += '</contact>';
     
                clientsToUpdate.push(r.numero_tiers);
            }
     
            xmlBody += '</contacts>';
     
            log.Rows.Add({
                "date_log": Platform.Function.SystemDateToLocalDate(Now()),
                "Message": "Campagne " + campagneId + " - batch size : " + rows.length
            });
     
            var url = 'https://api-financo.rec.arkea.com/ino/voicecampaigns/' + inoCampagneId + '/targets';
            var contentType = 'application/xml';
            var headers = ["x-apikey", "kid", "authorization"];
            
            // WE NOW USE THE NEW TOKEN WE GOT IN STEP 1
            var token = "Bearer " + accessToken; 
            var values = [apikey, kid, token];
     
            try {
                var response = HTTP.Post(url, contentType, xmlBody, headers, values);
     
                if (response.StatusCode == 201) {
     
                    log.Rows.Add({
                        "date_log": Platform.Function.SystemDateToLocalDate(Now()),
                        "Message": "Campagne " + campagneId + " : envoi réussi (" + rows.length + " lignes)"
                    });
                    // Mise à jour dans la DE pour chaque prospect
                    for (var k = 0; k < clientsToUpdate.length; k++) {
                        deSegments.Rows.Update(
                            { Flag_Envoye_INO: "True", Date_Envoi_INO: Platform.Function.Now() },
                            ["numero_tiers", "CampagneId"],
                            [clientsToUpdate[k], campagneId]
                        );
                    }
                } else {
                    log.Rows.Add({"date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "response.StatusCode : " + response.StatusCode});
                }
     
            } catch (e){
                log.Rows.Add({"date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "erreur Post XML : " + String(e)});
            }
     
            if (rows.length >= 2500) {
                hasMore = true;
            } else {
                hasMore = false;
            }
        }
    }
} else {
    log.Rows.Add({ "date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "Script aborted because Authentication Token could not be retrieved." });
}
 
log.Rows.Add({ "date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "Script Segments_to_INO ending..." });
log.Rows.Add({ "date_log": Platform.Function.SystemDateToLocalDate(Now()), "Message": "********************************" });
</script>