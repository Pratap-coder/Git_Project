SELECT 
    b.ID,
    a.MobilePhone,
    a.Change_Date,
    a.Optin_SMS_Promotionnel,
    a.Optin_SMS_Notifications,
    a.Optin_SMS_Transactionnel
FROM Communication_Preferences a
INNER JOIN ENT.Contact_Salesforce_3 b
    ON a.MobilePhone = Concat('33', RIGHT(b.MobilePhone, 9))