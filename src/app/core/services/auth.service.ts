import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, map } from 'rxjs/operators';
import * as jwt_decode from 'jwt-decode';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
import { of, EMPTY } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    constructor(private http: HttpClient,
        @Inject('LOCALSTORAGE') private localStorage: Storage) {
    }

    login(email: string, password: string) {
        return of(true)
            .pipe(delay(1000),
                map(() => {
                    this.localStorage.setItem('currentUser', JSON.stringify({
                        token: 'aisdnaksjdn,axmnczm',
                        isAdmin: true,
                        email: 'admin@gmail.com',
                        id: 'admin',
                        alias: 'admin@gmail.com'.split('@')[0],
                        expiration: moment().add(1, 'days').toDate(),
                        fullName: 'Admin'
                    }));

                    return true;
                }));
    }

    logout(): void {
        this.localStorage.removeItem('currentUser');
    }

    getCurrentUser(): any {
        return {
            token: 'aisdnaksjdn,axmnczm',
            isAdmin: true,
            email: 'admin@gmail.com',
            id: 'admin',
            alias: 'admin@gmail.com'.split('@')[0],
            expiration: moment().add(1, 'days').toDate(),
            fullName: 'Admin'
        };
    }

    passwordResetRequest(email: string) {
        return of(true).pipe(delay(1000));
    }

    changePassword(email: string, currentPwd: string, newPwd: string) {
        return of(true).pipe(delay(1000));
    }

    passwordReset(email: string, token: string, password: string, confirmPassword: string): any {
        return of(true).pipe(delay(1000));
    }
}
