-- FUNCTION: adempiere.rf_order_ecomers(character varying, integer, integer, numeric, character varying, integer, json, date, character varying, character varying)

-- DROP FUNCTION adempiere.rf_order_ecomers(character varying, integer, integer, numeric, character varying, integer, json, date, character varying, character varying);

CREATE OR REPLACE FUNCTION adempiere.rf_order_ecomers(
	vidlistaprecios character varying,
	vad_org_id integer,
	vid_alm integer,
	vgrandtotal numeric,
	vorderecommrs character varying,
	vidsocio integer,
	product_collection json,
	fechaprometida date,
	formapago character varying,
	vad_orgrecep_id character varying)
    RETURNS TABLE(documentno character varying, c_order_id integer) 
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
AS $BODY$
DECLARE 

 vIdOrder INTEGER;
 vFechaDoc DATE;
 vIDMoneda INTEGER;
 vNDocument CHARACTER VARYING;
 vConsecDoc INTEGER;
 vTipoDoc INTEGER;
 
 --------var Socio de negocio 
 vIDDirSocio INTEGER DEFAULT 0;
 vIDListaPrecios INTEGER DEFAULT 0;
 
  --------End var Socio de negocio
vline INTEGER = 10;
vIdOrderline INTEGER DEFAULT 0;

vTotalLines NUMERIC;
vPaymentrule CHARACTER VARYING = 'P';
vDescription CHARACTER VARYING = 'P';

vC_PaymentTerm_ID INTEGER = 1000005;

 reg_prod RECORD;
 curs_prod CURSOR FOR 
  SELECT * FROM json_to_recordset(product_collection) as x 
    (quantity INTEGER,price NUMERIC,total NUMERIC,m_product_id INTEGER);

BEGIN
	SET search_path to adempiere;
	 
	IF formapago = 'TRA' THEN  
		vDescription = 'ESTA VENTA FUÉ REALIZADA POR MEDIO DEL Ecommerce INTERNO, MEDIO DE PAGO: Transferencia electrónica,
ORDEN id. e-commers:  ' || vOrderEcommrs;
	END IF;
	 
	IF formapago = 'paypal' THEN
		vPaymentrule = 'T';
		vC_PaymentTerm_ID = 1000002;
		vDescription = 'ESTA VENTA FUÉ REALIZADA POR MEDIO DEL Ecommerce INTERNO, MEDIO DE PAGO: PAYPAL,
ORDEN id. e-commers:  ' || vOrderEcommrs;
	END IF;

	IF formapago = 'EFE' THEN 
		vDescription = 'REQUIERE EL PAGO EN SUCURSAL, ESTA VENTA FUÉ REALIZADA POR MEDIO DEL Ecommerce INTERNO,
ORDEN id. e-commers:  ' || vOrderEcommrs;
	END IF;

	IF formapago = 'CRE' THEN 
		vDescription = 'ESTA VENTA FUÉ REALIZADA POR MEDIO DEL Ecommerce INTERNO, MEDIO DE PAGO: CRÉDITO,
id. e-commers:  ' || vOrderEcommrs;
	END IF;
	
	vDescription = vDescription || ' -> Sucursal de Entrega: ' || (SELECT name FROM adempiere.ad_org WHERE ad_org_id = vad_orgrecep_id::INTEGER);

	vTotalLines =  ROUND(vgrandtotal-(vgrandtotal * 0.16),2);
	vFechaDoc = NOW()::DATE; 
	vIDMoneda = 130 ;
	vIdOrder = (SELECT adempiere.nextidfunc(232, 'N')); 
	vTipoDoc = 1000825; --Orden Estandar E-COMMERCE
	vConsecDoc = (SELECT DocNoSequence_ID FROM  C_DocType WHERE C_DocType_ID = vTipoDoc);	
	
	vNDocument = 'S27-' || adempiere.nextidfunc(vConsecDoc, 'N'); --(SELECT  prefix FROM C_DocType doc INNER JOIN AD_Sequence  seq ON seq.AD_Sequence_ID=  doc.docnosequence_id WHERE C_DocType_id = 1000857);
	
 	vIDDirSocio = (SELECT C_BPartner_Location_id FROM C_BPartner_Location WHERE  C_BPartner_id = vIDSocio AND IsBillTo = 'Y' AND IsActive = 'Y');
	   INSERT INTO C_Order 
		(
		c_order_id, ad_client_id, ad_org_id, isactive, created, createdby, updated, updatedby, 
		issotrx, documentno, docstatus, docaction, processing, processed, 
		c_doctype_id, c_doctypetarget_id, 
		description
		, isapproved, iscreditapproved, 
		isdelivered, isinvoiced, isprinted, istransferred, isselected, salesrep_id, 
		dateordered, datepromised, dateacct, c_bpartner_id, c_bpartner_location_id, 
		isdiscountprinted, c_currency_id, paymentrule, c_paymentterm_id, invoicerule,
		
		deliveryrule, freightcostrule, freightamt, deliveryviarule, chargeamt, priorityrule, 
		totallines, grandtotal, m_warehouse_id, m_pricelist_id, istaxincluded, posted, 
		sendemail, copyfrom, isselfservice, c_conversiontype_id, bill_bpartner_id, bill_location_id, 
		isdropship, volume, weight, amounttendered, amountrefunded, processedon, printformattype
		)
		
		VALUES (
		vIdOrder,1000000,vad_org_id,'Y',now(),1000035,now(),1000035,
		'Y', vNDocument,'DR','CO','N','N',
		--0,
		vTipoDoc,vTipoDoc,
		vDescription
		,'Y','N',
		'N','N','N','N','N',1000035,
		vFechaDoc,fechaprometida::DATE/*fechaprometida::DATE vFechaDoc*/,vFechaDoc,vIDSocio,vIDDirSocio, --Fechas y Socio
		'N',vIDMoneda,vPaymentrule,vC_PaymentTerm_ID,'I', --Moneda, Dias Credito

		'A','I',0,'D',0,5,
		vTotalLines,vGrandTotal,vid_alm,1000024,'N','N', --Almacen,ListaDePrecios
		'N','N','N',114,vIDSocio,vIDDirSocio, --Socio
		'N',0,0,0,0,0,'N'
		);
 		--ORDEN 
		
 	INSERT INTO C_OrderTax
			(
			c_order_id, c_tax_id, ad_client_id, ad_org_id, isactive, created, createdby, updated, updatedby, 
			taxbaseamt, taxamt, processed, istaxincluded
			)
			VALUES 
			(
			vIdOrder,1000001,1000000,vad_org_id,'Y',now(),1000035,now(),1000035,
			vTotalLines,ROUND(vgrandtotal * 0.16,2),'N','N'
			);

	OPEN curs_prod;
   	LOOP
    FETCH curs_prod INTO reg_prod;
    EXIT WHEN NOT FOUND;
	
		 vIdOrderline = (SELECT adempiere.nextidfunc(233, 'N')); 
    	 INSERT INTO C_OrderLine
				(c_orderline_id, ad_client_id, ad_org_id, isactive, created, createdby, updated, updatedby, c_order_id, 
				 line, c_bpartner_id, c_bpartner_location_id, dateordered, datepromised, m_product_id, 
				 m_warehouse_id, c_uom_id, qtyordered, qtyreserved, qtydelivered, qtyinvoiced, 
				 c_currency_id, 
                 pricelist, priceactual, pricelimit, linenetamt, discount, freightamt, 
				 c_tax_id, m_attributesetinstance_id, isdescription, processed, qtyentered, 
				 priceentered, pricecost, qtylostsales, rramt, isconsumesforecast, createfrom, createshipment, pickedqty)
			VALUES
			(
				vIdOrderline,1000000,vad_org_id,'Y',now(),1000035,now()::DATE,1000035,vIdOrder, --vIdOrder
				vline,vIDSocio,vIDDirSocio,vFechaDoc,vFechaDoc::DATE,reg_prod.m_product_id, --linea,socio,locationID,fecha,fecha,m_product_id
				vid_alm,(SELECT c_uom_id FROM adempiere.m_product WHERE m_product_id = reg_prod.m_product_id),reg_prod.quantity,0,0,0, --Almacen,unidadMedida,cantidad
				vIDMoneda
                ,ROUND(reg_prod.price/1.16,2)
                ,ROUND(reg_prod.price/1.16,2)
                ,ROUND(reg_prod.price/1.16,2),  
                ROUND(reg_prod.total-(reg_prod.total * 0.16),2),0,0, --Moneda,PrecioLista
				1000001,0,'N','N', reg_prod.quantity , --Impuesto,attributos,CANTIDAD
				ROUND(reg_prod.price/1.16,2),0,0,0,'N','N','N',0 --PRECIO
			); 
			vline =vline + vline;
			
	 END LOOP;   
  RETURN QUERY SELECT vNDocument,vIdOrder;
END;
$BODY$;

ALTER FUNCTION adempiere.rf_order_ecomers(character varying, integer, integer, numeric, character varying, integer, json, date, character varying, character varying)
    OWNER TO postgres;
