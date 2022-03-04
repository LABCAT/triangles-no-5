export default class AnimatedTriangle {
    constructor(p5, destination, colour, size = 200, direction = 's-e', lifetime = 1000) {
        this.canDraw = false;
        this.p = p5;
        this.destination = destination;
        this.colour = colour;
        this.size = size;
        this.currentFrame = 0;
        this.setOrigin(direction, destination);
        this.setDirection(direction);
        this.setLifeTime(lifetime);
    }

    setOrigin(direction, destination) {
        switch (direction) {
            case 'n-e':
                this.origin = this.p.createVector(
                   0, 
                   this.p.height
                );
                break;
            case 's-e':
                this.origin = this.p.createVector(
                    0, 
                    0
                );
                break;
            case 'n-w':
                this.origin = this.p.createVector(
                    this.p.width, 
                    this.p.height
                );
                break;
            case 's-w':
                this.origin = this.p.createVector(
                    this.p.width, 
                    0
                );
                break;
        }
    }

    setDirection(direction) {
        this.direction = direction;
        switch (direction) {
            case 'n-e':
                this.rotationDirection = -30;
                break;
            case 's-e':
                this.rotationDirection = 30;
                break;
            case 'n-w':
                this.rotationDirection = -150;
                break;
            case 's-w':
                this.rotationDirection = 150;
                break;
        }
    }

    setLifeTime(lifetime) {
        const frameRate = this.p.getFrameRate() ? this.p.getFrameRate() : 60;
        this.totalFrames = frameRate / 1000 * lifetime;
    }

    draw() {
        if(this.canDraw) {
            const x1 = this.size * this.p.cos(0), y1 = this.size * this.p.sin(0);
            const x2 = this.size * this.p.cos(120), y2 = this.size * this.p.sin(120);
            const x3 = this.size * this.p.cos(240), y3 = this.size * this.p.sin(240);
            let pos = this.destination;

            if(this.currentFrame < this.totalFrames){
                const scale = this.p.min(1, this.currentFrame / this.totalFrames),
                    dist = window.p5.Vector.sub(this.destination, this.origin).mult(scale);
                pos = window.p5.Vector.add(this.origin, dist);
            }
            this.p.push();
            this.p.noStroke();
            this.p.translate(pos.x, pos.y);
            this.p.rotate(this.rotationDirection);
            this.p.fill(this.colour);
            this.p.triangle(x1, y1, x2, y2, x3, y3);
            this.p.scale(0.9);
            this.p.fill(this.colour._getHue(), 100, 25, this.colour._getAlpha());
            this.p.triangle(0, 0, x2, y2, x3, y3);
            this.p.fill(this.colour._getHue(), 100, 50, this.colour._getAlpha());
            this.p.triangle(x1, y1, 0, 0, x3, y3);
            this.p.fill(this.colour._getHue(), 100, 75, this.colour._getAlpha());
            this.p.triangle(x1, y1, x2, y2, 0, 0);
            this.p.stroke(360);
            this.p.noFill();
            this.p.scale(0.83333);
            this.p.triangle(0, 0, x2, y2, x3, y3);
            this.p.triangle(x1, y1, 0, 0, x3, y3);
            this.p.triangle(x1, y1, x2, y2, 0, 0);
            this.p.scale(1.33333);
            this.p.rotate(-this.rotationDirection);
            this.p.translate(-pos.x, -pos.y);
            this.p.pop();
            this.currentFrame++;
        }
    }
}