import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FromToPanelService {
  private MassageSource = new BehaviorSubject<string[]>([]);
  massage = this.MassageSource.asObservable();
  constructor() { }
  updateMessage(message: string[]) {
    this.MassageSource.next(message);
  }
}
