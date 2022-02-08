public class LookupOption{
    @AuraEnabled public String label;
    @AuraEnabled public String value;
    @AuraEnabled public String info;
    @AuraEnabled public String icon;

    public LookupOption(String label, String value, String icon, String info){
        this.label = label;
        this.value = value;
        this.icon = icon;
        this.info = info;
    }
    public LookupOption(String label, String value){
        this.label = label;
        this.value = value;
    }
}