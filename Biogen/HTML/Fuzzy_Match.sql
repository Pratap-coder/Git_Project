SELECT
    SIREN,
    Alerte_Code,
    EVENEMENT,
    NOUVELLE_VALEUR,
    PRECEDENTE_VALEUR,
    CASE 
        WHEN new_dob != '' 
         AND prec_dob != ''
         AND new_dob = prec_dob 
         AND new_name != '' 
         AND prec_name != '' 
         AND (
             DIFFERENCE(new_name, prec_name) >= 3 
             OR new_name LIKE '%' + prec_name + '%' 
             OR prec_name LIKE '%' + new_name + '%' 
         )
        THEN 'Info'
        ELSE 'Alerte' 
    END AS Alerte_Info
FROM (
    SELECT 
        SIREN,
        Alerte_Code,
        EVENEMENT,
        NOUVELLE_VALEUR,
        PRECEDENTE_VALEUR,
        CASE 
            WHEN CHARINDEX('- ', NOUVELLE_VALEUR) > 0 
             AND CHARINDEX(',', NOUVELLE_VALEUR, CHARINDEX('- ', NOUVELLE_VALEUR)) > 0 
            THEN LTRIM(RTRIM(SUBSTRING(
                    NOUVELLE_VALEUR, 
                    CHARINDEX('- ', NOUVELLE_VALEUR) + 2, 
                    CHARINDEX(',', NOUVELLE_VALEUR, CHARINDEX('- ', NOUVELLE_VALEUR)) - (CHARINDEX('- ', NOUVELLE_VALEUR) + 2)
                 )))
            ELSE '' 
        END AS new_name,
        CASE 
            WHEN CHARINDEX('né(e) le ', NOUVELLE_VALEUR) > 0 
            THEN SUBSTRING(NOUVELLE_VALEUR, CHARINDEX('né(e) le ', NOUVELLE_VALEUR) + 9, 10)
            ELSE '' 
        END AS new_dob,
        CASE 
            WHEN CHARINDEX('- ', PRECEDENTE_VALEUR) > 0 
             AND CHARINDEX(',', PRECEDENTE_VALEUR, CHARINDEX('- ', PRECEDENTE_VALEUR)) > 0 
            THEN LTRIM(RTRIM(SUBSTRING(
                    PRECEDENTE_VALEUR, 
                    CHARINDEX('- ', PRECEDENTE_VALEUR) + 2, 
                    CHARINDEX(',', PRECEDENTE_VALEUR, CHARINDEX('- ', PRECEDENTE_VALEUR)) - (CHARINDEX('- ', PRECEDENTE_VALEUR) + 2)
                 )))
            ELSE '' 
        END AS prec_name,
        CASE 
            WHEN CHARINDEX('né(e) le ', PRECEDENTE_VALEUR) > 0 
            THEN SUBSTRING(PRECEDENTE_VALEUR, CHARINDEX('né(e) le ', PRECEDENTE_VALEUR) + 9, 10)
            ELSE '' 
        END AS prec_dob
    FROM Unique_Alerte_SIREN
	WHERE Evenement = 'ALT_DIRIGEANT'
) AS ExtractedData