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
    window.devicePixelRatio
);

renderer.outputColorSpace =
THREE.SRGBColorSpace;

renderer.toneMapping =
THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.5;

document.body.appendChild(
    renderer.domElement
);

/* ---------------- SCENE ---------------- */

const scene = new THREE.Scene();

scene.background =
new THREE.Color(0x000000);

/* ---------------- CAMERA ---------------- */

const camera =
new THREE.PerspectiveCamera(

    45,
    w / h,
    0.1,
    100

);

camera.position.set(0,0,5);

/* ---------------- EXR ---------------- */

const exrLoader = new EXRLoader();

exrLoader.load(

    "./studio_small_09_4k.exr",

    function(texture){

        texture.mapping =
        THREE.EquirectangularReflectionMapping;

        scene.environment = texture;

    }

);

/* ---------------- LIGHTS ---------------- */

const light1 =
new THREE.DirectionalLight(
    0xffffff,
    5
);

light1.position.set(5,5,5);

scene.add(light1);

const light2 =
new THREE.DirectionalLight(
    0xffffff,
    3
);

light2.position.set(-5,3,-5);

scene.add(light2);

const ambient =
new THREE.AmbientLight(
    0xffffff,
    1
);

scene.add(ambient);

/* ---------------- MODEL ---------------- */

let model;

const loader = new GLTFLoader();

loader.load(

    "./protein_supplement_jar/scene.gltf",

    function(gltf){

        model = gltf.scene;

        model.scale.set(2,2,2);

        model.position.set(0,-1,0);

        scene.add(model);

        console.log(model);

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

/* ---------------- ANIMATION ---------------- */

function animate(){

    requestAnimationFrame(animate);

    if(model){

        model.rotation.y += 0.01;

    }

    renderer.render(scene,camera);

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