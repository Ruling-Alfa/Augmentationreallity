import { Injectable } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';

@Injectable({providedIn:'root'})
export class LangService{

    lang : string = "en-US";;
    LangDetails = new Subject<string>();
    
    constructor(private translate: TranslateService){
    }

    // Set manual availablility details
    public SetLang(language: string) {
        localStorage.setItem("culture", language);
        this.translate.use(language);
        this.LangDetails.next(language);
    }

    // Get manual availability details
    public Getlang(): Observable<string> {
        return this.LangDetails.asObservable();
    }
}