import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import { stringify } from 'querystring';

let users = [{ id: 1, firstName: 'Neel', lastName: 'Acharya', username: 'neel@email.com', password: 'neel', role : 'admin', contact:'1234567890', designation: 'Owner' }];

@Injectable()
export class DummyBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        
        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) 
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            let lang : string  = 'en-US';
            
            if(url.toLowerCase().includes('nl-nl')){
                lang = 'nl-NL';
            }

            switch (true) {
                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate(lang);
                case url.endsWith('/users/register') && method === 'POST':
                    return register(lang);
                case url.endsWith('/users/update') && method === 'POST':
                    return update(lang);
                case url.endsWith('/users') && method === 'GET':
                    return getUsers(lang);
                case url.match(/\/users\/\d+$/) && method === 'DELETE':
                    return deleteUser(lang);
                default:
                    return next.handle(request);
            }    
        }

        function authenticate(lang: string) {
            let errMsg = 'Username or password is incorrect';
            if(lang==='nl-NL')
            {
                errMsg = 'Gebruikersnaam of wachtwoord is onjuist';
            }
            const { username, password } = body;
            const user = users.find(x => x.username === username && x.password === password);
            if (!user) return error(errMsg);
            return ok({
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                token: 'dummy-jwt-token',
                role : user.role,
                contact:user.contact,
                designation: user.designation
            })
        }

        function register(lang: string) {
            const user = body

            let errMsg = 'Username  "' + user.username + '" is already taken';
            if(lang==='nl-NL')
            {
                errMsg = 'Gebruikersnaam "' + user.username + '" is al in gebruik';
            }

            if (users.find(x => x.username === user.username)) {
                return error(errMsg)
            }

            user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));

            return ok();
        }

        function update(lang: string) {
            const user = body
            var existingusr = users.find(x => x.username === user.username);
            
            let errMsg = 'Username unavailable';
            if(lang==='nl-NL')
            {
                errMsg = 'Gebruikersnaam niet beschikbaar';
            }

            if (!existingusr) {
                return error(errMsg)
            }

            existingusr.firstName = user.firstName;
            existingusr.lastName = user.lastName;
            existingusr.contact = user.contact;
            existingusr.designation = user.designation;
            
            if(user.password){
                existingusr.password = user.password;
            }

            localStorage.setItem('users', JSON.stringify(users));

            return ok(existingusr);
        }

        function getUsers(lang: string) {
            if (!isLoggedIn()) return unauthorized(lang);
            return ok(users);
        }

        function deleteUser(lang: string) {
            if (!isLoggedIn()) return unauthorized(lang);

            users = users.filter(x => x.id !== idFromUrl());
            localStorage.setItem('users', JSON.stringify(users));
            return ok();
        }

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
        }

        function error(message) {
            return throwError({ error: { message } });
        }
        function unauthorized(lang: string) {
            let errMsg = 'Unauthorised';
            if(lang==='nl-NL')
            {
                errMsg = 'Onbevoegd';
            }

            return throwError({ status: 401, error: { message: errMsg } });
        }

        function isLoggedIn() {
            return headers.get('Authorization') === 'Bearer dummy-jwt-token';
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }
    }
}

export const dummyBackendProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: DummyBackendInterceptor,
    multi: true
};