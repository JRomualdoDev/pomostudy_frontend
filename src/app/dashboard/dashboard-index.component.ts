import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dashboard-index',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dashboard-index.html',
  styleUrls: ['./dashboard-index.css']
})
export class DashboardIndexComponent {
  tab = 'task';
}
