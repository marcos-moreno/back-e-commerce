SELECT * FROM (
    SELECT  
        total.total 
        ,Mex_.Mex_quantytotal,mpg.name as category  
        ,subcat.name AS model,p.name,p.value,p.description,p.help,cu.name as unidad   
        ,(adempiere.rf_pricelist_ecommerce(p.m_product_id,1000024, now()::date) * 1.16) AS l0
        ,adempiere.rf_pricelist_ecommerce(p.m_product_id, 1000024, now()::date)  AS sinIva 
        ,elements
        ,p.m_product_id
        ,TechnicalCharacteristics
        ,AdditionalInformation
        ,UseMode
    FROM adempiere.m_product p    
    LEFT JOIN adempiere.c_uom cu ON p.c_uom_id=cu.c_uom_id   
	INNER JOIN RF_Ecommerce_NoveltyProduct novedad ON novedad.M_Product_ID = p.M_Product_ID AND novedad.isActive = 'Y'
    INNER JOIN LATERAL   
        (SELECT COALESCE (sum(stg.qtyonhand),0)::integer - COALESCE (sum(stg.qtyreserved),0)::integer as Mex_quantytotal  
            FROM adempiere.m_storage stg  
        INNER JOIN adempiere.M_locator loc ON loc.m_locator_id =  stg.m_locator_id AND M_Warehouse_ID = 1000161  
            WHERE stg.ad_org_id=1000005 AND stg.M_Product_ID = p.M_Product_ID
        ) AS Mex_  ON true 
    INNER JOIN LATERAL   
        (SELECT COALESCE (sum(stg.qtyonhand),0)::integer - COALESCE (sum(stg.qtyreserved),0)::integer as total  
            FROM adempiere.m_storage stg  
            WHERE stg.M_Product_ID = p.M_Product_ID 
        ) AS total  ON true  
    LEFT JOIN adempiere.M_Product_Group mpg ON mpg.M_Product_Group_ID=p.M_Product_Group_ID  
    LEFT JOIN adempiere.M_Product_class subcat ON subcat.M_Product_class_id=p.M_Product_class_id   
    WHERE  
    p.ad_client_id=1000000   
    AND  total.total > 0 
    AND p.isActive = 'Y'
    AND p.value LIKE 'P15%' 
)as nm1
WHERE
l0 > 0 
ORDER BY value ASC