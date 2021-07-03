
SELECT 
 CASE WHEN COUNT(*) = 1 THEN true ELSE false END as result
FROM adempiere.AD_User u
INNER JOIN adempiere.C_BPartner cp ON cp.C_BPartner_ID= u.C_BPartner_ID AND IsCustomer = 'Y'
WHERE  
u.isActive = 'Y' 
AND cp.isActive = 'Y'
AND (UPPER(u.Value) =  UPPER($1) OR UPPER(u.email) =  UPPER($1) OR u.phone2 =  $1)
AND IsWebstoreUser = 'Y'