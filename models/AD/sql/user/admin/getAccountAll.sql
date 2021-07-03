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
	,lp.m_pricelist_id
	,lp.name As listaprecio
	,u.email
	,cp.value
	,cp.C_BPartner_ID
	,SOCreditStatus
	,SO_CreditUsed 
	,SO_Creditlimit
FROM adempiere.AD_User u
INNER JOIN adempiere.C_BPartner cp ON cp.C_BPartner_ID= u.C_BPartner_ID AND IsCustomer = 'Y' 
LEFT JOIN adempiere.m_pricelist lp ON cp.m_pricelist_id = lp.m_pricelist_id
WHERE
u.isActive = 'Y' 
AND IsWebstoreUser = 'Y'
