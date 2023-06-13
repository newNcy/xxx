
import { useState, useEffect } from 'react';
import logo from './logo.svg';
import { Canvas } from '@react-three/fiber';
import axios from 'axios';
import './App.css';

import images from './gallery';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Navigation } from 'swiper';
import 'swiper/swiper-bundle.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faTelegram , faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faCopy , faCaretDown} from '@fortawesome/free-solid-svg-icons';

import * as THREE from 'three';

import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultWallets,
    RainbowKitProvider,
    midnightTheme,
    lightTheme,
    darkTheme,
} from '@rainbow-me/rainbowkit';

import { configureChains, createClient, WagmiConfig, useSigner, useProvider } from "wagmi";
import { goerli, zkSync, zkSyncTestnet } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Contract, utils } from "ethers";
const {abi} = require('./abi.json');

SwiperCore.use([Autoplay, Navigation]);

const { chains, provider } = configureChains(
    [zkSync],
    [publicProvider()]
);

const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    projectId: 'YOUR_PROJECT_ID',
    chains,
});

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

let start = false
let shouldBlur = false
let panelHeightC = 0
let starSpeed = 0.001
let lockScroll = false
let chasingSteps = 50
let cameraY = 0
let updateScene = true
let scale = 30
let half = window.innerHeight*window.devicePixelRatio/scale/2.5

async function sleep(ms) { return new Promise(r=>setTimeout(r, ms))}

function ZERC20ConnectButton(props) {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus || authenticationStatus === 'authenticated');
                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button
                                        onClick={openConnectModal}
                                        type="button"
                                        className="btn-normal tag"
                                    >
                                        Connect Wallet
                                    </button>
                                );
                            }
                            if (chain.unsupported) {
                                return (
                                    <button
                                        onClick={openChainModal}
                                        type="button"
                                        className="btn-normal tag"
                                    >
                                        Wrong network
                                    </button>
                                );
                            }
                            return (
                                <div className="flex flex-col md:flex-row gap-1">
                                    <button
                                        onClick={openChainModal}
                                        style={{ display: 'flex', alignItems: 'center' }}
                                        type="button"
                                        className="btn rounded-md text-small tag"
                                    >
                                        {chain.name}
                                    </button>
                                    <button
                                        onClick={openAccountModal}
                                        type="button"
                                        className="btn-normal rounded-md text-small tag"
                                    >
                                        {account.displayName.substring(0, 4)}
                                        {account.displayBalance
                                            ? ` ${Number(account.balanceFormatted).toFixed(
                                                2
                                            )} Ξ`
                                            : ''}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}


function MintAmount({ start, end , onSelected, selectedIdx}) {
    const [selected, setSelected] = useState(selectedIdx ? selectedIdx :0);
  const op = [];

  for (let i = start; i <= end; ++i) {
    op.push(i);
  }

  return (
    <div className="row w-full justify-between border-gray-400 border-l-2 border-t-2 border-b-2">
      {op.map((e, i) => (
          <div key={i} className={`border-r-2 w-full text-center transition-all duration-500  ${selected == i? 'bg-white text-gray-700':' hover:bg-gray-500'} `} onClick={e=> {
              if (selected != i) {
                  setSelected(i)
                  if (onSelected) {
                      onSelected(op[i], i)
                  }
              }
          }}>
          {e}
        </div>
      ))}
    </div>
  );
}

function shuffleArray(array) {
    // 遍历数组
    for (let i = array.length - 1; i > 0; i--) {
        // 生成随机位置
        const j = Math.floor(Math.random() * (i + 1));
        // 交换当前位置和随机位置的元素
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function Gallery({ images, reverse, filter, sort, speed , direction}) {
    SwiperCore.use([Autoplay]);
    return (
        <div className="h-full" style={{zIndex:999}}>
            <Swiper
                slidesPerView={1}
                loop={true}
                speed={speed ? speed : 2000}
                allowTouchMove={false}
                spaceBetween={0}
                centeredSlides = {true}
                autoplay={{
                    delay: 0,
                    disableOnInteraction: false,
                    reverseDirection: reverse,
                }}

                breakpoints = { {
                    768: {
                        slidesPerView: 2
                    }
                }}
            >

                {Object.keys(images).filter(filter ? filter : (e) => true).map(k =>
                    <SwiperSlide className="">
                        <img className="" src={images[k]} alt="Image 1" />
                    </SwiperSlide>
                )}
            </Swiper>
        </div>
    );
}





async function setupCanvas() {
    let ele = document.querySelector('#main')
    if (!ele || document.querySelector('#renderer')) {
        return
    }
    let scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xFF00FF, 40, 180);

    let renderer = new THREE.WebGLRenderer();
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = 'renderer'
    ele.appendChild(renderer.domElement);

    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.updateProjectionMatrix();
    camera.position.z = 40;

    const listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    const sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'audio/zkpenguin_mint.mp3', async function( buffer ) {
        await sleep(1000)
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.13 );
        sound.play();
    });

    window.setVolume = function(v) {
        sound.setVolume(v)
    }

    var backgroundGeometry = new THREE.SphereGeometry(4000, 32, 15);
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

        float h = 20.;
        vec3 aurora = RGB(0,255,130) * max(snoise(vec2((coord.x + sin(time)) * h, coord.x * 40.)) * max((sin(h * (coord.x + 2. * time)) *.1 + 1.26) - 3. * coord.y, 0.), 0.);
        vec3 aurora2 = RGB(0,235,170) * max(snoise(vec2((.09 * coord.x + sin(time * .1)) * h, coord.x * 1.)) * max((sin(2.0 * (coord.x + 1.5 * time)) *.1 + 1.28) - 3. * coord.y, 0.), 0.);

        vec3 result = starField + (aurora * aurora2.g * 3.5*showAurora + aurora2 *showAurora);

        gl_FragColor = vec4(mix(color1, color2, dist), 1.0);
        gl_FragColor.rgb += result;
        //gl_FragColor.rgb = vec3(1., 0., 0.);
      }

    `,
        uniforms: {
            resolution: {
                value: new THREE.Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio)
            },
            globalTime: {
                value: performance.now() / 1000
            },
            starRotate: {
                value: 0
            },
            starSpeed: {
                value: 1
            },
            showAurora: {
                value: 1
            }
        },
        side: THREE.BackSide
    });


    var background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
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

    var mountainGeometry = new THREE.PlaneGeometry(600, 200, 1, 1);

    var mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
    var mountain2 = new THREE.Mesh(mountainGeometry, mountainMaterial);
    var mountain3 = new THREE.Mesh(mountainGeometry, mountainMaterial);

    mountain.position.set(0, 0, 0);
    mountain2.position.set(0, -2, -26);
    mountain3.position.set(0, 0, -35);
    scene.add(mountain);
    scene.add(mountain2);
    scene.add(mountain3);


    var treeGeometry = new THREE.PlaneGeometry(200, 200, 1, 1);
    var treeMaterial = new THREE.RawShaderMaterial({
        vertexShader: '\n      attribute vec3 position;\n      attribute vec2 uv;\n\n      uniform mat4 projectionMatrix;\n      uniform mat4 modelViewMatrix;\n\n      varying vec2 vUv;\n\n      void main() {\n        vUv = uv;\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\n      }\n    ',
        fragmentShader: '\n      #ifdef GL_ES\n      precision mediump float;\n      #endif\n\n      #define RGB(r, g, b) vec3(float(r) / 255.0, float(g) / 255.0, float(b) / 255.0)\n\n      uniform float globalTime;\n\n      varying vec2 vUv;\n\n      float treeFill(in float size, in vec2 offset) {\n        vec2 p = vUv;\n        vec2 q = p - vec2(0.5,0.5);\n          vec2 q1 = 100.0 / size * q - offset;\n          float r= mod(-0.8*q1.y,1.-0.06*q1.y) * -0.05*q1.y - .1*q1.y;\n          float fill = (1.0 - smoothstep(r, r+0.001, abs(q1.x+0.5*sin(0.9 * globalTime + p.x * 25.0)*(1.0 + q1.y/13.0)))) * smoothstep(0.0, 0.01, q1.y + 13.0);\n          return fill;\n      }\n\n      vec4 tree(in float size, in vec2 offset) {\n        float glowDist = 0.12;\n        vec3 glowColor = RGB(11, 115, 95);\n        float tree = treeFill(size, offset);\n        float treeGlow = treeFill(size, vec2(offset.x + glowDist, offset.y));\n        return max(vec4(glowColor * (treeGlow - tree), treeGlow), vec4(0.0));\n      }\n\n      void main() {\n        vec2 c = vUv;\n        vec2 p = vUv;\n        p *= 0.3;\n        p.y = p.y * 30.0 - 4.0;\n        p.x = p.x * 30.0;\n        vec2 q = (p - vec2(0.5,0.5)) * 5.5;\n\n        vec4 col = tree(1.0, vec2(-30.0, 7.0));\n              col += tree(1.2, vec2(-15.0, 8.0));\n              col += tree(1.1, vec2(-12.0, 4.0));\n              col += tree(1.0, vec2(-9.0, 6.0));\n              col += tree(1.1, vec2(-10.0, 3.0));\n              col += tree(1.0, vec2(-3.0, 4.0));\n              col += tree(1.1, vec2(-1.5, 5.0));\n              col += tree(1.0, vec2(5.0, 3.0));\n              col += tree(1.3, vec2(12.0, 8.0));\n              col += tree(0.9, vec2(15.0, 7.0));\n              col += tree(1.0, vec2(18.0, 7.0));\n              col += tree(1.1, vec2(26.0, 7.0));\n\n        gl_FragColor = vec4(max(col.rgb * p.y, vec3(0.0)), col.a);\n      }\n    ',
        uniforms: {
            globalTime: {
                value: performance.now() / 1000
            }
        },
        transparent: true
    })
    let tree = new THREE.Mesh(treeGeometry, treeMaterial);
    scene.add(tree)

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        background.material.uniforms.resolution.value.set(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
    })

    let auroraNeed = 0
    let starFast = 0.003
    let starSlow = 0.001
    starSpeed = starFast
    auroraNeed = 0.8
    ele.addEventListener('mouseenter', () => {
        starSpeed = starFast
        auroraNeed = 0.8
    })

    let cameraX = 0

    ele.addEventListener('mousemove', (e) => {
        //console.log(e)
        let scale = 300
        let scale2 = 300
        cameraX = (e.screenX - window.innerWidth / 2) / scale
        //cameraY = -(e.screenY - window.innerHeight/2)/scale2
        //camera.position.x = cameraX
        //camera.position.y = cameraY
    })

    let lastY = null
    ele.addEventListener('touchmove', event=> {
        if (!lastY) {
            lastY = event.touches[0].clientY
            return
        }
        let deltaY = event.touches[0].clientY - lastY
        lastY = event.touches[0].clientY
        // 模拟"wheel"事件
        var wheelEvent = new WheelEvent("wheel", {
            deltaX: 0,
            deltaY: deltaY,
            deltaMode: WheelEvent.DOM_DELTA_PIXEL,
            bubbles: true,
            cancelable: true
        });
    })
    ele.addEventListener('wheel', e=> {
        console.log(e)
        if (lockScroll) {
            return
        }
        chasingSteps = 15
        if (cameraY > -half && e.deltaY > 0 || cameraY < half && e.deltaY < 0) {
            cameraY -= e.deltaY/scale
            cameraY = Math.max(-half/3*2, cameraY)
        }
        shouldBlur = cameraY <= -half/3*2
        if (shouldBlur) {
            setTimeout(()=> {
                starSpeed = starSlow 
                sound.setVolume( 0.2 );
            }, 100)
        }else {
                sound.setVolume( 0.13 );
            starSpeed = starFast
        }
        panelHeightC = Math.min(1, (-half/3*2 / 2 - cameraY) / (half / 2))
    })
    cameraY = half/3*2
    ele.addEventListener('mouseleave', () => {
        auroraNeed = 0
        //starSpeed = 0.001
    })
    let last = 0
    let chase = function (old, need, delta) {
        if (Math.abs(old - need) > 0.01) {
            delta = Math.abs(old - need) / chasingSteps
            if (old > need) {
                return old - delta
            } else {
                return old + delta
            }
        }

        return old
    }
    let first = 3
    function animate(timestamp) {
        requestAnimationFrame(animate);
        //console.log(start)
        if (!start && first > 0 || !updateScene) {
            return
        }
        first --
        treeMaterial.uniforms.globalTime.value = background.material.uniforms.globalTime.value = timestamp / 1000
        background.material.uniforms.starRotate.value -= starSpeed;
        let v = background.material.uniforms.showAurora.value
        let delta = 0.04
        //console.log(v)
        if (v > auroraNeed) {
            background.material.uniforms.showAurora.value -= delta
        } else {
            background.material.uniforms.showAurora.value += delta
        }

        camera.position.x = chase(camera.position.x, cameraX, 0.1)
        camera.position.y = chase(camera.position.y, cameraY, 0.1)
        //console.log(mountain.material.uniforms)
        renderer.render(scene, camera);
    }
    animate();
}

let contract_addr = '0xf5BCB59c1f3a3dB8bF396F18e045A539E5833bC8'

function Main() {
    let [slogenGray, setSlogenGray] = useState(300)
    let [bgShow, setBgShow] = useState(false)
    let [bgBlur, setBgBlur] = useState(false)
    let [panelHeight, setPanelHeight] = useState(0)
    let [panelOp, setPanelOp] = useState(0)
    let [minted, setMinted] = useState(0)
    let [total, setTotal] = useState(0)
    let [mintPrice, setMintPrice] = useState(0)
    let [minting, setMinting] = useState(false)
    let [isWhitelisted, setIsWhitelisted] = useState(false)
    let [proof, setProof] = useState([])
    let [mintAmount, setMintAmount] = useState(1)
    let [mintFee, setMintFee] = useState(0)
    let [wlClaimed, setWlClaimed] = useState(false)
    let [paused, setPaused] = useState(true)
    let [soldOut, setSoldout] = useState(false)
    let [msg, setMsg] = useState('hello world')
    let [msgCls, setMsgCls] = useState('opacity-0')
    let [isPhone, setIsPhone] = useState(false)
    let [phonectl, setPhoneCtl] = useState(false)

    let {data:signer} = useSigner()
    let provider = useProvider()

    let providerContract = new Contract(contract_addr, abi, provider)
    let signerContract = new Contract(contract_addr, abi, signer)


    let showMsg = async (msg, p) => {
        setMsg(msg)
        await sleep(100)
        setMsgCls('opacity-100')
        await sleep(3000)
        setMsgCls('opacity-0')
    }

    let updateMintProgress = async () => {
        try {
            let p = await providerContract.paused()
            setPaused(p)
            let ps = [providerContract.minted(), providerContract.totalSupply()]
            return new Promise(r=> {
            Promise.all(ps).then(cs=>{
                setSoldout(cs[0].eq(cs[1]))
                setMinted(cs[0].toNumber())
                setTotal(cs[1].toNumber())
                r(cs[0].eq(cs[1]))
            })
        })
        }catch(e) {}
        
    }
    function factor(p, t) {
        if (p>=t/2) return 1
        let start = 2
        let end = 1
        return p * ((end-start)*2/t) + start
    }
    let updateMintMenu = async () => {
        if (signer) {
                try {
                    let {data} = await axios.get(`proof/${await signer.getAddress()}`)
                    setProof(data)
                    if (data.length> 0) {
                        setIsWhitelisted(true)
                    }else {
                        setIsWhitelisted(false)
                    }

                    try {
                        //providerContract.mintPrice().then(setMintPrice)
                    }catch(e){
                    }
                    let so = updateMintProgress()
                        try {
                            let {fee, isWl} = await signerContract.mintFee(mintAmount, data)
                            if (isWl && fee == mintPrice*mintAmount) {
                                setWlClaimed(true)
                            } else {
                                setWlClaimed(false)
                            }
                            setMintFee(fee)
                        }catch(e) {
                        }
                }catch(e) {
                    showMsg(e.message)
                }
        }
    }

    useEffect(() => {
        let timer = setInterval(() => {
            //console.log(slogenGray)
            if (slogenGray == 400) {
                setSlogenGray(200)
            } else {
                setSlogenGray(400)
            }
        }, 3000)
        if (window.innerWidth < 400) {
            setIsPhone(true)
        }

        document.querySelector('#main').addEventListener('wheel', e=> {
            if (lockScroll) {
                return
            }
            if (shouldBlur) {
                setBgBlur(true)
            } else {
                setBgBlur(false)
            }
            setPanelHeight(panelHeightC)
            setPanelOp(panelHeightC)
        });
        updateMintMenu()
        let tm2 = setInterval(updateMintProgress, 1000)
        return () => {
            clearInterval(timer)
            clearInterval(tm2)
        }
    }, [slogenGray])

    async function onMint() {
        showMsg('Mint start...', sleep(3000))
        if (minting) {
            return
        }
        let res = 'mint success'
        setMinting(true)
        let tx = null
        try {
            tx = await signerContract.mint(mintAmount, proof, {
                value: mintFee
            })
        }catch(e) {
            console.log(e)
            if (e.message)
                res = e.data.message
        }
        let old = starSpeed
        setBgBlur(false)
        let up = updateScene
        window.setVolume(0.4)
        lockScroll = true
        chasingSteps = 8
        starSpeed = 0.03

        if (tx) {
            try {
                await tx.wait()
            }catch(e) {
                res = e.message
            }
        }

        starSpeed = old
        setMinting(false)
        window.setVolume(0.2)
        lockScroll = false
        setBgBlur(true)
        updateScene = up
        showMsg(res, sleep(3000))
    }

    return (
        <div id="main" className="bg-black w-full min-h-screen text-white flex flex-col md:flex-row justify-between  cursor-default ">
            <div className="absolute top-0 col h-full w-full">
                <div className="basis-1/2 col justify-center items-center">
                    <span className={`text-center blink text-2xl md:text-6xl norse hover:text-gray-200 transition  duration-700 ${bgShow?'blink':''} ${bgBlur ? 'blur-sm':''}`}>
                        ZkPenguins on zkSync Era
                    </span>
                </div>
            </div>
            <div className={`front absolute  top-0 w-full h-full flex flex-col justify-between items-center  ${bgBlur ? 'backdrop-blur-sm' : ''} transition duration-700`}>
                <div className="w-full text-sm md:text-3xl  text-gray-400 ">
                    <div className="w-full text-sm md:text-xl bg-red-100 gap-12 flex flex-col header items-center text-gray-400 ">
                        <div className="norse pt-6 lg:p-6 w-full flex flex-row justify-end ">
                            <div style={{ opacity: panelOp }} className="row md:gap-4 ">
                                {isWhitelisted &&
                                <div className="h-fit btn text-accent broder-accent">
                                    whitelist {wlClaimed && "claimed"}
                                </div>
                                }
                                <ZERC20ConnectButton />
                            </div>
                        </div>
                        
                    </div>
                </div>
                <div className="content  w-full h-full blur-none flex flex-col justify-end ">
                    <div className={bgShow ? 'hidden' : ''} onClick={e => {
                        setBgShow(true)
                        setTimeout(e => {
                            setupCanvas()
                            start = true
                        }, 0)
                    }}>
                        <span className="blur-none blink norse text-3xl">
                            -click-
                        </span>
                    </div>

                    {bgShow &&
                    <div className="mint-menu w-full h-full flex flex-col justify-between container pb-4" 
                    >
                        <div className="col h-full justify-center items-center">

                            <div className={`w-full text-center norse text-6xl msg ${msgCls}`}>
                                {msg} 
                            </div>
                        </div>

                        <div className={`transition duration-500 flex flex-col px-6 ${bgBlur?'':'blur-sm'} `} style={{
                            opacity: panelOp
                        }}>

                            <div className="row justify-between russo text-gray-500">
                                <span>Minted </span>
                                <span>{minted}/{total}</span>
                            </div>
                            <div className="bg-gray-700 w-full" style={{height:1}}>
                                <div className="bg-accent rounded-r h-full" style={{ width:`${total > 0? minted/total * factor(minted, total)* 100 : 0}%`, zIndex:999}}/>
                            </div>
                            <div className="w-full h-full row justify-between gap-4 pt-6">
                                <div className="w-1/2 col justify-center items-center border-gray-500 h-full ">
                                    <div className=" w-full md:blur-sm hover:blur-none transition duration-300 border-2 p-4 rounded-md">
                                        <Gallery images={images} />
                                    </div>
                                </div>
                                <div className="text-gray-400 w-1/2  norse md:p-4 flex flex-col gap-6 justify-between">
                                    <span className="text-3xl xl:text-6xl">Guide Your Penguin</span>
                                    <div className="text-md md:text-2xl px-3">
                                        {isWhitelisted && 
                                        <p className="text-accent">whitelist : freemint x <span className="text-white">[1]</span> 
                                            {wlClaimed && 
                                            <span className="tag">
                                                claimed
                                            </span>
                                            }
                                        </p>
                                        }
                                        <p>mint price : <span className="text-white">[{utils.formatEther(mintPrice)}</span> Ξ]</p>
                                        <p>Max per wallet : <span className="text-white">[4]</span></p>

                                    </div>
                                    <div className="px-3 flex flex-col md:flex-row between items-center gap-4">
                                        <div className="row items-center gap-4 w-full">
                                            <MintAmount selectedIdx={mintAmount-1} start={1} end={4} onSelected={ async amount => {
                                                setMintAmount(amount) 
                                                setTimeout(updateMintMenu, 100)
                                            }}/>
                                        </div>
                                        <div className="md:text-xl w-full text-right">
                                            total: {utils.formatEther(mintFee)}{isWhitelisted && !wlClaimed &&  <span className="text-green-500">(${utils.formatEther(mintPrice)* (mintAmount)}-${utils.formatEther(mintPrice)})</span>}Ξ
                                        </div>
                                    </div>
                                    <div className="w-full flex flex-col md:flex-row  gap-2 px-2">
                                        <button className={`mint-btn w-full ${minting? 'cursor-wait':''}` } disabled={(minting || soldOut || paused)}  onClick={onMint}>
                                            {paused ? 'not start' : soldOut? 'sold out': 'mint'}
                                        </button>
                                        <button className="mint-btn w-full row justify-center">
                                            View on Element 
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    }

                    <div className="russo animate-bounce w-6 h-6" onClick={ e=> {
                            if (phonectl) {
                                return
                            }
                        setPhoneCtl(true)
                        setTimeout(async ()=> {
                            let isOpen = bgBlur
                            if (isOpen) {
                                setPanelOp(0)
                                cameraY = half/3*2
                            }else {
                                cameraY = -half/3*2
                                setPanelOp(1)
                            }
                            setBgBlur(!bgBlur)
                            if (isPhone) {
                                //updateScene = !updateScene
                            }
                            setPhoneCtl(false)
                        },100)
                    }}>
                        {(bgShow && !minting)&&
                        <FontAwesomeIcon className = "ml-2" icon={faCaretDown} size="lg" />
                        }
                    </div>
                </div>
                <div className="bg-black w-full flex flex-row justify-center items-center pb-4 text-gray-500">
                    <span className="pb-1">©  </span><span className="norse">2023 zk Penguin</span>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider
                chains={chains}
                theme={lightTheme({
                    accentColor: '#1d41d8',
                    accentColorForeground: 'white',
                    fontStack: 'system',
                    overlayBlur: 'small',
                })}
            >
                <Main />
            </RainbowKitProvider>
        </WagmiConfig>
    );
}
