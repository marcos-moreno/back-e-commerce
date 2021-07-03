-- FUNCTION: adempiere.rf_movement_ecomers(character varying, json, character varying)

-- DROP FUNCTION adempiere.rf_movement_ecomers(character varying, json, character varying);

CREATE OR REPLACE FUNCTION adempiere.rf_movement_ecomers(
	vorderecommrs character varying,
	product_collection json,
	coderegalo character varying)
    RETURNS TABLE(m_movement_id integer, documentno character varying) 
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
AS $BODY$ 

 DECLARE   
 
vIdMovement INTEGER =0; 
vNodcument CHARACTER VARYING;
vTipoDoc INTEGER = 1000439; 
 
--Valores de la linea
vIDMovementline INTEGER DEFAULT 0; 
vline INTEGER = 10;  

reg_product RECORD;

cantidadisponible INTEGER = 0; 

cur_products CURSOR
	FOR SELECT * FROM json_to_recordset(product_collection) as x
	(m_product_id numeric, total numeric, price numeric, quantity numeric);

BEGIN
  SET search_path to adempiere;  
	
	vIdMovement = (SELECT adempiere.nextidfunc(246,'N'));  
	vNodcument = ('S6-'||adempiere.nextidfunc(1001751, 'N'));
	INSERT INTO adempiere.m_movement(
		m_movement_id, ad_client_id, ad_org_id, isactive, created, createdby, updatedby, updated,
		 documentno, description,
		movementdate, posted, processed, processing,  docaction, docstatus, isintransit, c_doctype_id, isapproved, approvalamt, 
		salesrep_id, ad_user_id, c_bpartner_id, c_bpartner_location_id, 
		chargeamt, freightamt, processedon,ispaid, barcodescanner, c_currency_id,POReference)
	VALUES (
		vIdMovement, 1000000, 1000005, 'Y', NOW()::DATE, 1000035,1000035, NOW()::DATE,
	 		vNodcument,'SURTE LA ORDEN DE E-COMMERCE INTERNO: ' || vorderecommrs,
			NOW()::DATE, 'N', 'N', 'N', 'CO', 'DR', 'N',vTipoDoc, 'N', 0,
			1000035 , 1000035, 1013546, 1015201,
			0, 0, 0,'N', 'N', 100,vorderecommrs); 
	 
	OPEN cur_products;
	LOOP 
      FETCH cur_products INTO reg_product; 
      EXIT WHEN NOT FOUND; 
	  cantidadisponible = (
			SELECT    
				COALESCE (sum(stg.qtyonhand),0)::integer - COALESCE (sum(stg.qtyreserved),0)::integer
			FROM adempiere.m_storage stg  
				INNER JOIN adempiere.M_locator loc ON loc.m_locator_id =  stg.m_locator_id   
			AND M_Warehouse_ID = 1000161  
			WHERE stg.ad_org_id=1000005 
			AND stg.M_Product_ID = reg_product.m_product_id
			); 
		
	  	IF CAST ( reg_product.quantity AS INTEGER) <= cantidadisponible  THEN
			cantidadisponible = reg_product.quantity; 
		END IF;
		
		IF  cantidadisponible > 0 THEN
			vIDMovementline = (SELECT adempiere.nextidfunc(247, 'N')); 
			INSERT INTO adempiere.m_movementline(
			m_movementline_id, ad_client_id, ad_org_id, isactive, created, createdby, updated, updatedby,
			m_movement_id, m_locator_id, m_locatorto_id, m_product_id, 
			line, movementqty, description
			, m_attributesetinstance_id, confirmedqty, scrappedqty, targetqty, processed)
			VALUES (vIDMovementline, 1000000, 1000005, 'Y', now()::DATE, 1000035, now()::DATE,1000035, 
					vIdMovement,1000137, 1001098, reg_product.m_product_id, 
					vline,cantidadisponible, 'E-Commerce Interno',
					0, 0, 0, 0, 'N');
			vline = vline + 10; 
		END IF; 
       	raise notice  '%%%', reg_product.m_product_id;
    END LOOP;
	
	IF  (SELECT corder.grandtotal FROM c_order corder WHERE corder.documentno = vorderecommrs) > 20 AND coderegalo <> '0' THEN
			vIDMovementline = (SELECT adempiere.nextidfunc(247, 'N')); 
			INSERT INTO adempiere.m_movementline(
			m_movementline_id, ad_client_id, ad_org_id, isactive, created, createdby, updated, updatedby,
			m_movement_id, m_locator_id, m_locatorto_id, m_product_id, 
			line, movementqty, description
			, m_attributesetinstance_id, confirmedqty, scrappedqty, targetqty, processed)
			VALUES (vIDMovementline, 1000000, 1000005, 'Y', now()::DATE, 1000035, now()::DATE,1000035, 
					vIdMovement,1000137, 1001098,coderegalo::integer, 
					vline,1, 'Regalo a Distribuidor, Compra superior a $5,000 E-Commerce Interno',
					0, 0, 0, 0, 'N');
			vline = vline + 10; 
	END IF;

    CLOSE cur_products;
  	
	RETURN QUERY
  		SELECT  vIdMovement,vNodcument;
END;
$BODY$;

ALTER FUNCTION adempiere.rf_movement_ecomers(character varying, json, character varying)
    OWNER TO postgres;
