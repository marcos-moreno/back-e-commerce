SELECT 
    orden.documentno orden_doc,
    entrega.documentno entrega_doc,
	entrega.m_inout_id,
    orden.c_order_id,
    orden.created,
	orden.dateordered,
	orden.datepromised
FROM adempiere.c_order As orden 
INNER JOIN  adempiere.M_InOut entrega ON orden.c_order_id = entrega.c_order_id  
WHERE 
    orden.DocumentNo = $1
AND orden.DocStatus = 'CO'
AND entrega.DocStatus = 'CO'