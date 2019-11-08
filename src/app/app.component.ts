import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from './_services';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from './_services/translate.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'augmentation-reality';
  currentUser: any;
  lang : string;

  private Unsub$ = new Subject<void>();
  
  constructor( private router: Router,
    private authenticationService: AuthenticationService,
    private translate: TranslateService,
    private langService: LangService){

    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
   
    var culture = localStorage.getItem("culture");
    if(!culture){
        culture = "en-US";
    }

    this.lang = culture;
    langService.SetLang(this.lang);

    langService.Getlang().pipe(takeUntil(this.Unsub$)).subscribe(x => {
        this.lang = x;
        if(!this.lang ){
            this.lang ="en-US";
            langService.SetLang(this.lang);
        }
    });
    
    translate.setDefaultLang(this.lang);
  }

  ngOnDestroy(): void {
    this.Unsub$.next();
    this.Unsub$.complete();
  }

  useLanguage(language: string) {
    this.langService.SetLang(language);
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
  
}
