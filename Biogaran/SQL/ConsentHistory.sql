SELECT 
    a.MobilePhone,
    CASE WHEN a.MobilePhone IS NOT NULL AND b.ID IS NOT NULL THEN b.ID
    ELSE a.ID
    END AS ID,
    a.Change_Date,
    a.Email,
    a.Source,
    a.Optin_Email_Transactionnel,
    a.Optin_Email_Notifications,
    a.Optin_Email_Promotionnel,
    a.Optin_Email_Actualités_Promotionnelles,
    a.Optin_SMS_Promotionnel,
    a.Optin_SMS_Notifications,
    a.Optin_SMS_Transactionnel
FROM Communication_Preferences a
LEFT JOIN ENT.Contact_Salesforce_3 b
    ON a.MobilePhone = Concat('33', RIGHT(b.MobilePhone, 9))