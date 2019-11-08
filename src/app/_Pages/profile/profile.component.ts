import { Component, OnInit, OnDestroy } from '@angular/core';
import { first, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { UserService, AuthenticationService } from '../../_services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from 'src/app/_services/translate.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
    updateForm: FormGroup;
    loading = false;
    submitted = false;
    error: string;
    currentUser: any;
    users = [];
    lang : string;
    profileUpdatedMsg : string = "Profile Updated Successfully";
    errorMsg : string = "Error";
    successLbl : string = 'Success';

    private Unsub$ = new Subject<void>();

    constructor(
        private formBuilder: FormBuilder,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private toastr: ToastrService,
        private translate: TranslateService,
        private langService: LangService
    ) {
            this.currentUser = this.authenticationService.currentUserValue;
        
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

                this.translate.get('profile.updatedSuccessMsg').subscribe((res: string) => {
                    this.profileUpdatedMsg = res;
                });

                this.translate.get('profile.success').subscribe((res: string) => {
                    this.successLbl = res;
                });

                this.translate.get('profile.error').subscribe((res: string) => {
                    this.errorMsg = res;
                });

            });
            
            translate.setDefaultLang(this.lang);
    }
      
    ngOnInit() {
        //this.loadAllUsers();
        this.updateForm = this.formBuilder.group({
            firstName: [this.currentUser.firstName, [Validators.required]],
            lastName: [this.currentUser.lastName, [Validators.required]],
            username: [this.currentUser.username, [Validators.required, Validators.email]],
            password: ['', [Validators.minLength(6)]],
            contact:[this.currentUser.contact, [Validators.required, Validators.pattern('[0-9]{10}')]],
            designation:[this.currentUser.designation],
            role:[this.currentUser.role]
        });

        this.translate.get('profile.updatedSuccessMsg').subscribe((res: string) => {
            this.profileUpdatedMsg = res;
        });

        this.translate.get('profile.success').subscribe((res: string) => {
            this.successLbl = res;
        });
        
        this.translate.get('profile.error').subscribe((res: string) => {
            this.errorMsg = res;
        });
    }

    ngOnDestroy(): void {
        this.Unsub$.next();
        this.Unsub$.complete();
    }

    private loadAllUsers() {
        this.userService.getAll()
            .pipe(first())
            .subscribe(users => this.users = users);
    }

    get f() { return this.updateForm.controls; }

    onSubmit() {
        this.error = null;
        this.submitted = true;

        // stop here if form is invalid
        if (this.updateForm.invalid) {
            return;
        }

        this.loading = true;
        this.userService.update(this.updateForm.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.authenticationService.SetCurrentUserValue(data);
                    // alert('Updated');
                    this.toastr.success(this.profileUpdatedMsg, this.successLbl, 
                    {
                        closeButton: true, 
                        progressBar: true, 
                        progressAnimation: 'decreasing'
                    });
                    this.loading = false;
                    //success
                },
                error => {
                    this.error = error;
                    this.loading = false;

                    this.toastr.error(this.error, this.errorMsg,
                    {
                        closeButton: true, 
                        progressBar: true, 
                        progressAnimation: 'decreasing'
                    });
                });
    }
}