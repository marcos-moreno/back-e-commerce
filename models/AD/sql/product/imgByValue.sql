SELECT  
    p.value
    ,img.binarydata as img
FROM adempiere.m_product p   
INNER JOIN adempiere.ad_image img ON img.ad_image_id = p.logo_id
WHERE
p.ad_client_id=1000000    
AND p.isActive = 'Y'
AND p.value LIKE 'P15%'  
AND p.value = $1