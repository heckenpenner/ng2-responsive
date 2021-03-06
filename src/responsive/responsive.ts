import {Output, EventEmitter, Directive, Input, TemplateRef, ViewContainerRef, ElementRef, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from  'rxjs/Rx';
import {ResponsiveState} from '../config/config';
import {responsivePattern, responsiveSubscriptions} from '../config/interfaces';

/*======== RESPONSIVE MULTIPLE =========*/
@Directive({ selector: '[responsive]' })
export class Responsive implements OnInit, OnDestroy {

    @Input() set responsive(config: string | string[]) {
        this.init_responsive(config);
    };
    @Output('booleanChanges') public _booleanChanges: EventEmitter<any> = new EventEmitter();

    //Init the interface var
    public set_values: responsivePattern = {
        bootstrap: '',
        browser: '',
        device: '',
        pixelratio: '',
        orientation: '',
        standard: '',
        ie: '',
        sizes: 0
    };

    private set_active_subscriptions: responsiveSubscriptions = {
        bootstrap: false,
        browser: false,
        device: false,
        pixelratio: false,
        orientation: false,
        standard: false,
        ie: false,
        sizes: false
    }
    //Para comprobar que todos estan activos entonces cambiar el estado del elemento
    private match_multiple: responsiveSubscriptions = {
        bootstrap: false,
        browser: false,
        device: false,
        pixelratio: false,
        orientation: false,
        standard: false,
        ie: false,
        sizes: false
    }

    //Subscriptions
    private _subscription_Bootstrap: Subscription;
    private _subscription_Browser: Subscription;
    private _subscription_Pixel_Ratio: Subscription;
    private _subscription_Device: Subscription;
    private _subscription_Orientation: Subscription;
    private _subscription_Standard: Subscription;
    private _subscription_IE_Version: Subscription;
    private _subscription_custom_sizes: Subscription;

    //Show or hide option
    protected _showWhenTrue: boolean = true;

    //Global No Repeat
    private _globalNoRepeat: number = 0;

    //No repeat for bootstrap string names
    private _noRepeatBootstrapName: string;

    //No repeat to init responsive
    private _bootstrapNoRepeat: number = 0;
    private _deviceNoRepeat: number = 0;
    private _standardNoRepeat: number = 0;
    private _orientationNoRepeat: number = 0;
    private _browserNoRepeat: number = 0;
    private _pixelratioNoRepeat: number = 0;
    private _ieNoRepeat: number = 0;
    private _sizesNoRepeat: number = 0;

    //Parameters
    private _bootstrap_user_param: string[] = [];
    private _devices_user_param: string[] = [];
    private _standard_user_param: string[] = [];
    private _orientation_user_param: string[] = [];
    private _browser_user_param: string[] = [];
    private _pixelratio_user_param: string[] = [];
    private _ie_user_param: string[] = [];
    private _sizes_user_param: string[] = [];

    //User parameters
    protected _actives: string[] = [];

    constructor(private templateRef: TemplateRef<any>,
        private _responsiveState: ResponsiveState,
        private viewContainer: ViewContainerRef) { }


    //Init method    
    public init_responsive(value: any): void {
        if (this.isJSON(value)) {
            //If bootstrap object exists
            if (!!value.bootstrap && this._bootstrapNoRepeat == 0) {
                this._bootstrap_user_param = <string[]>(Array.isArray(value.bootstrap) ? value.bootstrap : [value.bootstrap]);
                this._bootstrapNoRepeat = 1;
                // add bootstrap subscription
                this.set_active_subscriptions.bootstrap = true;
            }
            //If device object exists
            if (!!value.device && this._deviceNoRepeat == 0) {
                this._devices_user_param = <string[]>(Array.isArray(value.device) ? value.device : [value.device]);
                this._deviceNoRepeat = 1;
                this.set_active_subscriptions.device = true;
            }
            //If standard object exists
            if (!!value.standard && this._standardNoRepeat == 0) {
                this._standard_user_param = <string[]>(Array.isArray(value.standard) ? value.standard : [value.standard]);
                this._standardNoRepeat = 1;
                this.set_active_subscriptions.standard = true;
            }
            //If orientation object exists
            if (!!value.orientation && this._orientationNoRepeat == 0) {
                this._orientation_user_param = <string[]>(Array.isArray(value.orientation) ? value.orientation : [value.orientation]);
                this._orientationNoRepeat = 1;
                this.set_active_subscriptions.orientation = true;
            }
            //If browser object exists
            if (!!value.browser && this._browserNoRepeat == 0) {
                this._browser_user_param = <string[]>(Array.isArray(value.browser) ? value.browser : [value.browser]);
                this._browserNoRepeat = 1;
                this.set_active_subscriptions.browser = true;
            }
            //If pixel ratio object exists
            if (!!value.pixelratio && this._pixelratioNoRepeat == 0) {
                this._pixelratio_user_param = <string[]>(Array.isArray(value.pixelratio) ? value.pixelratio : [value.pixelratio]);
                this._pixelratioNoRepeat = 1;
                this.set_active_subscriptions.pixelratio = true;
            }
            //If ie object exists
            if (!!value.ie && this._ieNoRepeat == 0) {
                this._ie_user_param = <string[]>(Array.isArray(value.ie) ? value.ie : [value.ie]);
                this._ieNoRepeat = 1;
                this.set_active_subscriptions.ie = true;
            }
            //If custom sizes object exists
            if (!!value.sizes && this._sizesNoRepeat == 0) {
                let min = value.sizes.min;
                let max = value.sizes.max;
                this._sizes_user_param = [min, max];
                this._sizesNoRepeat = 1;
                this.set_active_subscriptions.sizes = true;
            }

        } else if (Array.isArray(value)) {
            throw new Error("Responsive directive don´t work with a only array parameter");
        } else if (typeof value == 'string') {
            throw new Error("Responsive directive don´t work with a only string parameter");
        } else if (typeof value == 'number') {
            throw new Error("Responsive directive don´t work with a only number parameter");
        } else if (value == undefined || value === null) {
            throw new Error("Responsive directive don´t work without a param");
        }

        //Add names of subscriptions actives
        for (let key in this.set_active_subscriptions) {
            if (this.set_active_subscriptions[key] == true) {
                this._actives.push(key);
            }
        };

        //Initialize subscriptios
        if (this.set_active_subscriptions.bootstrap == true) this._subscription_Bootstrap = this._responsiveState.elementoObservar.subscribe(this.updateBootstrap.bind(this));

        if (this.set_active_subscriptions.browser == true) this._subscription_Browser = this._responsiveState.browserObserver.subscribe(this.updateBrowser.bind(this));

        if (this.set_active_subscriptions.device == true) this._subscription_Device = this._responsiveState.deviceObserver.subscribe(this.updateDevice.bind(this));

        if (this.set_active_subscriptions.pixelratio == true) this._subscription_Pixel_Ratio = this._responsiveState.pixelObserver.subscribe(this.updatePixelRatio.bind(this));

        if (this.set_active_subscriptions.orientation == true) this._subscription_Orientation = this._responsiveState.orientationObserver.subscribe(this.updateOrientation.bind(this));

        if (this.set_active_subscriptions.standard == true) this._subscription_Standard = this._responsiveState.standardObserver.subscribe(this.updateStandard.bind(this));

        if (this.set_active_subscriptions.ie == true) this._subscription_IE_Version = this._responsiveState.ieVersionObserver.subscribe(this.updateIEversion.bind(this));

        if (this.set_active_subscriptions.sizes == true) this._subscription_custom_sizes = this._responsiveState.anchoObservar.subscribe(this.updateSizes.bind(this));

    }

    public ngOnInit(): void { }

    //Subscriptions changes
    private updateBootstrap(value: string): void {
        let update = this._ifValueChanged(this._noRepeatBootstrapName, value);
        if (update) {
            this.set_values.bootstrap = value;
        }
        this.updateEvent(this.set_values.bootstrap, 'bootstrap');
    }
    private updateBrowser(value: string): void {
        this.set_values.browser = value;
        this.updateEvent(this.set_values.browser, 'browser');
    }
    private updateDevice(value: string): void {
        this.set_values.device = value;
        this.updateEvent(this.set_values.device, 'device');
    }
    private updatePixelRatio(value: string): void {
        this.set_values.pixelratio = value;
        this.updateEvent(this.set_values.pixelratio, 'pixelratio');
    }
    private updateOrientation(value: string): void {
        this.set_values.orientation = value;
        this.updateEvent(this.set_values.orientation, 'orientation');
    }
    private updateStandard(value: string): void {
        this.set_values.standard = value;
        this.updateEvent(this.set_values.standard, 'standard');
    }
    private updateIEversion(value: string): void {
        this.set_values.ie = value;
        this.updateEvent(this.set_values.ie, 'ie');
    }
    private updateSizes(value: number): void {
        this.set_values.sizes = value;
        this.updateEvent(this.set_values.sizes, 'sizes');
    }

    //Subscriptions changes operations
    private updateEvent(param: any, type_directive: string): void {
        //WHEN TRUE
        if (!!this._showWhenTrue) {
            switch (type_directive) {
                case "bootstrap":
                    this.showHideOperations(this._bootstrap_user_param.indexOf(param) !== -1, type_directive);
                    break;
                case "device":
                    this.showHideOperations(this._devices_user_param.indexOf(param) !== -1, type_directive);
                    break;
                case "standard":
                    this.showHideOperations(this._standard_user_param.indexOf(param) !== -1, type_directive);
                    break;
                case "orientation":
                    this.showHideOperations(this._orientation_user_param.indexOf(param) !== -1, type_directive);
                    break;
                case "browser":
                    this.showHideOperations(this._browser_user_param.indexOf(param) !== -1, type_directive);
                    break;
                case "pixelratio":
                    this.showHideOperations(this._pixelratio_user_param.indexOf(param) !== -1, type_directive);
                    break;
                case "ie":
                    this.showHideOperations(this._ie_user_param.indexOf(param) !== -1, type_directive);
                    break;
                case "sizes":
                    this.showHideOperations(!!(param >= this._sizes_user_param[0] && param <= this._sizes_user_param[1]), type_directive);
                    break;
                default:
                    null;
            }
            //WHEN FALSE   
        } else {
            switch (type_directive) {
                case "bootstrap":
                    this.showHideOperations(!(this._bootstrap_user_param.indexOf(param)), type_directive);
                    break;
                case "device":
                    this.showHideOperations(!(this._devices_user_param.indexOf(param)), type_directive);
                    break;
                case "standard":
                    this.showHideOperations(!(this._standard_user_param.indexOf(param)), type_directive);
                    break;
                case "orientation":
                    this.showHideOperations(!(this._orientation_user_param.indexOf(param)), type_directive);
                    break;
                case "browser":
                    this.showHideOperations(!(this._browser_user_param.indexOf(param)), type_directive);
                    break;
                case "pixelratio":
                    this.showHideOperations(!(this._pixelratio_user_param.indexOf(param)), type_directive);
                    break;
                case "ie":
                    this.showHideOperations(!(this._ie_user_param.indexOf(param)), type_directive);
                    break;
                case "sizes":
                    this.showHideOperations(!(!!(param >= this._sizes_user_param[0] && param <= this._sizes_user_param[1])), type_directive);
                    break;
                default:
                    null;
            }
        }
    }

    //Show / Hide element
    private showHideOperations(show: boolean, type_directive: string) {

        let global_state = this.matchValues(show, type_directive);

        if (global_state && this._globalNoRepeat == 0) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this._globalNoRepeat = 1;
            this._booleanChanges.emit(true);

            //Else hide element
        } else {
            this.viewContainer.clear();
            this._globalNoRepeat = 0;
            this._booleanChanges.emit(false);
        }
    }

    //Multiple match boolean values
    private matchValues(show: boolean, type_directive: string) {

        let match: boolean = true;

        //Change the state of value
        if (show) {
            this.match_multiple[type_directive] = true;
        } else {
            this.match_multiple[type_directive] = false;
        }

        //Match all values estates => If (all values == true) => return true else => return false
        for (let all_key in this.match_multiple) {
            for (let active of this._actives) {
                if (all_key == active && this.match_multiple[all_key] == false) {
                    //If the match multiple actives values have one in false; return false
                    return match = false;
                }
            }
        }
        //Return match boolean
        return match;
    }


    //Destroy all subscriptions
    public ngOnDestroy(): void {

        //unsubscribe all subscriptions actives
        if (this.set_active_subscriptions.bootstrap == true) this._subscription_Bootstrap.unsubscribe();

        if (this.set_active_subscriptions.browser == true) this._subscription_Browser.unsubscribe();

        if (this.set_active_subscriptions.device == true) this._subscription_Device.unsubscribe();

        if (this.set_active_subscriptions.pixelratio == true) this._subscription_Pixel_Ratio.unsubscribe();

        if (this.set_active_subscriptions.orientation == true) this._subscription_Orientation.unsubscribe();

        if (this.set_active_subscriptions.standard == true) this._subscription_Standard.unsubscribe();

        if (this.set_active_subscriptions.ie == true) this._subscription_IE_Version.unsubscribe();

        if (this.set_active_subscriptions.sizes == true) this._subscription_custom_sizes.unsubscribe();
    }

    //No repeat method for bootstrap states
    private _ifValueChanged(oldValue: any, newValue: any): boolean {
        if (oldValue === newValue) {
            return false;
        } else {
            this._noRepeatBootstrapName = newValue;
            return true;
        }
    }

    //IsJSON OBJECT solution
    private isJSON(value): boolean {
        try {
            JSON.stringify(value);
            return true;
        } catch (ex) {
            return false;
        }
    }
}