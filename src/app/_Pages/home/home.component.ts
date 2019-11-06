import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { UserService, AuthenticationService } from '../../_services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
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
        // this.currentUser = this.authenticationService.currentUserValue;
        this.authenticationService.GetCurrentUserValue().subscribe(x => this.currentUser = x);
    }

    ngOnInit() {
        //this.loadAllUsers();
        this.updateForm = this.formBuilder.group({
            firstName: [this.currentUser.firstName, [Validators.required]],
            lastName: [this.currentUser.lastName, [Validators.required]],
            username: [this.currentUser.username, [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
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
}