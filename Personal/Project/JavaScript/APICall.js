<script runat="server">
Platform.Load("Core","1.1");

try {
    // ========================================================================
    // ETAPE 1 : Récupération de l'Access Token (1er appel)
    // ========================================================================
    // Note: URL pointant vers le endpoint d'Apigee (ou votre middleware proxy mTLS)
    var authEndpoint = "https://votre-middleware-ou-apigee/auth"; 
    var authPayload = {}; // payload vide ou contenant les credentials requis
    
    var authReq = new Script.Util.HttpRequest(authEndpoint);
    authReq.emptyContentHandling = 0;
    authReq.retries = 2;
    authReq.continueOnError = true;
    authReq.contentType = "application/json";
    authReq.method = "POST";
    authReq.postData = Stringify(authPayload);

    var authResp = authReq.send();
    
    if (authResp.statusCode != 200) {
        throw "Échec du 1er appel : Impossible de récupérer le token depuis Apigee.";
    }
    
    var authRespContent = Platform.Function.ParseJSON(String(authResp.content));
    
    // Extraction du jeton depuis la réponse (adaptez la clé selon le JSON d'Apigee)
    var accessToken = authRespContent.access_token; 
    
    if (!accessToken) {
        throw "Token manquant dans la réponse d'Apigee.";
    }

    // ========================================================================
    // ETAPE 2 : Appel API Métier (2e appel sans certificat, avec jeton)
    // ========================================================================
    // Remplacez * par l'ID de la campagne
    var targetEndpoint = "https://api.arkea.com/voicecampaigns/12345/targets"; 
    var targetPayload = {
        // ... structure attendue par l'API Voice Campaigns d'Arkéa ...
        "contacts": [
            {"id": "001", "phone": "0600000001"}
        ]
    };
    
    var targetReq = new Script.Util.HttpRequest(targetEndpoint);
    targetReq.emptyContentHandling = 0;
    targetReq.retries = 2;
    targetReq.continueOnError = true;
    targetReq.contentType = "application/json";
    targetReq.method = "POST";
    
    // Ajout du fameux jeton dans le Header "Authorization"
    targetReq.setHeader("Authorization", "Bearer " + accessToken);
    
    targetReq.postData = Stringify(targetPayload);

    var targetResp = targetReq.send();
    
    // Gestion du succès ou de l'erreur du 2e appel
    if (targetResp.statusCode == 200 || targetResp.statusCode == 201) {
        Write("Succès : Les cibles ont été poussées vers le SI Arkéa.");
    } else if (targetResp.statusCode == 401) {
        Write("Erreur 401 : Le token est expiré ou invalide.");
        // Gérer le renouvellement du token si nécessaire
    } else {
        Write("Erreur lors de l'envoi des cibles : " + String(targetResp.content));
    }

} catch(e) {
    Write("Une exception critique est survenue : " + Stringify(e));
    // Bonne pratique : Insérer l'erreur en base (Data Extension) pour faciliter le débuggage
}
</script>