import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges } from '@angular/core';

interface Particle { x: number; y: number; }

@Component({
  selector: 'app-drawn-password',
  templateUrl: './drawn-password.component.html',
  styleUrls: ['./drawn-password.component.scss']
})
export class DrawnPasswordComponent implements OnInit {

  particles: Particle[] = [];
  @ViewChild('drawnpssw') canvas: ElementRef;

  constructor() {
    this.redraw = this.redraw.bind(this);
    this.reinit_particles = this.reinit_particles.bind(this);
  }

  ngOnInit() {
    for (let i = 0; i < 50000; i++) {
      const x = Math.random() * 500;
      const y = Math.random() * 500;
      this.particles.push({x, y});
    }

    setInterval(this.redraw, 100);
  }

  reinit_particles() {
    for (let i = 0; i < 50000; i++) {
      const x = Math.random() * 500;
      const y = Math.random() * 500;
      this.particles[i] = {x, y};
    }
  }

  redraw() {
    this.reinit_particles();

    const ctx: CanvasRenderingContext2D =
      this.canvas.nativeElement.getContext('2d');

    ctx.clearRect(0, 0, 500, 500);

    // Draw the clip path that will mask everything else
    // that we'll draw later.
    ctx.beginPath();
    ctx.moveTo(250, 60);
    ctx.lineTo(63.8, 126.4);
    ctx.lineTo(92.2, 372.6);
    ctx.lineTo(250, 460);
    ctx.lineTo(407.8, 372.6);
    ctx.lineTo(436.2, 126.4);
    ctx.moveTo(250, 104.2);
    ctx.lineTo(133.6, 365.2);
    ctx.lineTo(177, 365.2);
    ctx.lineTo(200.4, 306.8);
    ctx.lineTo(299.2, 306.8);
    ctx.lineTo(325.2, 365.2);
    ctx.lineTo(362.6, 365.2);
    ctx.lineTo(250, 104.2);
    ctx.moveTo(304, 270.8);
    ctx.lineTo(216, 270.8);
    ctx.lineTo(250, 189);
    ctx.lineTo(284, 270.8);
    ctx.clip('evenodd');

    // Draw 50,000 circles at random points
    ctx.beginPath();
    ctx.fillStyle = '#DD0031';
    for (const particle of this.particles) {
      ctx.moveTo(particle.x, particle.y);
      ctx.rect(particle.x, particle.y, 2, 2);
    }
    ctx.fill();
  }

}
