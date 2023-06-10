
import {useState, useEffect} from 'react';
import logo from './logo.svg';
import { Canvas } from '@react-three/fiber';
import './App.css';

import * as THREE from 'three';

function setupCanvas() {
    let ele = document.querySelector('#main')
    if (!ele ||  document.querySelector('#renderer')) {
        return
    }
    let scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xFF00FF,40,180);

    let renderer = new THREE.WebGLRenderer();
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight ); 
    renderer.domElement.id = 'renderer'
    ele.appendChild( renderer.domElement );

    let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000 );
    camera.updateProjectionMatrix();
    camera.position.z = 40;

    var backgroundGeometry = new THREE.SphereGeometry(4000,32,15);
    var backgroundMaterial = new THREE.RawShaderMaterial({
        vertexShader: `
      attribute vec3 position;

      uniform mat4 projectionMatrix;
      uniform mat4 modelViewMatrix;

      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
        fragmentShader: `
      #ifdef GL_ES
      precision mediump float;
      #endif

      #define OCTAVES 2
      #define RGB(r, g, b) vec3(float(r) / 255.0, float(g) / 255.0, float(b) / 255.0)

      uniform vec2 resolution;
      uniform float globalTime;
      uniform float starRotate;
      uniform float starSpeed;
      uniform float showAurora;

      float random(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
      }

      vec2 rand2(vec2 p) {
          p = vec2(dot(p, vec2(12.9898,78.233)), dot(p, vec2(26.65125, 83.054543))); 
          return fract(sin(p) * 43758.5453);
      }

      float rand(vec2 p) {
          return fract(sin(dot(p.xy ,vec2(54.90898,18.233))) * 4337.5453);
      }



      //
      // Description : Array and textureless GLSL 2D simplex noise function.
      //      Author : Ian McEwan, Ashima Arts.
      //  Maintainer : ijm
      //     Lastmod : 20110822 (ijm)
      //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
      //               Distributed under the MIT License. See LICENSE file.
      //               https://github.com/ashima/webgl-noise
      //

      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec2 mod289(vec2 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec3 permute(vec3 x) {
        return mod289(((x*34.0)+1.0)*x);
      }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                           -0.577350269189626,  // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);

        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;

        i = mod289(i); // Avoid truncation effects in permutation
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));

        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;

        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;

        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      // Thanks to andmar1x https://www.shadertoy.com/view/MtB3zW
      float stars(in vec2 x, float numCells, float size, float br) {
        vec2 n = x * numCells;
        vec2 f = floor(n);

        float d = 1.0e10;
        for (int i = -1; i <= 1; ++i)
        {
          for (int j = -1; j <= 1; ++j)
          {
            vec2 g = f + vec2(float(i), float(j));
            g = n - g - rand2(mod(g, numCells)) + rand(g);
            // Control size
            g *= 1. / (numCells * size);
            d = min(d, dot(g, g));
          }
        }

        return br * (smoothstep(.95, 1., (1. - sqrt(d))));
      }

      float fractalNoise(in vec2 coord, in float persistence, in float lacunarity) {    
          float n = 0.;
          float frequency = 3.;
          float amplitude = 2.;
          for (int o = 0; o < OCTAVES; ++o)
          {
              n += amplitude * snoise(coord * frequency);
              amplitude *= persistence;
              frequency *= lacunarity;
          }
          return n;
      }

      void main() {
        vec2 coord = gl_FragCoord.xy / resolution.xy;
        vec2 starCoord = gl_FragCoord.xy / resolution.yy - vec2(.5, 0);
        vec3 color1 = RGB(10, 70, 50) * 1.5;
        vec3 color2 = RGB(50, 0, 40) * 1.1;
        float dist = distance(coord, vec2(0.5, 0.3)) * 1.5;

        float time = -globalTime / 100.;
        float starTime = time * starSpeed;
        mat2 RotationMatrix = mat2(cos(starRotate), sin(starRotate), -sin(starRotate), cos(starRotate));
        vec3 starField = stars(starCoord * RotationMatrix, 16., 0.03, 0.8) * vec3(.9, .9, .95);
             starField += stars(starCoord * RotationMatrix, 40., 0.025, 1.0) * vec3(.9, .9, .95) * max(0.0, fractalNoise(starCoord * RotationMatrix, .5, .2));

        vec3 aurora = RGB(0,255,130) * max(snoise(vec2((coord.x + sin(time)) * 10., coord.x * 40.)) * max((sin(10.0 * (coord.x + 2. * time)) *.1 + 1.26) - 2. * coord.y, 0.), 0.);
        vec3 aurora2 = RGB(0,235,170) * max(snoise(vec2((.09 * coord.x + sin(time * .5)) * 10., coord.x * 1.)) * max((sin(5.0 * (coord.x + 1.5 * time)) *.1 + 1.28) - 2. * coord.y, 0.), 0.);

        vec3 result = starField + (aurora * aurora2.g * 3.5*showAurora + aurora2 *showAurora);

        gl_FragColor = vec4(mix(color1, color2, dist), 1.0);
        gl_FragColor.rgb += result;
        //gl_FragColor.rgb = vec3(1., 0., 0.);
      }

    `,
        uniforms: {
            resolution: {
                value: new THREE.Vector2(window.innerWidth * window.devicePixelRatio,window.innerHeight * window.devicePixelRatio)
            },
            globalTime: {
                value: performance.now() / 1000
            },
            starRotate: {
                value : 0
            },
            starSpeed : {
                value: 1
            },
            showAurora: {
                value: 1
            }
        },
        side: THREE.BackSide
    });


    var background = new THREE.Mesh(backgroundGeometry,backgroundMaterial);
    scene.add(background);


    let mountainMaterial = new THREE.ShaderMaterial({
        vertexShader: `
      uniform vec3 mvPosition;

      varying vec2 vUv;
      varying float fogDepth;

      void main() {
        fogDepth = -mvPosition.z;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
        fragmentShader: `
      #ifdef GL_ES
      precision mediump float;
      #endif

      varying vec2 vUv;

      #include <fog_pars_fragment>

      float random(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
      }

      vec2 rand2(vec2 p)
      {
          p = vec2(dot(p, vec2(12.9898,78.233)), dot(p, vec2(26.65125, 83.054543))); 
          return fract(sin(p) * 43758.5453);
      }

      float rand(vec2 p)
      {
          return fract(sin(dot(p.xy ,vec2(54.90898,18.233))) * 4337.5453);
      }

      void main() {
        float offset = random(vec2(gl_FragCoord.w));
        vec2 c = vUv;
        vec2 p = vUv;
        p *= .3;
        p.y = p.y * 30. - 4.;
        p.x = p.x * (80. * offset) + 14.8 * offset;
        vec2 q = (p - vec2(0.5,0.5)) * 1.;
        // p = q;
        vec3 col = vec3(0.);

        float h = max(
          .0,
          max(
            max(
              abs(fract(p.x)-.5)-.25, 
              3.*(abs(fract(.7*p.x+.4)-.5)-.4) 
            ),
            max(
              1.2*(abs(fract(.8*p.x+.6)-.5)-.2), 
              .3*(abs(fract(.5*p.x+.2)-.5)) 
            ) 
          )
        );
        float fill = 1.0 - smoothstep(h, h+.001, p.y);

        vec3 col2 = col * min(fill, 2.0);

        gl_FragColor = vec4(col2, fill);

        #ifdef USE_FOG
          #ifdef USE_LOGDEPTHBUF_EXT
            float depth = gl_FragDepthEXT / gl_FragCoord.w;
          #else
            float depth = gl_FragCoord.z / gl_FragCoord.w;
          #endif
          float fogFactor = smoothstep(fogNear, fogFar, depth);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
        #endif
      }
    `,
        uniforms: THREE.UniformsLib.fog,
        fog: true,
        transparent: true
    })

    var mountainGeometry = new THREE.PlaneGeometry(600,200,1,1);

    var mountain = new THREE.Mesh(mountainGeometry,mountainMaterial);
    var mountain2 = new THREE.Mesh(mountainGeometry,mountainMaterial);
    var mountain3 = new THREE.Mesh(mountainGeometry,mountainMaterial);

    mountain.position.set(0, 0, 0);
    mountain2.position.set(0, -2, -26);
    mountain3.position.set(0, 0, -35);
    scene.add(mountain);
    scene.add(mountain2);
    scene.add(mountain3);


    var treeGeometry = new THREE.PlaneGeometry(200,200,1,1);
    var treeMaterial = new THREE.RawShaderMaterial( {
        vertexShader: '\n      attribute vec3 position;\n      attribute vec2 uv;\n\n      uniform mat4 projectionMatrix;\n      uniform mat4 modelViewMatrix;\n\n      varying vec2 vUv;\n\n      void main() {\n        vUv = uv;\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\n      }\n    ',
                fragmentShader: '\n      #ifdef GL_ES\n      precision mediump float;\n      #endif\n\n      #define RGB(r, g, b) vec3(float(r) / 255.0, float(g) / 255.0, float(b) / 255.0)\n\n      uniform float globalTime;\n\n      varying vec2 vUv;\n\n      float treeFill(in float size, in vec2 offset) {\n        vec2 p = vUv;\n        vec2 q = p - vec2(0.5,0.5);\n          vec2 q1 = 100.0 / size * q - offset;\n          float r= mod(-0.8*q1.y,1.-0.06*q1.y) * -0.05*q1.y - .1*q1.y;\n          float fill = (1.0 - smoothstep(r, r+0.001, abs(q1.x+0.5*sin(0.9 * globalTime + p.x * 25.0)*(1.0 + q1.y/13.0)))) * smoothstep(0.0, 0.01, q1.y + 13.0);\n          return fill;\n      }\n\n      vec4 tree(in float size, in vec2 offset) {\n        float glowDist = 0.12;\n        vec3 glowColor = RGB(11, 115, 95);\n        float tree = treeFill(size, offset);\n        float treeGlow = treeFill(size, vec2(offset.x + glowDist, offset.y));\n        return max(vec4(glowColor * (treeGlow - tree), treeGlow), vec4(0.0));\n      }\n\n      void main() {\n        vec2 c = vUv;\n        vec2 p = vUv;\n        p *= 0.3;\n        p.y = p.y * 30.0 - 4.0;\n        p.x = p.x * 30.0;\n        vec2 q = (p - vec2(0.5,0.5)) * 5.5;\n\n        vec4 col = tree(1.0, vec2(-30.0, 7.0));\n              col += tree(1.2, vec2(-15.0, 8.0));\n              col += tree(1.1, vec2(-12.0, 4.0));\n              col += tree(1.0, vec2(-9.0, 6.0));\n              col += tree(1.1, vec2(-10.0, 3.0));\n              col += tree(1.0, vec2(-3.0, 4.0));\n              col += tree(1.1, vec2(-1.5, 5.0));\n              col += tree(1.0, vec2(5.0, 3.0));\n              col += tree(1.3, vec2(12.0, 8.0));\n              col += tree(0.9, vec2(15.0, 7.0));\n              col += tree(1.0, vec2(18.0, 7.0));\n              col += tree(1.1, vec2(26.0, 7.0));\n\n        gl_FragColor = vec4(max(col.rgb * p.y, vec3(0.0)), col.a);\n      }\n    ',
        uniforms: {
            globalTime: {
                value: performance.now() / 1000
            }
        },
        transparent: true
    })
    let tree = new THREE.Mesh(treeGeometry,treeMaterial);
    scene.add(tree)

    window.addEventListener('resize', ()=> {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        background.material.uniforms.resolution.value.set(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
    })

    let starSpeed = 0.001
    let auroraNeed = 0
    ele.addEventListener('mouseenter', ()=>{
        starSpeed = 0.002
        auroraNeed = 0.8
    })

    ele.addEventListener('mousemove', (e)=> {
        //console.log(e)
        let scale = 200
        //camera.position.x = -e.screenX/scale
        //camera.position.y = e.screenY/scale
    })
    ele.addEventListener('mouseleave', ()=>{
        auroraNeed = 0
        starSpeed = 0.001
    })
    let last = 0
    function animate(timestamp) {
        requestAnimationFrame( animate );
        treeMaterial.uniforms.globalTime.value = background.material.uniforms.globalTime.value = timestamp / 1000
        background.material.uniforms.starRotate.value -= starSpeed;
        let v = background.material.uniforms.showAurora.value
        let delta = 0.04
        console.log(v)
            if (v > auroraNeed) {
                background.material.uniforms.showAurora.value -= delta
            }else {
                background.material.uniforms.showAurora.value += delta
            }
        //console.log(mountain.material.uniforms)
        renderer.render( scene, camera );
    }
    animate();
}


function App() {
    let [progress, setProgress] = useState(0)
    //setTimeout( setupCanvas, 100)
    return (
        <div id="main" className="bg-black w-full min-h-screen text-white flex flex-col md:flex-row justify-between">
            <div className="bg-blue-500 w-full h-full">
                aa
            </div>
            <div className="content w-full flex flex-col justify-between items-center">
                <div className="norse p-6 text-3xl text-gray-400 hover:text-gray-200 transition duration-700">
                    ZkPenguins on zkSynv Era
                </div>
                <div className="bg-black w-full flex flex-row justify-center items-center p-12 text-gray-500">
                    <span className="pb-1">©  </span><span className="norse">2023 zk Penguin</span>
                </div>
            </div>
        </div>
    );
}

export default App;
