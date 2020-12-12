
const XBOT_URL="./assets/model/Xbot.glb";








export default class App{
  constructor({view}){
    Object.assign(this,{
      view,
    });
    this.setupThree();
    this.setupScene();
    this.setupEvents();
  }
  setupThree(){
    const size=this.getSize();
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera( 75, size.width / size.height, 0.1, 1000 );
    
    let renderer = new THREE.WebGLRenderer({
      canvas:this.view,
    });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( size.width, size.height );
    document.body.appendChild( renderer.domElement );
    const mixer = new THREE.AnimationMixer(scene);

    const clock = new THREE.Clock();
    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set( 0, 1, 0 );
    controls.update();

    this.three={
      renderer,
      scene,
      camera,
      mixer,
      clock,
      controls,
    };
    
  }
  setupScene(){
    const {
      camera,
      scene,
      mixer,
    }=this.three;
    camera.position.z = 2;
    camera.position.y=1;
    camera.lookAt(new THREE.Vector3(0,1,0));

    let ambientLight = new THREE.AmbientLight( 0x808080 ); // soft white light
    scene.add( ambientLight );
    
    let pointLightA = new THREE.PointLight( 0xffffff, 1, 100 );
    pointLightA.position.set( 10, 10, 10 );
    scene.add( pointLightA );
    let pointLightB = new THREE.PointLight( 0xffffff, 1, 100 );
    pointLightB.position.set( -10, 10, 10 );
    scene.add( pointLightB );
    
    let container = new THREE.Group();
    scene.add( container );
    
    {
      let loader = new THREE.GLTFLoader();
      loader.load(
        XBOT_URL,
        (gltf)=>{
          const armature=gltf.scene.getObjectByName("Armature");
          scene.add(armature);
          const {animations:clips} = gltf;
          const actions={};
          const baseActions=["idle","walk","run"];
          for(let clip of clips){
            const {name}=clip;
            if(baseActions.includes(name)){
              //DO NOTHING
            }else{
              THREE.AnimationUtils.makeClipAdditive(clip);
            }
            const action=mixer.clipAction(clip,armature);
            actions[name]=action;

            // if(baseActions.includes(name)){
            //   action.play();
            // }
            action.setEffectiveWeight(0);
            action.play();

              switch(name){
              case "walk":
                action.setEffectiveWeight(1);
                break;
              case "headShake":
                action.setEffectiveWeight(1);
                break;
            }


          }
          setInterval(()=>{
            const {actionNames}=this.three;
            const name=actionNames[Math.floor(Math.random()*actionNames.length)]
            this.setAction(name);
          },1000*2);
          Object.assign(this.three,{
            armature,
            actions,
            currentActionName:"walk",
            actionNames:["idle","walk","run"],
          });
        },
        ()=>{},
        (error)=>{
          console.error("error",error);
        }
      );
    }

    Object.assign(
      this.three,{
        ambientLight,
        pointLightA,
        pointLightB,
        container,
      }
    );


  }
  setupEvents(){
    let animate = ()=> {
      requestAnimationFrame( animate );
      this.onTick();
    };
    animate();

    const handleResize=()=>{
      this.onResize();
    };
    window.addEventListener("resize",handleResize);
  }
  getSize(){
    return {
      width:window.innerWidth,
      height:window.innerHeight,
    }
  }
  setAction(name,duration=1){
    console.log(`${this.three.currentActionName} to ${name}`);
    if(this.three.currentActionName == name){
      return;
    }
    const {actions}=this.three;
    const currentAction=actions[this.three.currentActionName];
    const nextAction=actions[name];
    nextAction.enabled=true;
    nextAction.setEffectiveWeight(1);
    nextAction.crossFadeFrom(currentAction,duration);
    this.three.currentActionName=name;
  }

  onResize(){
    const {
      camera,
      renderer,
    }=this.three;
    const size=this.getSize();
    renderer.setSize(size.width,size.height);
    camera.aspect=size.width / size.height;
    camera.updateProjectionMatrix();
  }

  onTick(){
    const {
      container,
      renderer,
      scene,
      camera,
      mixer,
      clock,
    }=this.three;
    container.rotation.y += 0.01;
    renderer.render( scene, camera );
    mixer.update(clock.getDelta());
  }
  static load(){
    const promises=[];
    return Promise.all(promises);
  }
}