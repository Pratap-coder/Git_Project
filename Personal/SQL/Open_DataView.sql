SELECT 
    JobID,
    SubscriberID,
    SubscriberKey,
    EventDate,
    Domain
FROM 
    _Open
WHERE 
    EventDate >= DATEADD(day, -1, GETDATE())
AND JobID IN (SELECT JobID FROM _Job WHERE Status = 'Complete')