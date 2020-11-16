import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpParameterCodec} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { APP_CONFIG, IAppConfig } from '../app.config';
import { SharedService } from '../shared/shared.service';
import { MutationAnnotationStore } from './store/mutation-annotation.store';
import { MutationAnnotationQuery } from './store/mutation-annotation.query';
import { MutationAnnotationModel } from '../models/mutation-annotation.model';
import { HashMap } from '@datorama/akita';

// import {Apollo} from 'apollo-angular';
// import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class MutationAnnotationService {
  private readonly uploadVCFapiEndpoint = '/uploadVCF';
  private readonly searchMutationApiEndpoint = '/search-mutation';
  private API_URL;
  constructor(
    private readonly http: HttpClient,
    private readonly mutationAnnotationStore: MutationAnnotationStore,
    private readonly mutationAnnotationQuery: MutationAnnotationQuery,
    private readonly sharedService: SharedService,

    @Inject(APP_CONFIG) config: IAppConfig
  ) {
    this.API_URL = config.apiEndpoint;

    this.mutationAnnotationQuery.selectLoading().subscribe(loadingState => {
      this.sharedService.setLoader(loadingState);
    });
   }


    uploadVCF(file, snpEffect = false): Observable<any> {

    this.mutationAnnotationStore.setLoading(true);
    const fd = new FormData();
    fd.append('file', new File([file], file.name, {type: file.type}));
    fd.append('snpEffect', String(snpEffect));
    return this.http.post(this.API_URL + this.uploadVCFapiEndpoint, fd,  {
      reportProgress: true, // for progress data
    }).pipe(
      tap(
        data => {},
        err => {
          this.mutationAnnotationStore.setLoading(false);
          this.sharedService.errorModal('Error: ' + err.error.message);
        }
      ),
      tap(list => {
        this.mutationAnnotationStore.set(list);
      })
    );
  }

  getMutationAnnotationArticles(): Observable<HashMap<MutationAnnotationModel>> {
    return this.mutationAnnotationQuery.selectAll({ asObject: true });
  }

  searchMutationAnnotationArticles(mutation: string): Observable<MutationAnnotationModel[]> {
    this.mutationAnnotationStore.setLoading(true);
    return this.http.post(this.API_URL + this.searchMutationApiEndpoint, {mutation},   {
      reportProgress: true, // for progress data
    }).pipe(
      tap(
        list => {this.mutationAnnotationStore.setLoading(false); },
        err => {
          this.mutationAnnotationStore.setLoading(false);
          this.sharedService.errorModal('Error: ' + JSON.stringify(err));
        }
      ),
      map(list => Object.values(list)[0])
    ) as Observable<MutationAnnotationModel[]>;

  }
}
