import { Component, ElementRef, HostListener, signal, ChangeDetectorRef, inject, afterNextRender, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { FilmTMDB } from '@core/types/tmdb/film.type';
import { FilmService } from '@core/services/film.service';
import { Film } from '@shared/ui/film/film';
import gsap from 'gsap';
import { LucideHouse, LucideMinus, LucidePlus, LucideRotateCcw } from '@lucide/angular';

interface FilmLayout {
  film: FilmTMDB;
  x: number; y: number;
  origX: number; origY: number;
  isAbove: boolean;
  branchPath: string;
  spineX: number;
}
interface YearMarker { year: string; cx: number; }

interface GroupedFilm {
  year: string;
  films: {
    film: FilmTMDB;
    isAbove: boolean;
    jitterIndex: number;
    vJitterIndex: number;
  }[];
}

@Component({
  selector: 'app-tree',
  imports: [Film, LucideHouse, LucideRotateCcw, LucidePlus, LucideMinus],
  templateUrl: './tree.html',
  styleUrl: './tree.css',
})
export class Tree implements OnInit {
  viewportRef = viewChild<ElementRef<HTMLDivElement>>('viewport');
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private filmService = inject(FilmService);

  readonly SPINE_Y       = 600;
  readonly OX            = 400;
  readonly BASE_YEAR_STEP= 180;
  readonly BRANCH_GAP_V  = 80;
  readonly CARD_W        = 120;
  readonly CARD_H        = 240;
  readonly CARD_STACK_GAP = 20;

  private readonly JITTER = [-150, 100, -110, 120, -90, 120, -120, 150];
  private readonly V_JITTER = [20, 30, 0, 50, 40, 10, 20, 30];

  translateX = signal(0);
  translateY = signal(0);
  scale      = signal(1);
  isDragging = signal(false);
  draggingFilm = signal<FilmLayout | null>(null);
  
  private _panObj = { x: 0, y: 0, scale: 1 };
  private _targetX = 0; private _targetY = 0; private _targetScale = 1;
  private _smx = 0; private _smy = 0;
  private _fmStartX = 0; private _fmStartY = 0;

  ALL_FILMS: FilmTMDB[] = [];

  filmsByYear: GroupedFilm[] = [];
  colCenters:  number[]      = [];
  filmLayout:  FilmLayout[]  = [];
  yearMarkers: YearMarker[]  = [];

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      const listId = Number(id) || 1;

      try {
        let allFilms: FilmTMDB[] = [];
        let page = 1;
        let totalPages = 1;

        do {
          const res = await lastValueFrom(this.filmService.getListById(listId, page));
          allFilms = [...allFilms, ...(res.items || [])];
          totalPages = res.total_pages || 1;
          page++;
        } while (page <= totalPages);

        this.ALL_FILMS = allFilms;
        this.rebuildLayout();
      } catch (err) {
        console.error('Failed to load TMDB list:', err);
        this.ALL_FILMS = [];
        this.rebuildLayout();
      }
    });
  }

  rebuildLayout() {
    this.filmsByYear = this.buildGroupedFilms();
    this.colCenters = this.buildColCenters();
    this.filmLayout = this.buildLayout();
    this.yearMarkers = this.buildYearMarkers();
    
    this.cdr.detectChanges();
    
    setTimeout(() => {
      if (this.viewportRef()) {
        this.resetViewport(false);
      }
    }, 0);
  }

  constructor() {
    afterNextRender(() => {
      if (this.viewportRef()) {
        this.resetViewport(false);
      }
    });
  }

  get spineX1() { return this.OX - 120; }
  get spineX2() { 
    if (this.colCenters.length === 0) return this.OX + 150;
    return this.colCenters[this.colCenters.length - 1] + this.CARD_W + 150; 
  }

  private buildGroupedFilms(): GroupedFilm[] {
    const map = new Map<string, FilmTMDB[]>();
    for (const film of this.ALL_FILMS) {
      if (!film.release_date) continue;
      const year = film.release_date.slice(0, 4);
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(film);
    }
    
    let totalIndex = 0;
    let lastSideWasAbove = true;
    
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, films]) => {
        films.sort((a, b) => a.release_date.localeCompare(b.release_date));
        
        const mappedFilms = films.map(film => {
          const pseudoRandom = (film.id * 13) % 100;
          const shouldSwitch = pseudoRandom < 75;
          const isAbove = shouldSwitch ? !lastSideWasAbove : lastSideWasAbove;
          lastSideWasAbove = isAbove;
          
          const jitterIndex = totalIndex % this.JITTER.length;
          const vJitterIndex = totalIndex % this.V_JITTER.length;
          totalIndex++;
          return { film, isAbove, jitterIndex, vJitterIndex };
        });
        return { year, films: mappedFilms };
      });
  }

  private buildColCenters(): number[] {
    const centers: number[] = [];
    let currentX = this.OX;

    for (let i = 0; i < this.filmsByYear.length; i++) {
      if (i === 0) {
        centers.push(currentX);
        continue;
      }

      let prevMaxRightTop: number | null = null;
      let prevMaxRightBottom: number | null = null;
      this.filmsByYear[i - 1].films.forEach(f => {
        const isAbove = f.isAbove;
        const j = this.JITTER[f.jitterIndex];
        if (isAbove) {
          if (prevMaxRightTop === null || j > prevMaxRightTop) prevMaxRightTop = j;
        } else {
          if (prevMaxRightBottom === null || j > prevMaxRightBottom) prevMaxRightBottom = j;
        }
      });

      let currMaxLeftTop: number | null = null;
      let currMaxLeftBottom: number | null = null;
      this.filmsByYear[i].films.forEach(f => {
        const isAbove = f.isAbove;
        const j = this.JITTER[f.jitterIndex];
        if (isAbove) {
          if (currMaxLeftTop === null || j < currMaxLeftTop) currMaxLeftTop = j;
        } else {
          if (currMaxLeftBottom === null || j < currMaxLeftBottom) currMaxLeftBottom = j;
        }
      });

      let requiredStepTop = 0;
      if (prevMaxRightTop !== null && currMaxLeftTop !== null) {
        requiredStepTop = prevMaxRightTop - currMaxLeftTop + this.CARD_W + 20;
      }
      
      let requiredStepBottom = 0;
      if (prevMaxRightBottom !== null && currMaxLeftBottom !== null) {
        requiredStepBottom = prevMaxRightBottom - currMaxLeftBottom + this.CARD_W + 20;
      }
      
      const step = Math.max(this.BASE_YEAR_STEP, requiredStepTop, requiredStepBottom);
      
      currentX += step;
      centers.push(currentX);
    }
    return centers;
  }

  private buildLayout(): FilmLayout[] {
    const layout: FilmLayout[] = [];
    this.filmsByYear.forEach((group, colIndex) => {
      const xCenter = this.colCenters[colIndex];

      let currentTopY = this.SPINE_Y - this.BRANCH_GAP_V;
      let currentBottomY = this.SPINE_Y + this.BRANCH_GAP_V;

      group.films.forEach((f) => {
        const isAbove = f.isAbove;
        const vJitter = this.V_JITTER[f.vJitterIndex];
        
        let cardY: number;
        if (isAbove) {
          currentTopY -= vJitter;
          cardY = currentTopY - this.CARD_H;
          currentTopY = cardY - this.CARD_STACK_GAP;
        } else {
          currentBottomY += vJitter;
          cardY = currentBottomY;
          currentBottomY = cardY + this.CARD_H + this.CARD_STACK_GAP;
        }

        const jitter = this.JITTER[f.jitterIndex];
        const cardX  = xCenter - this.CARD_W / 2 + jitter;

        const layoutItem: FilmLayout = {
          film: f.film,
          x: cardX,
          y: cardY,
          origX: cardX,
          origY: cardY,
          isAbove,
          branchPath: '',
          spineX: xCenter
        };
        this.updateBranchPath(layoutItem);
        layout.push(layoutItem);
      });
    });
    return layout;
  }

  updateBranchPath(item: FilmLayout) {
    const cardCenterY = item.y + this.CARD_H / 2;
    const isLeftOfCenter = (item.x + this.CARD_W / 2) < item.spineX;
    const endX = isLeftOfCenter ? item.x + this.CARD_W : item.x;
    const endY = cardCenterY;

    const startX = item.spineX;
    const startY = this.SPINE_Y;

    const cp1x = startX;
    const cp1y = startY + (endY - startY) * 0.5;
    const cp2x = isLeftOfCenter ? endX + 40 : endX - 40;
    const cp2y = endY;

    item.branchPath = `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
  }

  private buildYearMarkers(): YearMarker[] {
    return this.filmsByYear.map((g, i) => ({
      year: g.year,
      cx: this.colCenters[i],
    }));
  }

  resetViewport(animate: boolean = true) {
    const vw = this.viewportRef()!.nativeElement.clientWidth;
    const vh = this.viewportRef()!.nativeElement.clientHeight;
    
    this._targetX = -(this.spineX1 - Math.floor(vw * 0.1));
    this._targetY = -(this.SPINE_Y - Math.floor(vh * 0.5));
    this._targetScale = 1;

    if (animate) {
      gsap.to(this._panObj, {
        x: this._targetX,
        y: this._targetY,
        scale: this._targetScale,
        duration: 0.35,
        ease: "power3.inOut",
        onUpdate: () => {
          this.translateX.set(this._panObj.x);
          this.translateY.set(this._panObj.y);
          this.scale.set(this._panObj.scale);
        }
      });
    } else {
      this._panObj.x = this._targetX;
      this._panObj.y = this._targetY;
      this._panObj.scale = this._targetScale;
      this.translateX.set(this._panObj.x);
      this.translateY.set(this._panObj.y);
      this.scale.set(this._panObj.scale);
    }
  }

  resetFilms() {
    this.filmLayout.forEach(item => {
      gsap.to(item, {
        x: item.origX,
        y: item.origY,
        duration: 0.4,
        ease: "back.out(1.2)",
        onUpdate: () => {
          this.updateBranchPath(item);
        }
      });
    });

    const dummy = { val: 0 };
    gsap.to(dummy, {
      val: 1,
      duration: 0.4,
      onUpdate: () => {
        this.cdr.detectChanges();
      }
    });
  }

  onMouseDown(e: MouseEvent) {
    this.isDragging.set(true);
    gsap.killTweensOf(this._panObj);
    
    this._targetX = this._panObj.x;
    this._targetY = this._panObj.y;
    this._smx = e.clientX; 
    this._smy = e.clientY;
  }

  onFilmMouseDown(e: MouseEvent, item: FilmLayout) {
    e.stopPropagation();
    this.draggingFilm.set(item);
    this._fmStartX = e.clientX;
    this._fmStartY = e.clientY;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (this.draggingFilm()) {
      const item = this.draggingFilm()!;
      const screenDx = e.clientX - this._fmStartX;
      const screenDy = e.clientY - this._fmStartY;
      
      this._fmStartX = e.clientX;
      this._fmStartY = e.clientY;
      
      item.x += screenDx / this.scale();
      item.y += screenDy / this.scale();
      
      this.updateBranchPath(item);
      return;
    }

    if (!this.isDragging()) return;
    
    const dx = e.clientX - this._smx;
    const dy = e.clientY - this._smy;
    this._smx = e.clientX;
    this._smy = e.clientY;
    
    this._targetX += dx;
    this._targetY += dy;
    
    gsap.to(this._panObj, {
      x: this._targetX,
      y: this._targetY,
      duration: 0.15,
      ease: "power2.out",
      onUpdate: () => {
        this.translateX.set(this._panObj.x);
        this.translateY.set(this._panObj.y);
      }
    });
  }

  @HostListener('window:mouseup')
  onMouseUp() { 
    this.isDragging.set(false); 
    this.draggingFilm.set(null);
  }

  zoom(factor: number, cx?: number, cy?: number) {
    const oldScaleTarget = this._targetScale;
    let newScale = oldScaleTarget * factor;
    newScale = Math.max(0.1, Math.min(newScale, 3));
    if (newScale === oldScaleTarget) return;

    let viewportCx = 0;
    let viewportCy = 0;

    if (cx !== undefined && cy !== undefined) {
      const rect = this.viewportRef()!.nativeElement.getBoundingClientRect();
      viewportCx = cx - rect.left;
      viewportCy = cy - rect.top;
    } else {
      const rect = this.viewportRef()!.nativeElement.getBoundingClientRect();
      viewportCx = rect.width / 2;
      viewportCy = rect.height / 2;
    }

    const tx = this._targetX;
    const ty = this._targetY;

    const newTx = viewportCx - ((viewportCx - tx) / oldScaleTarget) * newScale;
    const newTy = viewportCy - ((viewportCy - ty) / oldScaleTarget) * newScale;

    this._targetX = newTx;
    this._targetY = newTy;
    this._targetScale = newScale;

    gsap.to(this._panObj, {
      x: this._targetX,
      y: this._targetY,
      scale: this._targetScale,
      duration: 0.2,
      ease: "power2.out",
      onUpdate: () => {
        this.translateX.set(this._panObj.x);
        this.translateY.set(this._panObj.y);
        this.scale.set(this._panObj.scale);
      }
    });
  }

  onWheel(e: WheelEvent) {
    if (e.deltaY !== 0) {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.8 : 1.25;
      this.zoom(factor, e.clientX, e.clientY);
    }
  }
}
