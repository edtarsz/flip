import { Component } from '@angular/core';
import { LucideGalleryHorizontalEnd, LucideThumbsUp } from '@lucide/angular';
import { Separator } from "@shared/ui/separator/separator";

@Component({
  selector: 'app-header-mobile',
  imports: [LucideGalleryHorizontalEnd, LucideThumbsUp],
  templateUrl: './header-mobile.html',
  styleUrl: './header-mobile.css',
})
export class HeaderMobile { }
