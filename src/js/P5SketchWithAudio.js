import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';
import TetradicColourCalculator from './functions/TetradicColourCalculator.js';

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

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[0].notes; // Sampler 1 -- TwinkleStars
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
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

        p.triangles = [];

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.colorMode(p.HSB);
            p.angleMode(p.DEGREES);
            p.background(0);

            p.direction = p.random(p.directions);
            p.colourScheme = TetradicColourCalculator(p, p.random(360));
            let currentColour = p.colourScheme[0], 
                x = 0,
                y = 0,
                size = 0; 
            for (let i = 0; i < 378; i++) {
                x = p.random(0, p.width);
                y = p.random(0, p.height);
                if( i >= 30) {
                    size = p.random(p.width/32, p.width/64);
                    currentColour = p.colourScheme[1];
                }
                else if(i >= 190) {
                    size = p.random(p.width/16, p.width/32);
                    currentColour = p.colourScheme[2];
                }
                else if(i >= 190) {
                    size = p.random(p.width/64, p.width/128);
                    currentColour = p.colourScheme[3];
                }
                else {
                    size = p.random(p.width/8, p.width/16);
                }
                p.triangles.push(
                    new AnimatedTriangle(p, p.createVector(x, y), currentColour, size, p.direction)
                )
            }

            p.tri = p.triangles[0];
            p.tri2 = p.triangles[300];
        }

        p.draw = () => {
            p.background(0);
            p.tri.draw();
            p.tri2.draw();
            console.log(p.audioLoaded);
            console.log(p.song.isPlaying());
            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.largeTriIndex = 0;
        p.cueSet1CurrentNote = '';

        p.executeCueSet1 = (note) => {
            const { duration, midi } = note;
            console.log(midi);
            // let addCircle = false,
            //     hue = 0,
            //     saturation = 0,
            //     brightness = 0, 
            //     alpha = 1,
            //     delayAmount = duration * 1000;
            // p.stroke(0);
            
            // switch (midi) {
            //     case 36:
            //         addCircle = true;
            //         brightness = 100;
            //         break;
            //     case 37:
            //         addCircle = true;
            //         break;
            //     case 42:
            //         addCircle = true;
            //         hue = p.random(0, 360);
            //         saturation = 100;
            //         brightness = 100;
            //         alpha = 0.1;
            //         break;
            //     case 44:
            //         addCircle = true;
            //         p.mediumCircleHue = p.mediumCircleIndexCount === 0 ? p.random(0, 360) : p.mediumCircleHue;
            //         saturation = 75;
            //         brightness = 75;
            //         break;
            //     case 45:
            //         addCircle = true;
            //         hue = p.bgHue;
            //         saturation = 100;
            //         brightness = 100;
            //         alpha = 0.5;
            //         break;
            //     default:
            //         addCircle = false;
            //         break;
            // }
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
