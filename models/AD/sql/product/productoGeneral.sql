SELECT * FROM (
    SELECT  
        total.total
		/*****
            ,facturado.totalfac
        ****/
        ,categoria.name As categoria
        ,sub_categoria.name As sub_categoria
        ,marca.name As marca
        ,presentacion.name As presentacion
        ,intencidad.name As intencidad
        ,false As showatribbutes
        ,Mex_.Mex_quantytotal   
        ,p.name,p.value,p.description,p.help,cu.name as unidad   
        ,(adempiere.rf_pricelist_ecommerce(p.m_product_id,1000024, now()::date) * 1.16) AS l0
        ,adempiere.rf_pricelist_ecommerce(p.m_product_id, 1000024, now()::date)  AS sinIva 
        ,elements
        ,p.m_product_id
        ,TechnicalCharacteristics
        ,AdditionalInformation
        ,UseMode
    FROM adempiere.m_product p    
    LEFT JOIN adempiere.c_uom cu ON p.c_uom_id=cu.c_uom_id   
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
	/*****
    LEFT JOIN LATERAL   
        (
			SELECT 
				COALESCE(SUM(qtyinvoiced),0) totalfac 
			FROM adempiere.C_OrderLine clin
			WHERE  ad_org_id IN (1000032,1000005)
			AND  clin.M_Product_ID = p.M_Product_ID
        ) AS facturado ON true
	****/ 
    LEFT JOIN adempiere.M_Product_Category categoria ON categoria.M_Product_Category_ID=p.M_Product_Category_ID 
    LEFT JOIN adempiere.M_Product_Classification sub_categoria ON sub_categoria.M_Product_Classification_ID=p.M_Product_Classification_ID
    LEFT JOIN adempiere.M_Product_Group marca ON marca.M_Product_Group_ID=p.M_Product_Group_ID
    LEFT JOIN adempiere.M_Presentation presentacion ON presentacion.M_Presentation_ID=p.M_Presentation_ID
    LEFT JOIN adempiere.M_Class_Intensity intencidad ON intencidad.M_Class_Intensity_ID=p.M_Class_Intensity_ID

    WHERE  
        p.ad_client_id=1000000   
        AND  total.total > 0 
        AND p.isActive = 'Y'
        AND p.value LIKE 'P15%'
        AND (p.value ILIKE '%' || $1 || '%' OR p.name ILIKE '%' || $1 || '%')
        --#1
        --#3
        --#4
        --#5
        --#6
)as nm1
WHERE
l0 > 0
--#2
ORDER BY value ASC


