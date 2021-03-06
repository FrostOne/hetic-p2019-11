import {CubeThemes} from './cube-assets/cube-themes.js'
import {CubePositions} from './cube-assets/cube-positions.js'
import {CubeAnimation} from './cube-assets/cube-animation.js'
import {CubeInteraction} from './cube-assets/cube-interaction.js'
import {Detector} from '../modules/detector.js'

export class Cube {

    setTheme(cubeBase, themeSelected, force) {

        // dont render if no changes
        if (this.activeTheme === themeSelected && force !== true)
            return

        cubeBase.children.forEach((texture, index) => {
            switch (texture.name) {
                case "roll_sphere":
                    //sphere + reflections
                    let cubeCamera = new window.THREEx.CubeCamera(texture);
                    this.scene.add(cubeCamera.object3d);
                    texture.material.envMap = cubeCamera.textureCube;
                    cubeCamera.update(this.renderer, this.scene);
                    break;
                case "glide1 extru_glide extru_glide1":
                    texture.material.color = themeSelected.colorSet.lightColor
                    break;
                case "extru_cube Cube1":
                case "extru_cube Neutre breathe":

                    texture.material.color = themeSelected.colorSet.cube
                    break;
                    //need a glow

                    //SWICTHER
                case "pivot_breathe Pivot flip":
                    //SPIN
                case "spin spin2":
                case "spin spin3":
                    //JOYSTCK
                case "glide1 base_glade":
                case "glide1 extru_glide glide":
                    //ENGRENAGES
                case "roll roll1":
                case "roll rollmiddle":
                case "roll roll3":
                    //SMALL BUTTONS
                case "click cylindre1":
                case "click cyllindre2":
                case "click cylindre3":
                case "click cylindre4":
                case "click cylindre_middle":
                    texture.material.color = themeSelected.colorSet.mainColor
                    break;

                default:
                    texture.material.color = themeSelected.colorSet.cube

            }
        })
        document.querySelector('.menu__buttonBuy.unselectable').setAttribute('href', "https://www.antsylabs.com/products/fidget-cube?variant=" + themeSelected.buy_code)
        //update cube theme
        this.activeTheme = themeSelected
    }

    setPosition(cubeBase, positionSelected, force) {
        // dont render if no changes
        if (this.activePosition === positionSelected && !force)
            return

        const beginPosition = this.activePosition;
        const animation = new CubeAnimation("animatePositionChange", {
            beginPosition: beginPosition,
            positionSelected: positionSelected
        });

        //update cube position
        this.activePosition = positionSelected;
    }

    loadModel() {

        // =======================================================================//
        // .obj loader from threejs with his native method (onProgress, onerror)  //
        // =======================================================================//

        const manager = new THREE.LoadingManager();
        let loaderDisplay = document.querySelector('.value')
        // on progress
        const onProgress = function(xhr) {
            if (xhr.lengthComputable) {
                const percentComplete = xhr.loaded / xhr.total * 100;
                //console.log(Math.round(percentComplete, 2) + '% downloaded');
                //loaderDisplay.innerHTML = Math.round(percentComplete, 2) + "%"
            }
        };
        const onLoad = function(xhr){
        }
        // on error callback
        const onError = function(xhr) {};

        //final constructor
        const loaderCube = new THREE.OBJLoader(manager);

        // =======================================================================//
        // dom events for component ofs the cube,  components are model.children  //
        // =======================================================================//
        let model = loaderCube.load('dist/models3D/model.obj', (model) => {

            this.scene.add(model);

            //debug
            window.model = model;
            loader.changeState("end");

            //enable library for easy event listener
            const domEvents = new THREEx.DomEvents(this.camera, this.renderer.domElement);

            //bind our components
            model.children.forEach((mesh, index) => {
                switch (mesh.name) {
                    case "pivot_breathe Pivot flip":
                        mesh.animation = new CubeAnimation("animateSwitcher", {
                            mesh: mesh,
                            type: "interaction"
                        });
                        break;
                    case "click cylindre1":
                    case "click cyllindre2":
                    case "click cylindre3":
                    case "click cylindre4":
                    case "click cylindre_middle":
                        mesh.animation = new CubeAnimation("animateButtonsPush", {
                            mesh: mesh,
                            type: "interaction"
                        });
                        break;
                    case "spin spin2":
                    case "spin spin3":
                        mesh.animation = new CubeAnimation("animateSpin", {
                            mesh: mesh,
                            mesh2: (mesh.name === "spin spin3")
                                ? model.children.filter((m) => m.name === "spin spin2")[0]
                                : model.children.filter((m) => m.name === "spin spin3")[0],
                            type: "interaction"
                        });
                        break;
                }

                //  domEvents.addEventListener(mesh, 'touchstart', new CubeInteraction(event), false);
                domEvents.addEventListener(mesh, 'touchstart', (event) => {
                    switch (event.target.name) {
                        case "click cylindre1":
                        case "click cyllindre2":
                        case "click cylindre3":
                        case "click cylindre4":
                        case "click cylindre_middle":
                            navigator.vibrate([10, 30, 90]);
                            break;
                    }
                    if (mesh.animation)
                        mesh.animation();

                    //  console.info(event.target.name, event.target.id, mesh);
                    console.info(event.target);

                }, false);
            });
            if (window.Detector.isMobile)
                model.position.y = 0;

            //send new model to the Cube Class
            this.group = model;
            this.setTheme(model, this.activeTheme, true)
            this.setPosition(model, this.activePosition, false)
        }, onLoad,onProgress, onError);
    }

    constructor() {
        window.Detector = new Detector()
        this.enableVibration = window.Detector.vibrate;

        //themes config
        window.Cube = this
        this.themes = new CubeThemes()
        this.activeTheme = this.themes[0]

        //positions config
        this.positions = new CubePositions()
        this.activePosition = this.positions[0]
        window.cubeAnimationState = false


        //three.js set up
        this.renderScene()
        this.setLights()
        this.setCamera();


        //sandbox for three.js
        if (window.Detector.isMobile) {
            const controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        }

        // =======================================================================//
        // Let's get stared  (ha!)                                                //
        // =======================================================================//
        this.animate()
        loader.changeState("loading the cube");
        this.loadModel()
        //dom events handlers
        window.addEventListener('resize', () => this.onWindowResize(), false)
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        window.requestAnimationFrame(this.animate.bind(this));
        this.render();
    }

    render() {
        //we need to work on theses ones
        // const color = new THREE.Color(0xffffff);
        this.renderer.render(this.scene, this.camera);
        if (this.group) {
            //let parent = this.group.children.filter((m) => m.name === "spin spin2")[0].rotation.z += 0.1;
            //let child = this.group.children.filter((m) => m.name === "spin spin3")[0].rotation.z += 0.1;
            //this.group.rotation.x += 0.06
        }
    }

    setLights() {
        // =======================================================================//
        // Lights and this.camera                                                 //
        // =======================================================================//

        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
        directionalLight.position.set(0, 0, 1);
        this.scene.add(directionalLight);
        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
        directionalLight.position.set(-1, 0, -1);
        this.scene.add(directionalLight);
        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
        directionalLight.position.set(1, 1, 0);
        this.scene.add(directionalLight);
        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
        directionalLight.position.set(-1, -1, 0);
        this.scene.add(directionalLight);


        //const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
        //this.scene.add(light);

    }

    setCamera() {
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera = camera
        this.camera.position.z = 750;
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera = camera;
    }

    renderScene() {
        // this container will be injected to the dom with our canvas
        this.container = document.createElement('div');
        document.body.appendChild(this.container);

        // ======================//
        // Init Three.js Canvas //
        // =====================//
        let scene = new THREE.Scene()
        this.scene = scene

        const renderer = window.Detector.webgl
            ? new THREE.WebGLRenderer({
                //antialias : better shape
                antialias: false,
                //transparent background
                alpha: true
            })
            : new THREE.CanvasRenderer();

        this.renderer = renderer
        //set size
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.id = "three";

        //ITS ALIIIIIIIIIVE
        this.container.appendChild(this.renderer.domElement);
    }
}
