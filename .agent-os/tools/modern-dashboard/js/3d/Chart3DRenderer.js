/**
 * Chart3DRenderer - Base class for all 3D chart components
 * Provides WebGL rendering pipeline, camera controls, and common functionality
 */

class Chart3DRenderer {
  constructor(config) {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animationId = null;
    this.config = config;
    this.data = config.data;
    this.container = config.container;
    this.performanceMonitor = null;
    
    this.init();
  }
  
  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
    this.setupLighting();
    this.createGeometry();
    this.setupPerformanceMonitoring();
    this.animate();
  }
  
  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);
    
    // Add fog for depth perception
    this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
  }
  
  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
  }
  
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false
    });
    
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    this.container.appendChild(this.renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }
  
  setupControls() {
    try {
      // Check if OrbitControls is available
      if (typeof THREE !== 'undefined' && typeof THREE.OrbitControls !== 'undefined') {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI;
        
        // Touch controls for mobile
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        this.controls.enablePan = true;
        
        console.log('✅ OrbitControls initialized successfully');
      } else {
        console.warn('⚠️ OrbitControls not available, using basic camera controls');
        this.setupBasicControls();
      }
    } catch (error) {
      console.error('❌ Error setting up OrbitControls:', error);
      this.setupBasicControls();
    }
  }
  
  setupBasicControls() {
    // Fallback basic controls without OrbitControls
    this.controls = {
      update: () => {},
      dispose: () => {}
    };
    
    // Add basic mouse controls
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    
    this.renderer.domElement.addEventListener('mousedown', (event) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    });
    
    this.renderer.domElement.addEventListener('mouseup', () => {
      isMouseDown = false;
    });
    
    this.renderer.domElement.addEventListener('mousemove', (event) => {
      if (isMouseDown) {
        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;
        
        // Rotate camera based on mouse movement
        this.camera.position.x += deltaX * 0.01;
        this.camera.position.y -= deltaY * 0.01;
        this.camera.lookAt(0, 0, 0);
        
        mouseX = event.clientX;
        mouseY = event.clientY;
      }
    });
    
    // Add zoom with mouse wheel
    this.renderer.domElement.addEventListener('wheel', (event) => {
      const zoomSpeed = 0.1;
      const zoom = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
      this.camera.position.multiplyScalar(zoom);
    });
  }
  
  setupLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    
    // Fill light from opposite direction
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-10, 5, -5);
    this.scene.add(fillLight);
    
    // Point light for highlights
    const pointLight = new THREE.PointLight(0x3b82f6, 0.5, 20);
    pointLight.position.set(0, 10, 0);
    this.scene.add(pointLight);
  }
  
  createGeometry() {
    // This method should be implemented by child classes
    throw new Error('createGeometry() must be implemented by child classes');
  }
  
  setupPerformanceMonitoring() {
    this.performanceMonitor = new PerformanceMonitor();
  }
  
  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (this.controls) {
      this.controls.update();
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  // Camera preset methods
  setCameraPreset(preset) {
    const presets = {
      isometric: { x: 5, y: 5, z: 5 },
      front: { x: 0, y: 0, z: 10 },
      back: { x: 0, y: 0, z: -10 },
      left: { x: -10, y: 0, z: 0 },
      right: { x: 10, y: 0, z: 0 },
      top: { x: 0, y: 10, z: 0 },
      bottom: { x: 0, y: -10, z: 0 }
    };
    
    const position = presets[preset];
    if (position) {
      this.camera.position.set(position.x, position.y, position.z);
      this.camera.lookAt(0, 0, 0);
    }
  }
  
  resetCamera() {
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
    if (this.controls && typeof this.controls.reset === 'function') {
      this.controls.reset();
    }
  }
  
  // Utility methods
  createTooltip(content, position) {
    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.innerHTML = content;
    tooltip.style.position = 'absolute';
    tooltip.style.left = position.x + 'px';
    tooltip.style.top = position.y + 'px';
    tooltip.style.zIndex = '1000';
    tooltip.style.pointerEvents = 'none';
    
    document.body.appendChild(tooltip);
    return tooltip;
  }
  
  removeTooltip() {
    const tooltip = document.querySelector('.chart-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }
  
  // Data update method
  updateData(newData) {
    this.data = newData;
    // Clear existing geometry
    while(this.scene.children.length > 0) { 
      this.scene.remove(this.scene.children[0]); 
    }
    
    // Recreate lighting
    this.setupLighting();
    
    // Recreate geometry with new data
    this.createGeometry();
  }
  
  // Export functionality
  exportAsImage() {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }
  
  // Cleanup method
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    // Remove event listeners
    window.removeEventListener('resize', () => this.onWindowResize());
  }
}

// Performance monitoring class
class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.setupMonitoring();
  }
  
  setupMonitoring() {
    const updateFPS = () => {
      const currentTime = performance.now();
      this.frameCount++;
      
      if (currentTime - this.lastTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        this.updateFPSDisplay();
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    updateFPS();
  }
  
  updateFPSDisplay() {
    let fpsDisplay = document.getElementById('fps-display');
    if (!fpsDisplay) {
      fpsDisplay = document.createElement('div');
      fpsDisplay.id = 'fps-display';
      fpsDisplay.style.position = 'fixed';
      fpsDisplay.style.top = '10px';
      fpsDisplay.style.left = '10px';
      fpsDisplay.style.color = '#ffffff';
      fpsDisplay.style.fontSize = '12px';
      fpsDisplay.style.fontFamily = 'monospace';
      fpsDisplay.style.zIndex = '1000';
      document.body.appendChild(fpsDisplay);
    }
    
    fpsDisplay.textContent = `FPS: ${this.fps}`;
    fpsDisplay.className = this.fps >= 50 ? 'fps-good' : 'fps-warning';
  }
}
