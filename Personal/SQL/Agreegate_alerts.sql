SELECT
   t1.SIREN,
   /* Aggregate Alert values */
   STUFF((
       SELECT ';' + t2.Alert
       FROM your_table t2
       WHERE t2.SIREN = t1.SIREN
       FOR XML PATH(''), TYPE
   ).value('.', 'NVARCHAR(MAX)'), 1, 1, '') AS Alerts,
   /* Aggregate Documents values */
   STUFF((
       SELECT ';' + t3.Documents
       FROM your_table t3
       WHERE t3.SIREN = t1.SIREN
       FOR XML PATH(''), TYPE
   ).value('.', 'NVARCHAR(MAX)'), 1, 1, '') AS Documents
FROM your_table t1
GROUP BY t1.SIREN