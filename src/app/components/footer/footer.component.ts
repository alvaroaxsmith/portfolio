import { Component, OnInit } from '@angular/core';
import { faAngular, faNodeJs } from '@fortawesome/free-brands-svg-icons';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  faAngular = faAngular;
  faNodeJs = faNodeJs;

  constructor() { }

  ngOnInit(): void {
  }

}
