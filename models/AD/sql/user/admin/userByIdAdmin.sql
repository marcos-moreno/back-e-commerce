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
	,SOCreditStatus
	,SO_CreditUsed 
	,SO_Creditlimit
	,passwordinfo
FROM adempiere.AD_User u
INNER JOIN adempiere.C_BPartner cp ON cp.C_BPartner_ID= u.C_BPartner_ID  
WHERE
u.isActive = 'Y' 
AND cp.IsEmployee = 'Y'
AND IsInternalUser = 'Y'
AND cp.isActive = 'Y'
AND u.IsLoginUser = 'Y'
AND u.ad_user_id = $1
LIMIT 1 