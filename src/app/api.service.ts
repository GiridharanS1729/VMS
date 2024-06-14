import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private jsonUrl = '../assets/data.json';

  constructor(private http: HttpClient) { }

  getData(searchQuery: string = '', page: number = 1, perPage: number = 6): Observable<any> {
    return this.http.get<any>(this.jsonUrl).pipe(
      map(data => {
        let filteredData = data.users;

        if (searchQuery) {
          const regex = new RegExp(`^${searchQuery}`, 'i');
          filteredData = filteredData.filter((user: { username: string; }) => regex.test(user.username));
        }

        const totalRecords = filteredData.length;
        const totalPages = Math.ceil(totalRecords / perPage);
        const startIndex = (page - 1) * perPage;
        const endIndex = Math.min(startIndex + perPage, totalRecords);

        return {
          users: filteredData.slice(startIndex, endIndex),
          totalPages
        };
      })
    );
  }
}
