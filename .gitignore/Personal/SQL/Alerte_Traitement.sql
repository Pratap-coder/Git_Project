SELECT DISTINCT 
    SIREN,
    Alerte_Code,
    Raison_Sociale,
    Adresse, 
    CP_Ville, 
    Type_Evenement, 
    Nouvelle_Valeur_Retenue, 
    Precedente_Valeur_Retenue, 
    Evenement, 
    Source, 
    Date_Reception
FROM Unique_Alerte_SIREN 
WHERE IsProcessed = 0
AND Alerte_Code IN (SELECT DISTINCT 
                        Alerte_Code
                    FROM Alerte_Document
                    WHERE Send_Email = 1
                    )