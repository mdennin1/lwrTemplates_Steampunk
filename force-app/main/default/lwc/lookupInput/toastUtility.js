
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export const fireToast = (_this, title, message, variant, mode = 'dismissable') =>{
    console.log(`%c**toast: ${title} --> ${message}`, `color:${variant == 'success' ? 'green' : variant == 'error' ? 'red' : 'yellow'};`);
    _this.dispatchEvent(new ShowToastEvent({title, message, variant, mode}));
}
