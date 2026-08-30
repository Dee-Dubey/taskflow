import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from './core/services/auth.service';
import { SocketService } from './core/services/socket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private auth = inject(AuthService);
  private socketService = inject(SocketService);
  protected readonly title = signal('TaskFlow');

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.socketService.connect();
    }
  }
  
  open(content: any) {
    this.modalService.open(content);
  }
}
