
SELECT 
 CASE WHEN COUNT(*) = 1 THEN true ELSE false END as result
FROM adempiere.AD_User u
INNER JOIN adempiere.C_BPartner cp ON cp.C_BPartner_ID= u.C_BPartner_ID AND IsEmployee = 'Y'
WHERE
u.isActive = 'Y' 
AND cp.isActive = 'Y'
AND u.IsInternalUser = 'Y'
AND u.value = $1
-- AND (	
-- 		SELECT 
-- 			COUNT(*) 
-- 		FROM adempiere.AD_User_Roles ur 
-- 		WHERE ur.AD_User_ID = u.ad_user_id  
-- 		AND ur.AD_Role_ID IN (1000016,0,1000057)
-- 	) > 0
LIMIT 1