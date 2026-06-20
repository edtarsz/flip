import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideGalleryHorizontalEnd, LucideThumbsUp } from '@lucide/angular';
import { Separator } from "@shared/ui/separator/separator";

@Component({
    selector: 'app-header-mobile',
    imports: [LucideGalleryHorizontalEnd, LucideThumbsUp, RouterLink, Separator],
    templateUrl: './header-mobile.html',
    styleUrl: './header-mobile.css',
})
export class HeaderMobile {}
