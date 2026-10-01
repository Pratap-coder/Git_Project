SELECT 
    SIREN,
    Alerte_Code,
    Raison_Sociale,
    Adresse,
    CP_Ville,
    Type_Evenement,
    CASE WHEN Alerte_Code = 'ALT_SCORE' THEN REPLACE(LEFT(Nouvelle_Valeur_Retenue,2),'/','')
        ELSE Nouvelle_Valeur_Retenue
    END AS Nouvelle_Valeur_Retenue,
    CASE WHEN Alerte_Code = 'ALT_SCORE' THEN REPLACE(LEFT(Precedente_Valeur_Retenue,2),'/','')
        ELSE Precedente_Valeur_Retenue
    END AS Precedente_Valeur_Retenue,
    Evenement,
    Source,
    Date_Reception
FROM (
SELECT 
    SIREN,
    Alerte_Code,
    Raison_Sociale,
    Adresse,
    CP_Ville,
    Type_Evenement,
    Nouvelle_Valeur_Retenue,
    Precedente_Valeur_Retenue,
    Evenement_Retenue AS Evenement,
    Source,
    Date_Reception,
    ROW_NUMBER() OVER (PARTITION BY SIREN, Alerte_Code ORDER BY Date_Reception DESC) AS rn
FROM Daily_Alerts
)A
WHERE A.rn = 1