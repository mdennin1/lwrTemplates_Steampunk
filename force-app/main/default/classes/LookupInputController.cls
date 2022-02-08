public with sharing class LookupInputController{
    @AuraEnabled(cacheable = true)
    public static List<LookupOption> getLookupOptions(Id recordId, String objectApiName, String fieldApiName){
        try {
            List<LookupOption> options = new List<LookupOption>();
            String query = 'SELECT Id, FieldApiName__c, Icon__c, Info__c, MasterLabel, Record_Type_Name__c, RelatedObjectApiName__c FROM Lookup__mdt WHERE ObjectApiName__c = :objectApiName AND FieldApiName__c = :fieldApiName';
            List<Lookup__mdt> lookupMetadata = Security.stripInaccessible(AccessType.READABLE, Database.query(query))?.getRecords();
            String infoField, icon, label = 'Name', recordTypeName, relatedObjectApiName;
            if(!lookupMetadata.isEmpty()){
                relatedObjectApiName = lookupMetadata.get(0).RelatedObjectApiName__c;
                recordTypeName = lookupMetadata.get(0).Record_Type_Name__c;
                infoField = lookupMetadata.get(0).Info__c;
                icon = String.isNotBlank(lookupMetadata?.get(0)?.Icon__c) ? lookupMetadata.get(0).Icon__c : null;
                if(String.isNotBlank(lookupMetadata?.get(0).MasterLabel)){
                    label = lookupMetadata?.get(0).MasterLabel;
                }
            }
            List<String> fields = new List<String>{'Id', label};
            if(String.isNotBlank(infoField)){
                fields.add(infoField);
            }
            query = 'SELECT '+String.join(fields, ',')+' FROM '+relatedObjectApiName;
            if(String.isNotBlank(recordTypeName)){
                query += ' WHERE RecordType.Name = :recordTypeName';
            }
            query += ' ORDER BY LastModifiedDate DESC LIMIT 2000';
            List<SObject> records  = Security.stripInaccessible(AccessType.READABLE, Database.query(query))?.getRecords();
            System.debug('**queried lookup records: '+records);
            for(SObject record : records){
                String info = null;
                if(String.isNotBlank(infoField)){
                    info = String.valueOf(record.get(infoField));
                }
                options.add(new LookupOption(String.valueOf(record.get(label)), String.valueOf(record.get('Id')), icon, info));
            }
            System.debug('**lookup options: '+options);
            return options;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable = true)
    public static List<LookupOption> getLookupOptions(Id recordId, String objectApiName, String fieldApiName, String keyword){
        try {
            List<LookupOption> options = new List<LookupOption>();
            String query = 'SELECT Id, FieldApiName__c, Icon__c, Info__c, MasterLabel, Record_Type_Name__c, RelatedObjectApiName__c FROM Lookup__mdt WHERE ObjectApiName__c = :objectApiName AND FieldApiName__c = :fieldApiName';
            List<Lookup__mdt> lookupMetadata = Security.stripInaccessible(AccessType.READABLE, Database.query(query))?.getRecords();
            String infoField, icon, label = 'Name', recordTypeName, relatedObjectApiName;
            if(!lookupMetadata.isEmpty()){
                relatedObjectApiName = lookupMetadata.get(0).RelatedObjectApiName__c;
                recordTypeName = lookupMetadata.get(0).Record_Type_Name__c;
                infoField = lookupMetadata.get(0).Info__c;
                icon = String.isNotBlank(lookupMetadata?.get(0)?.Icon__c) ? lookupMetadata.get(0).Icon__c : null;
                if(String.isNotBlank(lookupMetadata?.get(0).MasterLabel)){
                    label = lookupMetadata?.get(0).MasterLabel;
                }
            }
            List<String> fields = new List<String>{'Id', label};
            if(String.isNotBlank(infoField)){
                fields.add(infoField);
            }
            String cleanedKeyword = '%'+String.escapeSingleQuotes(keyword)+'%';
            query = 'SELECT '+String.join(fields, ',')+' FROM '+relatedObjectApiName+' WHERE '+label+' LIKE :cleanedKeyword';
            if(String.isNotBlank(recordTypeName)){
                query += ' AND RecordType.Name = :recordTypeName';
            }
            query += ' ORDER BY LastModifiedDate DESC LIMIT 2000';
            List<SObject> records  = Security.stripInaccessible(AccessType.READABLE, Database.query(query))?.getRecords();
            System.debug('**queried lookup records: '+records);
            for(SObject record : records){
                String info = null;
                if(String.isNotBlank(infoField)){
                    info = String.valueOf(record.get(infoField));
                }
                options.add(new LookupOption(String.valueOf(record.get(label)), String.valueOf(record.get('Id')), icon, info));
            }
            System.debug('**lookup options: '+options);
            return options;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}