import { Component, afterNextRender, OnDestroy } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Header } from "../../shared/ui/headers/header-desktop/header-desktop";
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeaderMobile } from "@shared/ui/headers/header-mobile/header-mobile";

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, HeaderMobile],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnDestroy {
  private lenis: any;

  constructor() {
    afterNextRender(() => {
      this.lenis = new Lenis();

      this.lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        this.lenis?.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    });
  }

  ngOnDestroy() {
    if (this.lenis) {
      this.lenis.destroy();
    }
  }
}
