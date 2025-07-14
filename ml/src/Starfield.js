// src/Starfield.js
import React from 'react';
import Sketch from 'react-p5';

let stars = [];

export default function Starfield() {
  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(window.innerWidth, window.innerHeight).parent(canvasParentRef);
    for (let i = 0; i < 400; i++) {
      stars.push(new Star(p5));
    }
  };

  const draw = (p5) => {
    p5.background(0);
    p5.translate(p5.width / 2, p5.height / 2);
    stars.forEach((star) => {
      star.update();
      star.show();
    });
  };

  class Star {
    constructor(p5) {
      this.p5 = p5;
      this.x = p5.random(-p5.width, p5.width);
      this.y = p5.random(-p5.height, p5.height);
      this.z = p5.random(p5.width);
      this.pz = this.z;
    }

    update() {
      this.z -= 10;
      if (this.z < 1) {
        this.z = this.p5.width;
        this.x = this.p5.random(-this.p5.width, this.p5.width);
        this.y = this.p5.random(-this.p5.height, this.p5.height);
        this.pz = this.z;
      }
    }

    show() {
      const sx = this.p5.map(this.x / this.z, 0, 1, 0, this.p5.width);
      const sy = this.p5.map(this.y / this.z, 0, 1, 0, this.p5.height);
      const r = this.p5.map(this.z, 0, this.p5.width, 8, 0);
      this.p5.noStroke();
      this.p5.fill(255);
      this.p5.ellipse(sx, sy, r, r);
    }
  }

  return (
    <div style={{ position: 'fixed', zIndex: 0, top: 0, left: 0 }}>
      <Sketch setup={setup} draw={draw} />
    </div>
  );
}
