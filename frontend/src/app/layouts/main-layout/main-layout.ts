import { Component, afterNextRender, OnDestroy } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Header } from "../../shared/ui/headers/header-desktop/header-desktop";
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ToastComponent } from '@shared/ui/toast/toast';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, ToastComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnDestroy {
  private lenis: any;
  private tickerCallback = (time: number) => {
    this.lenis?.raf(time * 1000);
  };

  constructor() {
    afterNextRender(() => {
      this.lenis = new Lenis();

      this.lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add(this.tickerCallback);

      gsap.ticker.lagSmoothing(0);
    });
  }

  ngOnDestroy() {
    gsap.ticker.remove(this.tickerCallback);
    if (this.lenis) {
      this.lenis.destroy();
    }
  }
}
