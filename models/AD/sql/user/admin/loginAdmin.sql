SELECT  
	u.userpin
	,u.value As user
	,u.phone2
	,u.phone
	,passwordinfo
	,u.ad_user_id
	,cp.name cpname
	,u.name as userName
	,cp.name2
	,cp.description
	,cp.taxid  
	,u.email
	,cp.value
	,cp.C_BPartner_ID
FROM adempiere.AD_User u
INNER JOIN adempiere.C_BPartner cp ON cp.C_BPartner_ID= u.C_BPartner_ID
WHERE
u.isActive = 'Y' 
AND cp.isActive = 'Y'
AND u.IsInternalUser = 'Y'


AND cp.IsEmployee = 'Y'
AND u.IsLoginUser = 'Y'

AND u.value = $1
-- AND (
-- 		SELECT 
-- 			COUNT(*) 
-- 		FROM adempiere.AD_User_Roles ur 
-- 		WHERE ur.AD_User_ID = u.ad_user_id  
-- 		AND ur.AD_Role_ID IN (1000016,0,1000057)
-- 	) > 0
LIMIT 1

