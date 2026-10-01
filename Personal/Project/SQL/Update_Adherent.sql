SELECT 
    A.SIREN,
    B.Adherent,
    A.Alerte_Code,
    A.Raison_Sociale,
    A.Type_Evenement,
    A.Nouvelle_Valeur_Retenue,
    A.Precedente_Valeur_Retenue,
    A.Evenement,
    A.Source,
    A.Date_Reception,
    B.Prenom_Gerant,
    B.Nom_Gerant,
    B.Telephone,
    B.Raison_commerciale,
    B.Commercial,
    B.Nom_Commercial,
    B.ATC_TELEPHONE,
    B.ATC_Email,
    B.RR,
    B.RR_Email,
    CASE 
        WHEN A.Alerte_Code = 'ALT_DIRIGEANT' THEN COALESCE(B.Email_Administratif, B.Email)
        ELSE COALESCE(B.Email_Dirigeant, B.Email_Administratif, B.Email) 
    END AS Email,
    B.Zone
FROM Unique_Alerte_SIREN A 
INNER JOIN KYC B ON A.SIREN = B.SIREN
WHERE A.Alerte_Code IN ('ALT_ADRESSE', 'ALT_CAPITAL', 'ALT_DIRIGEANT', 'ALT_FORMEJUR','ALT_RAISON_SOC','ALT_VENTE_CESS','ALT_TUP')