SELECT 
    ID,
    Email,
    Pixel_Consent__c AS Pixel_Consent,
    IIF(Pixel_Consent__c = 1, 'False', 'True') AS DoNotTrack
FROM Contact_Salesforce_2 
WHERE Email IS NOT NULL