import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, takeUntil } from 'rxjs/operators';

import { AuthenticationService } from '../../_services'
import { LangService } from 'src/app/_services/translate.service';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
    

    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    error: string;
    success: string
    lang:string;
    regSuccessMsg : string = "Registration successful";

    private Unsub$ = new Subject<void>();


    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private translate : TranslateService,
        private langService : LangService
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) { 
            this.router.navigate(['/']);
        }

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
    }

       
    useLanguage(language: string) {
        this.langService.SetLang(language);
        this.translate.get('login.regSuccessMsg').subscribe((res: string) => {
            this.regSuccessMsg = res;

             // show success message on registration
            if (this.route.snapshot.queryParams['registered']) {
                this.success = this.regSuccessMsg;
            }
        });
    }


    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

        this.translate.get('login.regSuccessMsg').subscribe((res: string) => {
            this.regSuccessMsg = res;

             // show success message on registration
            if (this.route.snapshot.queryParams['registered']) {
                this.success = this.regSuccessMsg;
            }
        });
       
    }

    ngOnDestroy(): void {
        this.Unsub$.next();
        this.Unsub$.complete();
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.error = null;
        this.success = null;
        
        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.authenticationService.login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate([this.returnUrl]);
                },
                error => {
                    this.error = error;
                    this.loading = false;
                });
    }
}
