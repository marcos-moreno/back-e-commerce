-- FUNCTION: adempiere.rf_insercbpartner_ecomers(json, boolean)

-- DROP FUNCTION adempiere.rf_insercbpartner_ecomers(json, boolean);

CREATE OR REPLACE FUNCTION adempiere.rf_insercbpartner_ecomers(
	jsoncbpartner json,
	islocation boolean)
    RETURNS TABLE(c_bpartner_id integer, ad_user_id integer, c_bpartner_location_id integer, status character varying, data json) 
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
AS $BODY$
DECLARE 
 
 vIdOrder INTEGER =0;
 vidsocioOriginal INTEGER =0;
 vFechaDoc DATE DEFAULT NULL;    
 vPrefijoDoc CHARACTER VARYING;
 vNodcument CHARACTER VARYING;
 vConsecDoc INTEGER;
 vTipoDoc INTEGER;
 vIDMoneda INTEGER = 130 ;

 --------var Socio de negocio 
 vIDDirSocio INTEGER DEFAULT 0;
 -- vIDListaPrecios INTEGER DEFAULT 0;
  --------End var Socio de negocio

--Valores de la linea
vIdOrderline INTEGER DEFAULT 0; 
vline INTEGER = 10; 
vc_uom_id INTEGER DEFAULT 0;
--Valores de la linea 
res_employee INTEGER DEFAULT 0; 
vc_bpartner_id INTEGER DEFAULT 0; 
vad_user_id INTEGER DEFAULT 0; 
resultData CHARACTER VARYING;
estateResult CHARACTER VARYING; 

objCBpartner RECORD;
objTipoSolicitante RECORD;
JSONtypeSoli json;

--Variables de un uso
vc_location_id INTEGER DEFAULT 0;

vFechaHoy TIMESTAMP;
vIdSocio INTEGER;
vCodigoSocio INTEGER;
vc_bpartner_location_id INTEGER DEFAULT 0;

BEGIN 
	SET search_path to adempiere;
	vFechaHoy = CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp);
	
--Convert JSON TO RECORD
	SELECT * into objCBpartner FROM json_to_recordset(JSONcbpartner) as x
	(
		folio CHARACTER VARYING,_id CHARACTER VARYING,"tipoSolicitante" json,"nombreSolicitante" CHARACTER VARYING
		,"numeroCelular" CHARACTER VARYING,email CHARACTER VARYING,"requiredFactura" BOOLEAN,direccion CHARACTER VARYING
		,"UsoCFDI" CHARACTER VARYING,created_at CHARACTER VARYING,cp CHARACTER VARYING,estado CHARACTER VARYING,ciudad CHARACTER VARYING
		,municipio CHARACTER VARYING,pais CHARACTER VARYING,asentamiento CHARACTER VARYING, "montPreAprobed" NUMERIC,
		c_bpartner_id INTEGER
	);

	JSONtypeSoli = objCBpartner."tipoSolicitante";
	SELECT * into objTipoSolicitante FROM json_to_recordset(JSONtypeSoli) as xs
	  (
		 _id CHARACTER VARYING,tipo CHARACTER VARYING,razonSocial CHARACTER VARYING
		,"personaReferencia" CHARACTER VARYING,"celularReferencia" CHARACTER VARYING
		,"parentezcoReferencia" CHARACTER VARYING,"rfcColborador" CHARACTER VARYING
	  );
--//Convert JSON TO RECORD
	  
-- 	raise notice '1: %',objCBpartner;
-- 	raise notice '2: %', objTipoSolicitante; 
-- 	raise notice '3: %', objTipoSolicitante.tipo; 

-- 	Validar que no exista el usuario
	IF isLocation = false THEN
		SELECT 
			COUNT(*) OVER (PARTITION BY u.AD_CLIENT_ID ),cp.c_bpartner_id,u.ad_user_id  INTO res_employee,vc_bpartner_id,vad_user_id
		FROM adempiere.AD_User u
		INNER JOIN adempiere.C_BPartner cp ON cp.C_BPartner_ID = u.C_BPartner_ID 
		AND IsCustomer = 'Y'
		WHERE 
			u.isActive = 'Y'  
			AND IsWebstoreUser = 'Y'
			AND UPPER(TaxID) = UPPER(objTipoSolicitante."rfcColborador")
			OR  UPPER(BPName) = UPPER(objTipoSolicitante."rfcColborador") 
		ORDER BY cp.created ASC;
		
		IF res_employee > 0 THEN 
			RETURN QUERY 
			SELECT  vc_bpartner_id,vad_user_id,vc_bpartner_location_id,'SE'::character varying,'{"estado":"SE","msg":"El cliente es un usuario existente"}'::json;
			RETURN;
		ELSE 
			res_employee = 0;vc_bpartner_id=0;vad_user_id=0;
		END IF;
	END IF;
-- 	Validar que no exista el usuario

	IF isLocation = false THEN
	-- 	Colaborador Refividrio 
		IF objTipoSolicitante.tipo = ('Colaborador Refividrio')::CHARACTER VARYING
		THEN

			SELECT 
				COUNT(*) OVER (PARTITION BY TaxID),cp.c_bpartner_id,u.ad_user_id INTO res_employee,vc_bpartner_id,vad_user_id
			FROM adempiere.C_BPartner cp  
			LEFT JOIN adempiere.AD_User u ON cp.C_BPartner_ID = u.C_BPartner_ID AND u.isActive = 'Y' 
			AND IsEmployee = 'Y'
			WHERE 
			TaxID = objTipoSolicitante."rfcColborador";

			raise notice '4: %', CONCAT(res_employee,' ',vc_bpartner_id,'  ',vad_user_id); 

			IF res_employee = 1 THEN
				--:::Si requiere Factura
				IF objCBpartner."requiredFactura" THEN 
					UPDATE adempiere.AD_User usAPD SET 
						PasswordInfo = '$2b$10$7qXuRIJjog6jYPjiBiBS4OkEtUzCZ3rf0XGbXBWYIS2WXdLsup9g6'
						,Phone2 = objCBpartner."numeroCelular"
						,EMail= objCBpartner.email
						,IsWebstoreUser = 'Y'
						,isActive = 'Y'
						,isLoginUser = 'Y' 
					WHERE  usAPD.AD_User_id = vad_user_id;

					UPDATE adempiere.C_BPartner cbUPD SET  
							IsCustomer = 'Y'
							,SO_CreditLimit = 0.0
							,DeliveryViaRule = 'D'
							,PaymentRule = 'P'
							,Description = 'Socio creado desde e-commers Cambaceo, RFC al que corresponde:' || objTipoSolicitante."rfcColborador" 
							|| ', ' || objTipoSolicitante.tipo 
							,updatedby = 1000035
							,C_PaymentTerm_ID = 1000005
					WHERE  cbUPD.C_BPartner_id = vc_bpartner_id;
					
					UPDATE adempiere.LMX_BPartner lmx SET
							UsoCFDI = objCBpartner."UsoCFDI"
					WHERE  lmx.C_BPartner_id = vc_bpartner_id;
					
					IF objCBpartner."montPreAprobed" > 0 
					THEN 
						UPDATE adempiere.C_BPartner cbUPD  SET   
							SO_CreditLimit = objCBpartner."montPreAprobed"
						WHERE  cbUPD.C_BPartner_id = vc_bpartner_id; 
					END IF;

					UPDATE adempiere.C_BPartner_Location cbUPD SET isActive = 'N'
					WHERE cbUPD.C_BPartner_ID=vc_bpartner_id AND cbUPD.isActive = 'Y';

					vc_location_id = (SELECT adempiere.nextidfunc(60, 'N'));
					INSERT INTO adempiere.c_location(
						c_location_id, ad_client_id, ad_org_id, isactive, created, createdby, 
						updated, updatedby,
						address1, address2, city, postal,
						c_country_id,
						c_region_id, 
						regionname, address3)
					VALUES ( 
						vc_location_id, 1000000, 0, 'Y',CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp),1000035
						,CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp),1000035
						,objCBpartner.direccion,objCBpartner.asentamiento,objCBpartner.ciudad,objCBpartner.cp
						,247,
						(SELECT c_region_id FROM adempiere.C_region 
							WHERE description LIKE '%'|| translate(objCBpartner.estado,'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ','aeiouAEIOUaeiouAEIOU') ||'%' 
							AND c_country_id =247
						),(SELECT name FROM adempiere.C_region 
							WHERE description LIKE '%'|| translate(objCBpartner.estado,'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ','aeiouAEIOUaeiouAEIOU') ||'%' 
							AND c_country_id =247)
						,objCBpartner.municipio);
					vc_bpartner_location_id = (SELECT adempiere.nextidfunc(208, 'N'));
					INSERT INTO adempiere.c_bpartner_location(
						c_bpartner_location_id, ad_client_id, ad_org_id, isactive, created, createdby,
						updated, updatedby,name, isbillto, isshipto, ispayfrom, isremitto,
						phone2, c_bpartner_id,c_location_id, email)
					VALUES (vc_bpartner_location_id, 1000000, 0, 'Y', CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp),1000035
							,CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp),1000035,objCBpartner.municipio,'Y','Y', 'Y', 'Y'
							,objCBpartner."numeroCelular",vc_bpartner_id,vc_location_id,objCBpartner.email);
					resultData = '{"estado":"AU","msg":"Usuario del empleado Creado"}';
					estateResult = 'success';
				ELSE
					vc_bpartner_id = null;
					vad_user_id = null;
					resultData = '{"estado":"CREATED_CM","msg":"Crear Socio de Negocio (cliente mostrador)"}';
					estateResult = 'error';
				END IF;
			END IF;

			IF res_employee > 1 THEN
				IF objCBpartner."requiredFactura" THEN
					vc_bpartner_id = null;
					vad_user_id = null;
					resultData = '{"estado":"SD","msg":"El empleado tiene mas de un Usuario Asignado"}';
					estateResult = 'error';
				ELSE
					vc_bpartner_id = null;
					vad_user_id = null;
					resultData = '{"estado":"CREATED_CM","msg":"Crear Socio de Negocio (cliente mostrador)"}';
					estateResult = 'error';
				END IF; 
			END IF;

			-- Si el empleado no Existe pero se encuentra en los pre aprobados y no quiere factura se retorna la indicacion para
			-- insertar un Cliente Mostrador, si requiere factura es necesaria la alta del empleado de RH
	-- 		(SELECT COUNT(*) FROM adempiere.RF_CreditsProposalClients 
	--                 WHERE UPPER(rfcprov) = UPPER('MOGM980711CX&') AND isActive = 'Y' LIMIT 1) 
			IF res_employee = 0 OR res_employee IS NULL THEN 
				IF (SELECT COUNT(*) FROM adempiere.RF_CreditsProposalClients 
					WHERE UPPER(rfcprov) = UPPER(objTipoSolicitante."rfcColborador") AND isActive = 'Y' LIMIT 1) > 0 
				THEN
					IF objCBpartner."requiredFactura" THEN
						vc_bpartner_id = null;
						vad_user_id = null;
						resultData = '{"estado":"CREATED_CFAC","msg":"Crear Socio de Negocio (RFC origen, Facturación)"}';
						estateResult = 'error';
					ELSE
						vc_bpartner_id = null;
						vad_user_id = null;
						resultData = '{"estado":"CREATED_CM","msg":"Crear Socio de Negocio (cliente mostrador)"}';
						estateResult = 'error';
					END IF; 
				ELSE
					vc_bpartner_id = null;
					vad_user_id = null;
					resultData = '{"estado":"ARH","msg":"El empleado no esta registrado, por favor solicita el alta a RH."}';
					estateResult = 'error'; 
				END IF;  
			END IF;
		END IF;
	--fin Colaborador Refividrio 

		IF (objTipoSolicitante.tipo=('Distribuidor')::CHARACTER VARYING) OR (objTipoSolicitante.tipo = ('Recomendado por Familiar/Amigo')::CHARACTER VARYING) THEN
			SELECT 
				COUNT(*) OVER (PARTITION BY TaxID),cp.c_bpartner_id,u.ad_user_id INTO res_employee,vc_bpartner_id,vad_user_id
			FROM adempiere.AD_User u
			INNER JOIN adempiere.C_BPartner cp ON cp.C_BPartner_ID = u.C_BPartner_ID AND IsCustomer = 'Y'
			WHERE u.isActive = 'Y' AND TaxID = objTipoSolicitante."rfcColborador";

			IF res_employee = 1 THEN
				IF objCBpartner."requiredFactura" THEN
					UPDATE adempiere.AD_User usAPD SET 
						PasswordInfo = '$2b$10$7qXuRIJjog6jYPjiBiBS4OkEtUzCZ3rf0XGbXBWYIS2WXdLsup9g6'
						,Phone2 = objCBpartner."numeroCelular"
						,EMail= objCBpartner.email
						,IsWebstoreUser = 'Y'
						,isActive = 'Y'
						,isLoginUser = 'Y'
						,IsCustomer = 'Y' 
					WHERE  usAPD.AD_User_id = vad_user_id;

					UPDATE adempiere.C_BPartner cbUPD SET  
							IsCustomer = 'Y'
							,SO_CreditLimit = 0.0
							,DeliveryViaRule = 'D'
							,PaymentRule = 'P'
							,C_PaymentTerm_ID = 1000005
					WHERE  cbUPD.C_BPartner_id = vc_bpartner_id;

					UPDATE adempiere.LMX_BPartner lmx SET
							UsoCFDI = objCBpartner."UsoCFDI"
					WHERE  lmx.C_BPartner_id = vc_bpartner_id;
					
					IF objCBpartner."montPreAprobed" > 0 
					THEN 
						UPDATE adempiere.C_BPartner cbUPD  SET   
							SO_CreditLimit = objCBpartner."montPreAprobed"
						WHERE  cbUPD.C_BPartner_id = vc_bpartner_id; 
					END IF;

					UPDATE adempiere.C_BPartner_Location cbUPD SET isActive = 'N'
					WHERE cbUPD.C_BPartner_ID=vc_bpartner_id AND cbUPD.isActive = 'Y';

					vc_location_id = (SELECT adempiere.nextidfunc(60, 'N'));
					INSERT INTO adempiere.c_location(
						c_location_id, ad_client_id, ad_org_id, isactive, created, createdby, 
						updated, updatedby,
						address1, address2, city, postal,
						c_country_id,
						c_region_id, 
						regionname, address3)
					VALUES ( 
						vc_location_id, 1000000, 0, 'Y',CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp),1000035
						,CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp),1000035
						,objCBpartner.direccion,objCBpartner.asentamiento,objCBpartner.ciudad,objCBpartner.cp
						,247,
						(SELECT c_region_id FROM adempiere.C_region 
							WHERE description LIKE '%'|| translate(objCBpartner.estado,'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ','aeiouAEIOUaeiouAEIOU') ||'%' 
							AND c_country_id =247
						),(SELECT name FROM adempiere.C_region 
							WHERE description LIKE '%'|| translate(objCBpartner.estado,'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ','aeiouAEIOUaeiouAEIOU') ||'%' 
							AND c_country_id =247)
						,objCBpartner.municipio);
						
					vc_bpartner_location_id = (SELECT adempiere.nextidfunc(208, 'N'));
					INSERT INTO adempiere.c_bpartner_location(
						c_bpartner_location_id, ad_client_id, ad_org_id, isactive, created, createdby,
						updated, updatedby,name, isbillto, isshipto, ispayfrom, isremitto,
						phone2, c_bpartner_id,c_location_id, email)
					VALUES (vc_bpartner_location_id, 1000000, 0, 'Y', CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp),1000035
							,CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp),1000035,objCBpartner.municipio,'Y','Y', 'Y', 'Y'
							,objCBpartner."numeroCelular",vc_bpartner_id,vc_location_id,objCBpartner.email);
					resultData = '{"estado":"AU","msg":"Cliente Existente, Usuario Creado"}';
					estateResult = 'success';
				ELSE
					vc_bpartner_id = null;
					vad_user_id = null;
					resultData = '{"estado":"CREATED_CM","msg":"Crear Socio de Negocio (cliente mostrador)"}';
					estateResult = 'error';
				END IF;  
			END IF;

			IF res_employee = 0 OR res_employee IS NULL THEN 
				vc_bpartner_id = null;
				vad_user_id = null;
				-- IF (SELECT COUNT(*) FROM adempiere.RF_CreditsProposalClients
				-- 	WHERE UPPER(rfcprov) = UPPER(objTipoSolicitante."rfcColborador") AND isActive = 'Y') > 0 
				-- THEN
					IF objCBpartner."requiredFactura" THEN
						resultData = '{"estado":"CREATED_CFAC","msg":"Crear Socio de Negocio (RFC origen, Facturación)"}';
						estateResult = 'error';
					ELSE
						resultData = '{"estado":"CREATED_CM","msg":"Crear Socio de Negocio (cliente mostrador)"}';
						estateResult = 'error';
					END IF; 
				-- ELSE
				-- 	resultData = '{"estado":"RE","msg":"El Socio no esta en ADempiere."}';
				-- 	estateResult = 'error'; 
				-- END IF;  
			END IF;
		END IF;
	ELSE 
			vc_location_id = (SELECT adempiere.nextidfunc(60, 'N'));
			IF objCBpartner."requiredFactura" THEN 
				INSERT INTO adempiere.c_location(
					c_location_id, ad_client_id, ad_org_id, isactive, created, createdby, 
					updated, updatedby,
					address1, address2, city, postal,
					c_country_id,
					c_region_id, 
					regionname, address3)
				VALUES ( 
					vc_location_id, 1000000, 0, 'Y',CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp),1000035
					,CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp),1000035
					,objCBpartner.direccion,objCBpartner.asentamiento,objCBpartner.ciudad,objCBpartner.cp
					,247,
					(SELECT c_region_id FROM adempiere.C_region 
						WHERE description LIKE '%'|| translate(objCBpartner.estado,'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ','aeiouAEIOUaeiouAEIOU') ||'%' 
						AND c_country_id =247
					),(SELECT name FROM adempiere.C_region 
						WHERE description LIKE '%'|| translate(objCBpartner.estado,'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ','aeiouAEIOUaeiouAEIOU') ||'%' 
						AND c_country_id =247)
					,objCBpartner.municipio);
			ELSE
				INSERT INTO adempiere.c_location(
					c_location_id, ad_client_id, ad_org_id, isactive, created, createdby, 
					updated, updatedby,address1, address2, city, postal,c_country_id,address3)
				VALUES ( 
					vc_location_id, 1000000, 0, 'Y',CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp),1000035
					,CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp),1000035
					,'*','*','*','*',247,'*');
			END IF;
				
			vc_bpartner_location_id = (SELECT adempiere.nextidfunc(208, 'N'));
			INSERT INTO adempiere.c_bpartner_location(
				c_bpartner_location_id, ad_client_id, ad_org_id, isactive, created, createdby,
				updated, updatedby,name, isbillto, isshipto, ispayfrom, isremitto,
				phone2, c_bpartner_id,c_location_id, email)
			VALUES (vc_bpartner_location_id, 1000000, 0, 'Y', CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp),1000035
					,CAST((to_char(current_timestamp, 'YYYY-MM-DD 00:00:00')) AS timestamp),1000035,'*','Y','Y', 'Y', 'Y'
					,objCBpartner."numeroCelular",objCBpartner.c_bpartner_id,vc_location_id,objCBpartner.email);
			resultData = '{"estado":"CREATED DIR","msg":"Dirección Creada RecordID:' || vc_location_id || '"}';
			estateResult = 'success';
	END IF;
	/*
	SE = Socio de Negocio Existente <= opercacion abortada.
	SD = Socio de Negocio con más de un CB_partner <= opercacion abortada.
	ARH = Empleado No Registrado <= opercacion abortada.
	AU = Socio Autorizado 
	
	SELECT * FROM adempiere.rf_insercbpartner_ecomers('
	[{
		"folio":1000212
		,"montPreAprobed":"5000.00"
		,"_id":"60a6db87d33cdf0cbd54c3ea"
		,"cp":"55067"
		,"estado":"México"
		,"ciudad":"Ecatepec de Morelos"
		,"municipio":"Ecatepec de Morelos"
		,"pais":"México"
		,"asentamiento":"Ciudad Cuauhtémoc Sección Geo 2000"
		,"tipoSolicitante":
			[{
				"_id":"60a6db87d33cdf0cbd54c3eb"
				,"tipo":"Colaborador Refividrio"
				,"razonSocial":"","personaReferencia":""
				,"celularReferencia":""
				,"parentezcoReferencia":""
				,"rfcColborador":"MOGM980711CX5"
			}]
		,"nombreSolicitante":"MARCOS GUILLLERMO MORENO GARCIA"
		,"numeroCelular":"5539373022"
		,"email":"marcos.moreno.gm@gmail.com"
		,"requiredFactura":true
		,"direccion":"MIXTLACIHUATL MZ 6 LT 7"
		,"UsoCFDI":"G01","estado_solicitud":"PA"
		,"created_at":"2021-05-20T21:58:31.453Z","__v":0
		,"ApprovedCredit":true
	}]')
*/
	RETURN QUERY 
 	SELECT  vc_bpartner_id,vad_user_id,vc_bpartner_location_id,estateResult,resultData::json;
END
$BODY$;

ALTER FUNCTION adempiere.rf_insercbpartner_ecomers(json, boolean)
    OWNER TO postgres;
