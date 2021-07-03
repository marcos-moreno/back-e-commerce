-- FUNCTION: adempiere.rf_invoiceline_ecomers(integer, integer, boolean)

-- DROP FUNCTION adempiere.rf_invoiceline_ecomers(integer, integer, boolean);

CREATE OR REPLACE FUNCTION adempiere.rf_invoiceline_ecomers(
	vidorden integer,
	vc_invoice_id integer,
	ispaid boolean)
    RETURNS TABLE(c_order_id integer, documentno character varying, iscorrect boolean) 
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
AS $BODY$
DECLARE     
vIDDirSocio INTEGER DEFAULT 0;  
vIdInvoiceline INTEGER DEFAULT 0; 
vline INTEGER = 10; 
vc_uom_id INTEGER DEFAULT 0;
vTotalLines NUMERIC;
vgrandtotal NUMERIC;
vad_org_id INTEGER DEFAULT 1000032;  
vM_PriceList_ID INTEGER DEFAULT 1000024;  
vPaymentRule character varying DEFAULT 'P';   
vC_PaymentTerm_ID INTEGER DEFAULT 1000005;  
vIDSocio INTEGER DEFAULT 0;
vDocFac character varying DEFAULT '';  

cur_lines CURSOR FOR SELECT * FROM  adempiere.C_OrderLine o WHERE o.C_Order_ID = vIdOrden;
reg_line RECORD;
BEGIN
	SET search_path to adempiere;
    --SELECT adempiere.nextidfunc(260, 'N')
   SELECT 
		orderGen.TotalLines,orderGen.grandtotal,orderGen.ad_org_id,orderGen.M_PriceList_ID,c_bpartner_id
			INTO vTotalLines,vgrandtotal,vad_org_id,vM_PriceList_ID,vIDSocio
    FROM adempiere.c_order orderGen
    WHERE orderGen.c_order_id = vIdOrden;
   
	vIDDirSocio = (SELECT MAX(c_bpartner_location_id)  
                    FROM c_bpartner_location 
                    WHERE c_bpartner_id = vIDSocio AND isactive = 'Y' AND IsBillTo = 'Y'
                    AND ad_client_id = 1000000);

    IF isPaid THEN 
            vPaymentRule = 'T';
			vC_PaymentTerm_ID = 1000002; 
    END IF;
         
    UPDATE C_Invoice  
        SET  grandtotal = vgrandtotal 
            ,TotalLines= ROUND(vTotalLines::numeric,2) 
            ,M_PriceList_ID=vM_PriceList_ID
            ,C_BPartner_Location_ID = vIDDirSocio
            ,PaymentRule = vPaymentRule
			,C_PaymentTerm_ID = vC_PaymentTerm_ID 
    WHERE C_Invoice_ID=vc_invoice_id;
	
	vDocFac = (SELECT i.DocumentNo FROM C_Invoice i WHERE i.C_Invoice_ID=vc_invoice_id);
	
	IF (SELECT COUNT(*) FROM C_InvoiceTax it WHERE it.C_Invoice_ID=vc_invoice_id AND it.C_Tax_ID=1000001) = 0 THEN
		INSERT INTO C_InvoiceTax
		( 
			c_tax_id, c_invoice_id, ad_client_id, ad_org_id, isactive, created, createdby, updated, updatedby,
			taxbaseamt, taxamt, processed, istaxincluded
		)
		VALUES 
		(
			1000001,vc_invoice_id,1000000,vad_org_id,'Y',now()::DATE,1000035,now()::DATE,1000035,
			ROUND(vTotalLines::numeric,2),
			ROUND((vgrandtotal-vTotalLines)::numeric,2) --ROUND((vgrandtotal-(vgrandtotal/1.16))::numeric,2)
			,'N','N'
		);
 	END IF;
	
	IF (SELECT COUNT(*) FROM  adempiere.c_invoiceline lin WHERE lin.C_Invoice_ID=vc_invoice_id) = 0 THEN
		OPEN cur_lines;
		LOOP 
		  FETCH cur_lines INTO reg_line; 
			EXIT WHEN NOT FOUND; 
			INSERT INTO adempiere.c_invoiceline(
				c_invoiceline_id, ad_client_id, ad_org_id, isactive, created, createdby, updated, updatedby, 
				c_invoice_id, c_orderline_id, line, description, m_product_id, qtyinvoiced,

				pricelist, priceactual, pricelimit, linenetamt, c_uom_id, c_tax_id,
				taxamt, m_attributesetinstance_id, isdescription, isprinted, 
				linetotalamt,
				 processed, qtyentered, priceentered,rramt,a_createasset,
				a_processed, isfixedassetinvoice, iscollectiveasset
			) 
			VALUES (
					(SELECT adempiere.nextidfunc(260, 'N')),1000000,1000032,'Y',now()::DATE,1000035,now()::DATE,1000035, 
					vc_invoice_id,reg_line.c_orderline_id,reg_line.Line,'',reg_line.m_product_id,reg_line.qtyordered,
					reg_line.pricelist,reg_line.priceactual,reg_line.pricelimit,reg_line.linenetamt,reg_line.c_uom_id,reg_line.c_tax_id,
					ROUND((reg_line.linenetamt*0.16)::numeric,2),reg_line.m_attributesetinstance_id,reg_line.isdescription,'Y',
					ROUND((reg_line.linenetamt*1.16)::numeric,2),
					'Y',reg_line.qtyentered,reg_line.priceentered,reg_line.rramt,'N','N','N','N'
			);
		END LOOP;
	 	CLOSE cur_lines;
	END IF; 
  	
	RETURN QUERY
  		SELECT  vIdOrden,vDocFac,
			(SELECT CASE 
			 			WHEN (iii.grandtotal > 0 AND iii.TotalLines > 0 
							  	AND  (SELECT COUNT(*) FROM  adempiere.c_invoiceline lin WHERE lin.C_Invoice_ID=vc_invoice_id) > 0
							 )THEN
			 				true ELSE false END
			 FROM C_Invoice iii
			 WHERE iii.C_Invoice_ID=vc_invoice_id
			);
END;
$BODY$;

ALTER FUNCTION adempiere.rf_invoiceline_ecomers(integer, integer, boolean)
    OWNER TO postgres;
