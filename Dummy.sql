SELECT 
    a.MobilePhone,
    a.ID,
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
WHERE CAST(a.Change_Date AS DATE) >= CAST(GETDATE() AS DATE)