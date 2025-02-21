import { ChangeDetectorRef, Component } from '@angular/core';
import { FromToPanelService } from '../from-to-panel.service';
@Component({
  selector: 'app-panel',
  imports: [],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css',
  standalone: true,
})
export class PanelComponent {
  constructor(
    private sharedService: FromToPanelService,
    private cdRef: ChangeDetectorRef,
  ) { }
  Command: string = '';
  Stroke:string='';
  ngOnInit() {
    this.sharedService.massage.subscribe((message) => {
      console.log('Received:', message);
      if (message) {
        this.Command = message[0];
        if(message[1]){
          this.Stroke=message[1];
        }
        this.cdRef.detectChanges();
      }
    });
  }
}
