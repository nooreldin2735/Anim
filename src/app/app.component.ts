import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EditorComponent } from './editor/editor.component';
import { PanelComponent } from './panel/panel.component';

@Component({
  selector: 'app-root',
  imports: [EditorComponent,PanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone:true
})
export class AppComponent {
  title = 'Anim';
}
