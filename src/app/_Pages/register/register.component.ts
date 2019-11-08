import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, takeUntil } from 'rxjs/operators';

import { UserService, AuthenticationService } from '../../_services';
import { LangService } from 'src/app/_services/translate.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {

    registerForm: FormGroup;
    loading = false;
    submitted = false;
    error: string;
    lang: string;

    private Unsub$ = new Subject<void>();
    
    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private langService:LangService
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

    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            username: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            contact:['', [Validators.required, Validators.pattern('[0-9]{10}')]],
            designation:[],
            role:[]
        });
    }

    ngOnDestroy(): void {
        this.Unsub$.next();
        this.Unsub$.complete();
    }

    useLanguage(language: string) {
        this.langService.SetLang(language);
    }

    // convenience getter for easy access to form fields
    get f() { return this.registerForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }

        this.loading = true;
        this.userService.register(this.registerForm.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate(['/login'], { queryParams: { registered: true }});
                },
                error => {
                    this.error = error;
                    this.loading = false;
                });
    }
}
