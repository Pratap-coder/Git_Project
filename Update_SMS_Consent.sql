SELECT 
    b.ID,
    a.MobilePhone,
    a.Change_Date,
    COALESCE(a.Optin_SMS_Promotionnel,b.Optin_SMS_Promotionnel) AS Optin_SMS_Promotionnel,
    COALESCE(a.Optin_SMS_Notifications,b.Optin_SMS_Notifications) AS Optin_SMS_Notifications,
    COALESCE(a.Optin_SMS_Transactionnel,b.Optin_SMS_Transactionnel) AS Optin_SMS_Transactionnel
FROM Communication_Preferences a
INNER JOIN (SELECT DISTINCT
                A.ContactId AS ID,
                Concat('33', RIGHT(B.MobilePhone, 9)) AS MobilePhone,
                B.OptinSMSPromotionnel__c AS Optin_SMS_Promotionnel,
                B.OptinSmsNotifications__c AS Optin_SMS_Notifications, 
                B.OptinSMSTransactionnel__c AS Optin_SMS_Transactionnel
            FROM ENT.AccountContactRelation_Salesforce_3 A
            INNER JOIN ENT.Contact_Salesforce_3 B 
                ON A.ContactId = B.Id
            WHERE A.ContactPrincipal__c = 'true'
            ) b
    ON a.MobilePhone = b.MobilePhone
WHERE a.Source = 'SMS'

SELECT DISTINCT
    A.ContactId AS ID,
    Concat('33', RIGHT(B.MobilePhone, 9)) AS MobilePhone,
    B.OptinSMSPromotionnel__c AS Optin_SMS_Promotionnel,
    B.OptinSmsNotifications__c AS Optin_SMS_Notifications, 
    B.OptinSMSTransactionnel__c AS Optin_SMS_Transactionnel
FROM ENT.AccountContactRelation_Salesforce_3 A
INNER JOIN ENT.Contact_Salesforce_3 B 
    ON A.ContactId = B.Id
WHERE A.ContactPrincipal__c = 'true'
    
