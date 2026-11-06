import { Component} from '@angular/core';
import { RouterOutlet} from '@angular/router';

@Component({
  selector:'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: '/app.component.css',
})

export class AppComponent {
  /** Nom interne de l'application. */
  readonly title = 'ivoire-educ-elite';

}
