import { api, LightningElement, track, wire } from 'lwc';
import { fireToast } from './toastUtility';
import getLookupOptions from '@salesforce/apex/LookupInputController.getLookupOptions';

export default class LookupInput extends LightningElement {
    //public props
    @api apiName;
    @api disabled;
    @api label;
    @api objectApiName;
    @api required;
    @api 
    get value(){
        return this._value;
    }
    set value(value){
        this._value = value;
    }

    //private props
    isLoading = true;
    keyword;
    @track options;
    @track selectedOption;
    _value;
    @track wiredResponse;
    //wired props
    @wire(getLookupOptions, { objectApiName: '$objectApiName', fieldApiName: '$fieldApiName' })
    getOptions(response){
        this.wiredResponse = response;
        const {data, error} = response;
        !!data ? this.options = data : fireToast(this, 'ERROR', error?.body?.message, 'error', 'sticky');
        this.isLoading = !data;
    }

    //lifecycle hooks
    connectedCallback(){
        console.log(`%c**lookup component ==>  apiName: ${this.apiName}, value: ${this.value}, label: ${this.label}, objectApiName: ${this.objectApiName}`, 'color:purple;');
    }
    renderedCallback(){
        this.disabled ? this.template.querySelector('input').disabled = true : this.template.querySelector('input').removeAttribute('disabled');
    }

    //getters

    //private functions
    handleOptionClick(event){
        const value = event?.target?.dataset?.id?.toString();
        this.value = value;
        this.selectedOption = this.options?.find(({id}) => id?.toString() == value);
        this.keyword = this.selectedOption.label;
    }
    async optionSearch(event){
        this.isLoading = true;
        const keyCode = event?.keyCode;
        if(keyCode == 13){
            if(!!this.keyword){
                const keyword = this.keyword;
                const objectApiName = this.objectApiName;
                const fieldApiName = this.apiName;
                const options = await getLookupOptions(objectApiName, fieldApiName, keyword);
                console.log(`%c**keyword filtered options response: ${JSON.stringify(options)}`, 'color:blue;');
                this.options = options;
            }
            event.preventDefault();
        }
        this.isLoading = false;
    }
    updateKeyword(event){
        this.keyword = event?.target?.value;
    }
    //public functions

}