SELECT * FROM  adempiere.rf_order_ecomers(
	$1 -- vIDListaPrecios character varying
	,1000032 -- vad_org_id integer
	,1000350 -- vid_alm integer 
	,$2 -- 	vgrandtotal numeric
	,$3 -- 	vOrderEcommrs character varying,
	,$4 -- 	vIDSocio INTEGER, 
	,$5 -- 	product_collection json) 
	,$6 --  fechaprometida date
	,$7 --  tipoPago character varying,
	,$8 --  id de la organizacion de recepcion
)As rf_order_ecomers
