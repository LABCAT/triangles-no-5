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
                    this.destination.x - this.p.width, 
                    this.destination.y + this.p.height
                );
                break;
            case 's-e':
                this.origin = this.p.createVector(
                    this.destination.x - this.p.width, 
                    this.destination.y - this.p.height
                );
                break;
            case 'n-w':
                this.origin = this.p.createVector(
                    this.destination.x + this.p.width, 
                    this.destination.y + this.p.height
                );
                break;
            case 's-w':
                this.origin = this.p.createVector(
                    this.destination.x + this.p.width, 
                    this.destination.y - this.p.height
                );
                break;
        }
    }

    setDirection(direction) {
        switch (direction) {
            case 'n-e':
                this.direction = -30;
                break;
            case 's-e':
                this.direction = 30;
                break;
            case 'n-w':
                this.direction = -150;
                break;
            case 's-w':
                this.direction = 150;
                break;
        }
    }

    setLifeTime(lifetime) {
        const frameRate = this.p.getFrameRate() ? this.p.getFrameRate() : 60;
        this.totalsFrames = frameRate * lifetime;
    }

    draw() {
        if(this.canDraw) {
            const x1 = this.size * this.p.cos(0), y1 = this.size * this.p.sin(0);
            const x2 = this.size * this.p.cos(120), y2 = this.size * this.p.sin(120);
            const x3 = this.size * this.p.cos(240), y3 = this.size * this.p.sin(240);
            this.p.strokeWeight(this.size / 48);
            this.p.noStroke();

            if(this.currentFrame < this.totalsFrames){
                const scale = this.p.min(1, (this.currentFrame * 1000) / this.totalsFrames),
                    dist = window.p5.Vector.sub(this.destination, this.origin).mult(scale),
                    pos = window.p5.Vector.add(this.origin, dist);
                this.p.translate(pos.x, pos.y);
                this.p.rotate(this.direction);
                this.p.fill(this.colour);
                this.p.triangle(x1, y1, x2, y2, x3, y3);
                this.p.scale(0.9);
                this.p.fill(this.colour._getHue(), 100, 25);
                this.p.triangle(0, 0, x2, y2, x3, y3);
                this.p.fill(this.colour._getHue(), 100, 50);
                this.p.triangle(x1, y1, 0, 0, x3, y3);
                this.p.fill(this.colour._getHue(), 100, 75);
                this.p.triangle(x1, y1, x2, y2, 0, 0);
                this.p.rotate(-this.direction);
                this.p.translate(-pos.x, -pos.y);
                this.currentFrame++;
            }
        }
    }
}