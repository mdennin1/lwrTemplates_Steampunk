//imports
import { api, LightningElement, track, wire } from 'lwc';
import { createRecord, generateRecordInputForCreate, generateRecordInputForUpdate, getRecordCreateDefaults, getRecordUi, updateRecord } from 'lightning/uiRecordApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { CurrentPageReference } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { fireToast } from './toastUtility';

const CREATE = 'Create';
const EDIT = 'Edit';
const FULL = 'Full';
const VIEW = 'View';

export default class RecordDetail extends LightningElement {
    //public props
    @api 
    get recordId(){
        return this._recordId;
    }
    set recordId(value){
        this._recordId = value;
    }
    @api 
    get objectApiName(){
        return this._objectApiName;
    }
    set objectApiName(value){
        this._objectApiName = value;
    }
    @api 
    get layoutType(){
        return this._layoutType;
    }
    set layoutType(value){
        this._layoutType = value;
    }
    @api
    get mode(){
        return this._mode;
    }
    set mode(value){
        this._mode = value;
    }

    //private props
    _layoutType = FULL;
    _mode = VIEW;
    _objectApiName;
    _recordId;
    @track objectInfo;
    @track record;
    @track recordDefaults;
    @track recordInput;
    recordTypeId;
    recordUi;
    
    //lifecycle hooks
    connectedCallback(){
        console.log(this.pageRef);
        console.log(`%c** recordId: ${this.recordId}, objectApiName: ${this.objectApiName}, layoutType: ${this.layoutType}, mode: ${this.mode}`, 'color:purple;font-weight:bold;');
    }
    renderedCallback(){
        this.setRecordId();
        this.buildRecordInputForCreate();
        // console.log(`%c**sections: ${JSON.stringify(this.sections)}`, 'color:blue;');
    }

    //wired functions
    @wire(CurrentPageReference)
    pageRef;
    @wire(getRecordUi, { recordIds: '$recordId', layoutTypes: '$layoutType', modes: '$mode' })
    getRecordUi(response){
        // console.log(`%c**getRecordUi() wire fired. response => ${JSON.stringify(response)}`, 'color:red;');
        this.recordUi = response;
        const { data, error } = response;
        if(!!data){
            const {layouts, objectInfos, records} = data;
            const record = {...records?.[this.recordId]};
            this.record = record;
            this.recordTypeId = this.record?.recordTypeId;
            this.objectApiName = this.record?.apiName;
            const objectInfo = {...objectInfos?.[this.objectApiName]};
            this.objectInfo = objectInfo;
            // console.log(`%c**objectApiName: ${this.objectApiName}, record: ${JSON.stringify(this.record)}, objectInfo: ${JSON.stringify(this.objectInfo)}`, 'color:purple;');
            const recordInput = generateRecordInputForUpdate(record, objectInfo);
            this.recordInput = {...recordInput};
            // console.log(`%c**recordInput: ${JSON.stringify(this.recordInput)}`, 'color:blue;font-weight:bold;');

        }
        if(!!error) fireToast(this, 'Error', error?.body?.message, 'error', 'sticky');
    }
    @wire(getObjectInfo, {objectApiName: '$objectApiName'})
    getObjectInfo(response){
        if(this.mode == CREATE){
            const { data, error} = response;
            !!data ? this.objectInfo = data : fireToast(this, 'ERROR', error?.body?.message, 'error', 'sticky');
        }
    }
    @wire(getRecordCreateDefaults, {objectApiName: '$objectApiName'})
    getRecordDefaults(response){
        const {data, error} = response;
        !!data ? this.recordDefaults = data?.record : fireToast(this, 'ERROR', error?.body?.message, 'error', 'sticky');
    }

    //getters
    get createMode(){
        return this.mode == CREATE;
    }
    get createInputs(){
        return null;
    }
    get isReady(){
        return this.createMode ? this.createInputs : this.sections;
    }
    get sections(){
        return this.recordUi?.data?.layouts?.[this.objectApiName]?.[this.recordTypeId]?.[this.layoutType]?.[this.mode]?.sections?.map(sec =>{
            const section = {...sec};
            const {layoutRows} = section;
            section.layoutRows = layoutRows?.map((row, id) =>{
                const {layoutItems} = row;
                row = {...row, id};
                row.layoutItems = layoutItems?.map((item, id) => {
                    item = {...item, id};
                    const {layoutComponents} = item;
                    item.layoutComponents = layoutComponents?.map((component, id) => ({...component, id}));
                    return item;
                });
                return row;
            });
            return section;
        });
    }
    get showSaveBtn(){
        return this.mode != VIEW;
    }
    
    //private functions
    buildRecordInputForCreate(){
        if(this.createMode && !this.recordInput && !!this.recordDefaults && !!this.objectInfo){
            // console.log(`%c**recordDefaults: ${JSON.stringify(this.recordDefaults)}`, 'color:purple;');
            this.recordInput = generateRecordInputForCreate(this.recordDefaults, this.objectInfo);
        }
    }
    handleClick(event){
        const {detail: {origin, value}, target} = event;
        switch(origin){
            case 'edit_button':
                this.mode = value;
                break;
            default:
                break;
        }
    }
    setRecordId(){
        this.recordId = this.recordId ?? this.pageRef?.attributes?.recordId ?? this.pageRef?.state?.recordId;
    }
    toggleSection(event){
        const fromSectionHeading = event.target.classList.contains('slds-section') || event.target.classList.contains('slds-section__title');
        if(!fromSectionHeading) return;
        const sectionId = event?.target?.dataset?.id;
        const isCollapsible = this.sections?.find(({id}) => id == sectionId)?.collapsible;
        isCollapsible ? event?.target?.classList?.toggle?.('slds-is-open') : null;
        console.log(event.target.classList);
    }
    updateRecord(event){
        console.log(`%c**updateRecord() fired`, 'color:red;');
        const {apiName, value} = event.detail;
        this.recordInput.fields[apiName] = value;
        console.log(`%c**updated recordInput: ${JSON.stringify(this.recordInput)}`, 'color:blue;');
    }
    validate(){
        console.log(`%c**validate() fired`, 'color:red;');
        return true;
    }

    //public functions
    @api
    async save(event){
        // console.log(`%c**save() fired`, 'color:red;');
        if(this.validate()){
            //save record
            try{
                if(!this.recordInput) return fireToast(this, 'No Record Present', `Cannot update the record because no record updates have occurred.`, 'error');
                const save = this.mode == CREATE ? createRecord : updateRecord;
                const recordInput = {...this.recordInput};
                const updatedRecord = await save(recordInput);
                fireToast(this, 'Record Saved', 'Successfully saved the record!', 'success');
                // console.error(`**updatedRecord: ${JSON.stringify(updatedRecord)}`);
                this.createMode ? this.recordId = updatedRecord?.id : refreshApex(this.recordUi);
                this.mode = VIEW;
            }
            catch(error){
                fireToast(this, 'Save Error', error?.body?.message, 'error', 'sticky');
            }
        }else{
            fireToast(this, 'Invalid Record', `The record is currently invalid. Please make the necessary updates to the record and re-submit.`, 'error');
        }
    }
}