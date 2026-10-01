<script runat="server">
Platform.Load("Core", "1.1.5");

try {
    // --- CONFIGURATION ---
    var sourceDEName = "SIREN_Alerte_Document"; // Name of your original DE
    var targetDEName = "SIREN_Alerts_Uni_Documents"; // Name of your new DE
    var docSeparator = " | "; // How you want the final unique documents separated
    // ---------------------

    var prox = new Script.Util.WSProxy();
    var cols = ["SIREN", "Alerte", "Document"];
    var moreData = true;
    var reqID = null;

    // Object to hold our grouped data in memory
    var sirenMap = {};

    Write("Starting data retrieval...<br>");

    // 1. RETRIEVE ALL DATA (Using WSProxy to bypass the 2500 row limit)
    while (moreData) {
        moreData = false;
        var data = reqID == null ?
            prox.retrieve("DataExtensionObject[" + sourceDEName + "]", cols) :
            prox.getNextBatch("DataExtensionObject[" + sourceDEName + "]", reqID);

        if (data != null && data.Results) {
            moreData = data.HasMoreRows;
            reqID = data.RequestID;

            for (var i = 0; i < data.Results.length; i++) {
                var props = data.Results[i].Properties;
                var siren = "";
                var alerte = "";
                var docString = "";

                // Extract column values
                for (var p = 0; p < props.length; p++) {
                    if (props[p].Name == "SIREN") siren = props[p].Value;
                    if (props[p].Name == "Alerte") alerte = props[p].Value;
                    if (props[p].Name == "Document") docString = props[p].Value;
                }

                if (!siren) continue; // Skip empty rows

                // Initialize the SIREN in our map if it doesn't exist yet
                if (!sirenMap[siren]) {
                    sirenMap[siren] = { alerts: [], documents: [] };
                }

                // 2. PROCESS ALERTS (Add if unique)
                if (alerte && sirenMap[siren].alerts.indexOf(alerte) === -1) {
                    sirenMap[siren].alerts.push(alerte);
                }

                // 3. PROCESS DOCUMENTS (Split, Clean, Add if unique)
                if (docString) {
                    // Split the string by the hyphen '-'
                    var docsArray = docString.split("-");
                    
                    for (var d = 0; d < docsArray.length; d++) {
                        // Clean whitespace from beginning and end of the extracted string
                        var singleDoc = docsArray[d].replace(/^\s+|\s+$/g, ''); 
                        
                        // If it's not empty, and not already in our array, add it
                        if (singleDoc.length > 0 && sirenMap[siren].documents.indexOf(singleDoc) === -1) {
                            sirenMap[siren].documents.push(singleDoc);
                        }
                    }
                }
            }
        }
    }

    Write("Data processing complete. Updating Target DE...<br>");

    // 4. WRITE DATA TO TARGET DE
    for (var key in sirenMap) {
        // Join the arrays back into single strings
        var finalAlerts = sirenMap[key].alerts.join(", ");
        var finalDocs = sirenMap[key].documents.join(docSeparator);

        // Upsert data into the target DE
        var rowsAffected = Platform.Function.UpsertData(
            targetDEName,
            ["SIREN"], // Primary Key column to match on
            [key],     // Primary Key value
            ["All_Alerts", "All_Unique_Documents"], // Columns to update
            [finalAlerts, finalDocs]                // Values to update
        );
    }

    Write("Script finished successfully.");

} catch (e) {
    // Print errors if they occur
    Write("Error: " + Stringify(e));
}
</script>