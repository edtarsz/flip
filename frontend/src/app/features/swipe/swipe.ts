import { Component } from '@angular/core';
import { SeparatorUi } from "../../shared/ui/separator-ui/separator-ui";
import { LucideEye, LucideStar } from '@lucide/angular';

@Component({
  selector: 'app-swipe',
  imports: [SeparatorUi, LucideStar, LucideEye],
  templateUrl: './swipe.html',
  styleUrl: './swipe.css'
})
export class Swipe { }
