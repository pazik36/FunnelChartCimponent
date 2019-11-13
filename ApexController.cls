public class CustomPersonalReportsController {

    public static final String FIELDS_PARAM = 'fields';
    public static final String SORTED_BY_PARAM = 'sortBy';
    public static final String SORTED_DIRECTION_PARAM = 'sortDirection';
    public static final String GROUPED_BY_PARAM = 'groupBy';
    public static final String FILTERS_PARAM = 'filters'; 
    public static final String SORTED_BY_STATIC_PARAM = 'sortByStatic'; 

    @AuraEnabled
    public static List<Account> getFreshLeadsData(){
        List<Account> freadLeads = [
            SELECT Id, Name, Type, LastActivityDate, Phone, Script_Caller_status__c, 
                Follow_up_status__c, AnnualRevenue, OwnerId, Owner.Name,BillingState,Website
            FROM Account
            WHERE 
                OwnerId = :UserInfo.getUserId() AND
                Type = 'Script Account' AND
                Script_Caller_status__c = 'New Lead'
        ];
        return freadLeads;
    }

    @AuraEnabled
    public static Map<String,List<Account>> getAccountDynamicData(String jsonData){
        Map<String, Object> paramsMap = (Map<String, Object>)JSON.deserializeUntyped(jsonData);  
        Map<String,List<Account>> accountData = new Map<String,List<Account>>();
        
        String fields = (String)paramsMap.get(FIELDS_PARAM);

        String orderBy = (String)paramsMap.get(SORTED_BY_PARAM) ;
        String sortDirection = (String)paramsMap.get(SORTED_DIRECTION_PARAM);
        String orderByStatic = (String)paramsMap.get(SORTED_BY_STATIC_PARAM);

        String groupBy = (String)paramsMap.get(GROUPED_BY_PARAM);
        String filters = (String)paramsMap.get(FILTERS_PARAM);
        //Schema.SObjectField groupByField = Schema.SObjectType.Account.fields.getMap().get(groupBy);
        String query = 'SELECT ' + fields + ' FROM Account WHERE OwnerId = \'' + UserInfo.getUserId() + '\' AND ' + filters + ' ORDER BY ' + orderByStatic;

        query += String.isBlank(orderBy) ? '' : ',' + orderBy + ' ' + sortDirection;
        query += ' NULLS LAST ';
   
        system.debug('ES DEBUG query ' + query);
        String fieldValue = '';
        for(Account acc: Database.query(query)){
            fieldValue = (String)acc.get(groupBy);
            if(accountData.containsKey(fieldValue)){
                accountData.get(fieldValue).add(acc);
            }
            else{
                accountData.put(fieldValue, new List<Account>{acc});
            }
        }

        return accountData;
    }
    
}
