
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LiveData } from './live-data.model';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-live-option-data',
  standalone: true,
  imports: [],
  templateUrl: './live-option-data.component.html',
  styleUrl: './live-option-data.component.css'
})
export class LiveOptionDataComponent {

  liveData$: Observable<LiveData[]>;
  displayedColumns: string[] = [
    'ftm0', 'dtm1', 'fdtm', 'ltt', 'v', 'ltp', 'ltq', 'tbq', 'tsq', 'bp', 'sp', 'ap', 'lo', 'h', 'lcl', 'ucl', 'op', 'c', 'oi', 'cng', 'nc', 'to', 'name', 'tk', 'e', 'ts'
  ];

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit(): void {
    this.liveData$ = this.webSocketService.getLiveData();
  }

}
