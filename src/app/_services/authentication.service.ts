import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { config } from './typings';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue() {
        return this.currentUserSubject.value;
    }

    public SetCurrentUserValue(user) {
       this.currentUserSubject.next(user);
       localStorage.setItem('currentUser',JSON.stringify(user));
    }

    public GetCurrentUserValue() {
        return this.currentUserSubject.asObservable();
    }

    

    login(username, password) {
        return this.http.post<any>(`${config.apiUrl}/${this.getCulture()}/users/authenticate`, { username, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    private getCulture(){
        let culture = localStorage.getItem("culture");
        if(!culture){
            culture = "en-US";
        }
        return culture;
    }
}