import * as THREE from "three";

import { GLTFLoader }
from "jsm/loaders/GLTFLoader.js";

import { EXRLoader }
from "jsm/loaders/EXRLoader.js";

/* ---------------- WINDOW ---------------- */

const w = window.innerWidth;
const h = window.innerHeight;

/* ---------------- RENDERER ---------------- */

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(w, h);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.outputColorSpace =
THREE.SRGBColorSpace;

renderer.toneMapping =
THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.1;

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
THREE.PCFSoftShadowMap;

document.body.appendChild(
    renderer.domElement
);

/* ---------------- SCENE ---------------- */

const scene = new THREE.Scene();

scene.background =
new THREE.Color(0x000000);

/* cinematic fog */

scene.fog =
new THREE.FogExp2(
    0x000000,
    0.12
);

/* ---------------- CAMERA ---------------- */

const camera =
new THREE.PerspectiveCamera(
    28,
    w / h,
    0.1,
    100
);

camera.position.set(0,0.3,4);

/* ---------------- HDRI ---------------- */

const exrLoader =
new EXRLoader();

exrLoader.load(

    "./studio_small_09_4k.exr",

    function(texture){

        texture.mapping =
        THREE.EquirectangularReflectionMapping;

        scene.environment =
        texture;

    }

);

/* ---------------- LIGHTS ---------------- */

/* Main cinematic spotlight */

const keyLight =
new THREE.SpotLight(
    0xffffff,
    40
);

keyLight.position.set(
    2,
    4,
    3
);

keyLight.angle = 0.3;

keyLight.penumbra = 1;

keyLight.decay = 2;

keyLight.distance = 20;

keyLight.castShadow = true;

keyLight.shadow.mapSize.width =
2048;

keyLight.shadow.mapSize.height =
2048;

scene.add(keyLight);

/* Rim light */

const rimLight =
new THREE.SpotLight(
    0xffffff,
    12
);

rimLight.position.set(
    -3,
    2,
    -2
);

rimLight.angle = 0.4;

rimLight.penumbra = 1;

scene.add(rimLight);

/* Soft ambient */

const ambient =
new THREE.AmbientLight(
    0xffffff,
    0.15
);

scene.add(ambient);

/* ---------------- FLOOR ---------------- */

const floorGeo =
new THREE.PlaneGeometry(
    20,
    20
);

const floorMat =
new THREE.MeshStandardMaterial({

    color: 0x050505,

    roughness: 0.15,

    metalness: 0.6

});

const floor =
new THREE.Mesh(
    floorGeo,
    floorMat
);

floor.rotation.x =
-Math.PI / 2;

floor.position.y = -1.8;

floor.receiveShadow = true;

scene.add(floor);

/* ---------------- SMOKE ---------------- */

const smokeGeo =
new THREE.PlaneGeometry(
    20,
    20
);

const smokeMat =
new THREE.MeshBasicMaterial({

    color: 0xffffff,

    transparent: true,

    opacity: 0.08,

    depthWrite: false,

    side: THREE.DoubleSide

});

const smoke1 =
new THREE.Mesh(
    smokeGeo,
    smokeMat
);

smoke1.position.set(
    0,
    0,
    -3
);

scene.add(smoke1);

const smoke2 =
new THREE.Mesh(
    smokeGeo,
    smokeMat.clone()
);

smoke2.position.set(
    0,
    1,
    -4
);

scene.add(smoke2);

/* ---------------- MODEL ---------------- */

let model;

const loader =
new GLTFLoader();

loader.load(

    "./protein_supplement_jar/scene.gltf",

    function(gltf){

        model = gltf.scene;

        model.scale.set(
            2,
            2,
            2
        );

        model.position.set(
            0,
            -1,
            0
        );

        model.rotation.y =
        Math.PI;

        model.traverse(
            function(child){

            if(child.isMesh){

                child.castShadow =
                true;

                child.receiveShadow =
                true;

                if(child.material){

                    /* realistic black plastic */

                    child.material.roughness =
                    0.82;

                    child.material.metalness =
                    0.08;

                    child.material.envMapIntensity =
                    3;

                    child.material.clearcoat =
                    0.25;

                    child.material.clearcoatRoughness =
                    0.4;

                    child.material.reflectivity =
                    0.6;

                    child.material.color.set(
                        0x111111
                    );

                }

            }

        });

        scene.add(model);

    },

    function(progress){

        console.log(

            ((progress.loaded /
            progress.total) * 100)

            + "% loaded"

        );

    },

    function(error){

        console.log(error);

    }

);

/* ---------------- MOUSE ---------------- */

const mouse = {

    x: 0,

    y: 0

};

window.addEventListener(

    "mousemove",

    (e) => {

        mouse.x =

        (e.clientX /
        window.innerWidth)
        * 2 - 1;

        mouse.y =

        -(e.clientY /
        window.innerHeight)
        * 2 + 1;

    }

);

/* ---------------- ANIMATION ---------------- */

function animate(){

    requestAnimationFrame(
        animate
    );

    /* ---------------- INTERACTIVE FOG ---------------- */

    smoke1.position.x +=

    (
        mouse.x * 1.5
        - smoke1.position.x
    ) * 0.01;

    smoke1.position.y +=

    (
        mouse.y * 0.5
        - smoke1.position.y
    ) * 0.01;

    smoke2.position.x +=

    (
        -mouse.x * 1
        - smoke2.position.x
    ) * 0.008;

    smoke2.position.y +=

    (
        -mouse.y * 0.3
        - smoke2.position.y
    ) * 0.008;

    /* drifting fog motion */

    smoke1.rotation.z +=
    0.0004;

    smoke2.rotation.z -=
    0.0002;

    /* breathing opacity */

    smoke1.material.opacity =

    0.06 +

    Math.sin(
        Date.now()*0.001
    ) * 0.02;

    smoke2.material.opacity =

    0.05 +

    Math.cos(
        Date.now()*0.001
    ) * 0.02;

    /* ---------------- PRODUCT ROTATION ---------------- */

    if(model){

        /* infinite slow 360 rotation */

        model.rotation.y += 0.003;

        /* subtle floating */

        model.position.y =

        -1 +

        Math.sin(
            Date.now()
            * 0.0015
        ) * 0.04;

    }

    renderer.render(
        scene,
        camera
    );

}

animate();

/* ---------------- RESIZE ---------------- */

window.addEventListener(

    "resize",

    () => {

        camera.aspect =

        window.innerWidth /
        window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }

);