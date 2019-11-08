import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from './typings';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) {
     }

    getAll() {
        return this.http.get<any[]>(`${config.apiUrl}/${this.getCulture()}/users`);
    }

    update(user){
        return this.http.post(`${config.apiUrl}/${this.getCulture()}/users/update`, user);
    }

    register(user) {
        return this.http.post(`${config.apiUrl}/${this.getCulture()}/users/register`, user);
    }

    delete(id) {
        return this.http.delete(`${config.apiUrl}/${this.getCulture()}/users/${id}`);
    }

    private getCulture(){
        let culture = localStorage.getItem("culture");
        if(!culture){
            culture = "en-US";
        }
        return culture;
    }
}