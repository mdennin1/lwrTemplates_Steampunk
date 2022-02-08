import { api, LightningElement, track, wire } from 'lwc';

const CREATE = 'Create';
const EDIT = 'Edit';
const FIELD_TYPE = 'Field';
const VIEW = 'View';

export default class RecordDetailInput extends LightningElement {
    //public props
    @api apiName;
    @api displayInfo;
    @api layoutItem;
    @api layoutComponent;
    @api mode;
    @api objectInfo;
    @api record;
    @api recordInput;

    //lifecycle hooks
    // connectedCallback(){
    //     console.log(`%c**mode: ${this.mode}, layoutComponent: ${JSON.stringify(this.layoutComponent)}, layoutItem: ${JSON.stringify(this.layoutItem)}`, 'color:red;');
    // }

    //getters
    get createMode(){
        return this.mode == CREATE;
    }
    get dataType(){
        return this.objectInfo?.fields?.[this.apiName]?.dataType;
    }
    get defaultInput(){
        return !this.isLookup;
    }
    get disabled(){
        return !this.updateable;
    }
    get editMode(){
        return this.mode == EDIT;
    }
    get inputTypeAttribute(){
        console.log(`**dataType: ${this.dataType}`);
        switch(this.dataType){
            case 'checkbox':
            case 'date':
            case 'datetime':
            case 'email':
            case 'number':
            case 'url':
                break;
            case 'phone':
                return 'tel';
            default:
                return `text`;
        }
    }
    get isField(){
        return this.layoutComponent?.componentType == FIELD_TYPE;
    }
    get isLookup(){
        return this.dataType?.toLowerCase() == 'reference';
    }
    get label(){
        return this.layoutComponent?.label;
    }
    get required(){
        return this.layoutItem?.required;
    }
    get value(){
        switch(this.mode){
            case CREATE:
            case EDIT:
                return this.recordInput?.fields?.[this.apiName];
            default:
                return this.record?.fields?.[this.apiName]?.displayValue ?? this.record?.fields?.[this.apiName]?.value;
        }
    }
    get viewMode(){
        return this.mode == VIEW;
    }
    get updateable(){
        return this.createMode ? this.layoutItem?.editableForNew : this.layoutItem?.editableForUpdate;
    }

    //private functions
    handleEditClick(event){
        const origin = event?.target?.dataset?.id;
        this.dispatchEvent(new CustomEvent('click', {detail: {value: EDIT, origin}, bubbles: true, composed: true}));
    }
    handleInputChange(event){
        const value = event?.target?.value;
        const apiName = event?.target?.dataset?.id;
        console.log(`handleInputChange() fired. apiName: ${apiName}, value: ${value}`);
        this.dispatchEvent(new CustomEvent('recordupdate', {detail: {apiName, value}, bubbles: true, composed: true}));
    }
}