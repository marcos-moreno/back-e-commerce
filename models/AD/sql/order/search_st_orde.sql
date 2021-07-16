SELECT 
orden.documentno,
entrega.documentno,
	status.*
FROM adempiere.M_InOut entrega
INNER JOIN adempiere.c_order As orden ON orden.c_order_id = entrega.c_order_id 
LEFT JOIN  adempiere.RF_Ecommerce_OrderStatus status ON status.c_order_id =  entrega.c_order_id AND status.isactive = 'Y'
WHERE 
    entrega.DocumentNo = $1--'EM27-43'
AND entrega.DocStatus = 'CO'
AND entrega.ad_org_id = '1000032'