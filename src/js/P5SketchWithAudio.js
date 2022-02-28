import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';
import TetradicColourCalculator from './functions/TetradicColourCalculator.js';
import ShuffleArray from './functions/ShuffleArray.js';

import AnimatedTriangle from './classes/AnimatedTriangle.js';

import audio from "../audio/triangles-no-5.ogg";
import midi from "../audio/triangles-no-5.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.bpm = 106;

        p.barAsSeconds = 60 / p.bpm * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[0].notes; // Sampler 1 -- TwinkleStars
                    const noteSet2 = result.tracks[6].notes; // Dr Rex 2 -- FunkHat
                    const noteSet3 = result.tracks[7].notes; // Thor 1 -- Scan Dance
                    const noteSet4 = result.tracks[4].notes; // Dr Rex 1 -- Artefact
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.scheduleCueSet(noteSet2, 'executeCueSet2');
                    p.scheduleCueSet(noteSet3, 'executeCueSet3');
                    p.scheduleCueSet(noteSet4, 'executeCueSet4');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.directions = ['n-w', 's-w', 'n-e', 's-e'];
        p.directionsIndex = 0;

        p.triangles = [];

        p.packedTrianglesSet = [];

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.colorMode(p.HSB);
            p.angleMode(p.DEGREES);
            p.background(255);

            p.directions = ShuffleArray(p.directions);
            p.direction = p.directions[0];
            p.colourScheme = TetradicColourCalculator(p, p.random(360));
            let currentColour = p.colourScheme[0], 
                x = 0,
                y = 0,
                size = 0; 

            while(p.packedTrianglesSet.length < 328) {
                x = p.random(0, p.width);
                y = p.random(0, p.height);
                if(p.packedTrianglesSet.length >= 160) {
                    size = p.random(p.width/96, p.width/128);
                    currentColour = p.colourScheme[3];
                }
                else if(p.packedTrianglesSet.length >= 130) {
                    size = p.random(p.width/16, p.width/32);
                    currentColour = p.colourScheme[2];
                }
                else if(p.packedTrianglesSet.length >= 20) {
                    size = p.random(p.width/64, p.width/96);
                    currentColour = p.colourScheme[1];
                }
                else {
                    size = p.random(p.width/32, p.width/64);
                }
                if([20, 130, 160].includes(p.packedTrianglesSet.length)){
                    p.directionsIndex++;
                    p.direction = p.directions[p.directionsIndex];
                }
                const tri = {
                    x: x,
                    y: y,
                    r: size
                }
                
                let overlapping = false;
                for (let i = 0; i < p.packedTrianglesSet.length; i++) {
                    const existingTri = p.packedTrianglesSet[i];
                    const distance = p.dist(tri.x, tri.y, existingTri.x, existingTri.y);
                    if (distance < tri.r + existingTri.r) {
                        overlapping = true;
                        break;
                    }
                }
                if(!overlapping) {
                    p.packedTrianglesSet.push(tri);
                    p.triangles.push(
                        new AnimatedTriangle(p, p.createVector(x, y), currentColour, size, p.direction)
                    )
                }
            }
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){
                p.background(255);
                for (let i = 0; i < p.triangles.length; i++) {
                    const triangle = p.triangles[i];
                    triangle.draw();
                }
            }
        }

        p.largeTriIndex = 0;

        p.executeCueSet1 = (note) => {
            const { currentCue } = note;
            let addTri = false, 
                duration = p.barAsSeconds;

            if([1, 17, 33, 49, 57].includes(currentCue % 64)){
                addTri = true;
                duration = [49, 57].includes(currentCue % 64) ? duration / 2 : duration;
            }      

            if(addTri){
                const triangle = p.triangles[p.largeTriIndex];
                triangle.setLifeTime(duration * 1000);
                triangle.canDraw = true;
                p.largeTriIndex++
            }
        }

        p.mediumTriIndex = 20;

        p.executeCueSet2 = (note) => {
            const { currentCue, duration } = note;
            let addTri = false;

            if([1, 2, 3, 6, 7, 10, 11, 12, 16, 17, 18].includes(currentCue % 20)){
                addTri = true;
            }      

            if(addTri){
                const triangle = p.triangles[p.mediumTriIndex];
                triangle.setLifeTime(duration * 1000);
                triangle.canDraw = true;
                p.mediumTriIndex++
            }
        }

        p.giantTriIndex = 130;

        p.executeCueSet3 = (note) => {
            const { currentCue } = note;
            let addTri = false, 
                duration = p.barAsSeconds;
            

            if([1, 10, 19, 28, 32].includes(currentCue % 36)){
                addTri = true;
                duration = [28, 32].includes(currentCue % 36) ? duration / 2 : duration;
            }
            
            if(addTri){
                const triangle = p.triangles[p.giantTriIndex];
                triangle.setLifeTime(duration * 1000);
                triangle.canDraw = true;
                p.giantTriIndex++
            }
        }

        p.smallTriIndex = 160;

        p.executeCueSet4 = (note) => {
            const { currentCue, duration } = note;
            let addTri = false;

            if([1, 4, 6, 7, 10, 11, 13,17, 18, 20].includes(currentCue % 20)){
                addTri = true;
            }      

            if(addTri){
                const triangle = p.triangles[p.smallTriIndex];
                triangle.setLifeTime(duration * 1000);
                triangle.canDraw = true;
                p.smallTriIndex++
            }
        }

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
