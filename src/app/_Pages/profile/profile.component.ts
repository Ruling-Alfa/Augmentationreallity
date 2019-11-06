import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { UserService, AuthenticationService } from '../../_services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    updateForm: FormGroup;
    loading = false;
    submitted = false;
    error: string;
    currentUser: any;
    users = [];

    constructor(
        private formBuilder: FormBuilder,
        private authenticationService: AuthenticationService,
        private userService: UserService
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
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
    }

    deleteUser(id: number) {
        this.userService.delete(id)
            .pipe(first())
            .subscribe(() => this.loadAllUsers());
    }

    private loadAllUsers() {
        this.userService.getAll()
            .pipe(first())
            .subscribe(users => this.users = users);
    }

    get f() { return this.updateForm.controls; }

    onSubmit() {
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
                    alert('Updated');
                    this.loading = false;
                    //success
                },
                error => {
                    this.error = error;
                    this.loading = false;
                });
    }
}