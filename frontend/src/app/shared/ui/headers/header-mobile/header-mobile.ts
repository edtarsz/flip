import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideGalleryHorizontalEnd, LucideThumbsUp } from '@lucide/angular';

@Component({
  selector: 'app-header-mobile',
  imports: [LucideGalleryHorizontalEnd, LucideThumbsUp, RouterLink],
  templateUrl: './header-mobile.html',
  styleUrl: './header-mobile.css',
})
export class HeaderMobile { }
