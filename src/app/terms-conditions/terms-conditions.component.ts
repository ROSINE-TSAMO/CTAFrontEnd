import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.css']
})
export class TermsConditionsComponent implements OnInit {
  closeResult = '';
  constructor(private activeModal: NgbActiveModal) { }
  ngOnInit(): void {
    this.SetLocalStorage();
  }
  SetLocalStorage() {
    localStorage.setItem('terminiCondizioni', 'true');
  }
  closeModal() {
    this.activeModal.close('');
  }
}
