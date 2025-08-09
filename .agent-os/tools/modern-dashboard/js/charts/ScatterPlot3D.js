/**
 * ScatterPlot3D - 3D Scatter Plot implementation
 * Extends Chart3DRenderer with scatter plot specific visualization and interactions
 * 
 * Features:
 * - 3D point visualization with customizable colors and sizes
 * - Point clustering and grouping
 * - Interactive hover and click events
 * - Color coding by categories or values
 * - Dynamic data updates with smooth transitions
 * - Camera presets for different viewing angles
 * - Export functionality
 */

class ScatterPlot3D extends Chart3DRenderer {
  constructor(config) {
    super(config);
    
    // Scatter plot specific properties
    this.points = [];
    this.pointGroups = new Map();
    this.hoveredPoint = null;
    this.selectedPoint = null;
    this.colorScale = null;
    this.sizeScale = null;
    
    // Configuration defaults
    this.config = {
      ...this.config,
      pointSize: 0.1,
      pointOpacity: 0.8,
      enableClustering: true,
      clusterRadius: 2,
      colorBy: 'category', // 'category', 'value', 'custom'
      sizeBy: 'value', // 'value', 'custom', 'fixed'
      showGrid: true,
      showAxes: true,
      enableSelection: true,
      selectionColor: '#ff6b6b',
      ...config
    };
    
    // Initialize scales
    this.initializeScales();
  }

  /**
   * Initialize color and size scales
   */
  initializeScales() {
    // Color scale for different categories
    this.colorScale = {
      'Performance': '#3b82f6',
      'Security': '#ef4444', 
      'Compliance': '#10b981',
      'Efficiency': '#f59e0b',
      'Reliability': '#8b5cf6',
      'default': '#6b7280'
    };
    
    // Size scale for point values
    this.sizeScale = (value, min, max) => {
      const normalized = (value - min) / (max - min);
      return this.config.pointSize * (0.5 + normalized * 1.5);
    };
  }

  /**
   * Create 3D scatter plot geometry
   */
  createGeometry() {
    // Clear existing geometry
    this.clearGeometry();
    
    // Create grid and axes
    if (this.config.showGrid) {
      this.createGrid();
    }
    if (this.config.showAxes) {
      this.createAxes();
    }
    
    // Create scatter points
    this.createScatterPoints();
    
    // Add interactions
    this.addPointInteractions();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
  }

  /**
   * Create grid for reference
   */
  createGrid() {
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -5;
    this.scene.add(gridHelper);
  }

  /**
   * Create coordinate axes
   */
  createAxes() {
    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.position.y = -5;
    this.scene.add(axesHelper);
    
    // Add axis labels
    this.createAxisLabels();
  }

  /**
   * Create axis labels
   */
  createAxisLabels() {
    const labelGeometry = new THREE.PlaneGeometry(1, 0.5);
    const labelMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    
    // X-axis label
    const xLabel = new THREE.Mesh(labelGeometry, labelMaterial);
    xLabel.position.set(10, -5, 0);
    xLabel.rotation.y = Math.PI / 2;
    this.scene.add(xLabel);
    
    // Y-axis label
    const yLabel = new THREE.Mesh(labelGeometry, labelMaterial);
    yLabel.position.set(0, 5, 0);
    this.scene.add(yLabel);
    
    // Z-axis label
    const zLabel = new THREE.Mesh(labelGeometry, labelMaterial);
    zLabel.position.set(0, -5, 10);
    zLabel.rotation.x = -Math.PI / 2;
    this.scene.add(zLabel);
  }

  /**
   * Create scatter points from data
   */
  createScatterPoints() {
    if (!this.data || !this.data.points) return;
    
    const points = this.data.points;
    const groups = new Map();
    
    // Group points by category
    points.forEach(point => {
      const category = point.category || 'default';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category).push(point);
    });
    
    // Create point groups
    groups.forEach((groupPoints, category) => {
      this.createPointGroup(groupPoints, category);
    });
    
    this.pointGroups = groups;
  }

  /**
   * Create a group of points with shared properties
   */
  createPointGroup(points, category) {
    const group = new THREE.Group();
    const color = this.colorScale[category] || this.colorScale.default;
    
    points.forEach(point => {
      const pointMesh = this.createPoint(point, color);
      group.add(pointMesh);
      this.points.push(pointMesh);
    });
    
    this.scene.add(group);
  }

  /**
   * Create individual point mesh
   */
  createPoint(point, color) {
    // Calculate point size
    const size = this.config.sizeBy === 'value' 
      ? this.sizeScale(point.value, this.data.minValue, this.data.maxValue)
      : this.config.pointSize;
    
    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(size, 8, 6);
    
    // Create material with color and opacity
    const material = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: this.config.pointOpacity
    });
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    
    // Set position
    mesh.position.set(point.x, point.y, point.z);
    
    // Store point data
    mesh.userData = {
      originalPoint: point,
      category: point.category,
      value: point.value,
      color: color
    };
    
    return mesh;
  }

  /**
   * Add interactive features to points
   */
  addPointInteractions() {
    // Raycaster for mouse interactions
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Add hover interactions
    this.points.forEach(point => {
      this.addHoverInteraction(point);
    });
    
    // Add click interactions if enabled
    if (this.config.enableSelection) {
      this.points.forEach(point => {
        this.addClickInteraction(point);
      });
    }
  }

  /**
   * Add hover interaction to a point
   */
  addHoverInteraction(point) {
    // Store original material
    const originalMaterial = point.material.clone();
    
    // Add to interactive objects
    this.interactiveObjects.push(point);
    
    // Hover effect will be handled in animate loop
  }

  /**
   * Add click interaction to a point
   */
  addClickInteraction(point) {
    // Click handling will be done in the main event listener
  }

  /**
   * Handle mouse move for hover effects
   */
  handleMouseMove(event) {
    if (!this.raycaster || !this.mouse) return;
    
    // Calculate mouse position in normalized device coordinates
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
    
    // Handle hover effects
    if (intersects.length > 0) {
      const hoveredPoint = intersects[0].object;
      
      if (this.hoveredPoint !== hoveredPoint) {
        // Remove previous hover effect
        if (this.hoveredPoint) {
          this.removeHoverEffect(this.hoveredPoint);
        }
        
        // Apply hover effect
        this.applyHoverEffect(hoveredPoint);
        this.hoveredPoint = hoveredPoint;
        
        // Show tooltip
        this.showPointTooltip(hoveredPoint, event);
      }
    } else {
      // Remove hover effect if no point is hovered
      if (this.hoveredPoint) {
        this.removeHoverEffect(this.hoveredPoint);
        this.hoveredPoint = null;
        this.removeTooltip();
      }
    }
  }

  /**
   * Apply hover effect to a point
   */
  applyHoverEffect(point) {
    // Scale up the point
    gsap.to(point.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      duration: 0.2,
      ease: 'power2.out'
    });
    
    // Brighten the material
    gsap.to(point.material, {
      opacity: 1,
      duration: 0.2,
      ease: 'power2.out'
    });
  }

  /**
   * Remove hover effect from a point
   */
  removeHoverEffect(point) {
    // Scale down the point
    gsap.to(point.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.2,
      ease: 'power2.out'
    });
    
    // Restore original opacity
    gsap.to(point.material, {
      opacity: this.config.pointOpacity,
      duration: 0.2,
      ease: 'power2.out'
    });
  }

  /**
   * Show tooltip for a point
   */
  showPointTooltip(point, event) {
    const pointData = point.userData.originalPoint;
    const content = `
      <div class="scatter-tooltip">
        <h4>${pointData.label || 'Data Point'}</h4>
        <p><strong>Category:</strong> ${pointData.category}</p>
        <p><strong>Value:</strong> ${pointData.value}</p>
        <p><strong>Position:</strong> (${pointData.x.toFixed(2)}, ${pointData.y.toFixed(2)}, ${pointData.z.toFixed(2)})</p>
      </div>
    `;
    
    this.createTooltip(content, {
      x: event.clientX,
      y: event.clientY
    });
  }

  /**
   * Handle click on a point
   */
  handlePointClick(point) {
    if (!this.config.enableSelection) return;
    
    // Toggle selection
    if (this.selectedPoint === point) {
      this.deselectPoint(point);
    } else {
      if (this.selectedPoint) {
        this.deselectPoint(this.selectedPoint);
      }
      this.selectPoint(point);
    }
    
    // Trigger custom event
    this.dispatchEvent('pointSelected', {
      point: point.userData.originalPoint,
      selected: this.selectedPoint === point
    });
  }

  /**
   * Select a point
   */
  selectPoint(point) {
    this.selectedPoint = point;
    
    // Create selection effect
    const selectionGeometry = new THREE.SphereGeometry(
      point.geometry.parameters.radius * 1.8, 
      16, 
      12
    );
    const selectionMaterial = new THREE.MeshBasicMaterial({
      color: this.config.selectionColor,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    
    const selectionMesh = new THREE.Mesh(selectionGeometry, selectionMaterial);
    selectionMesh.position.copy(point.position);
    point.add(selectionMesh);
    
    // Store selection mesh for later removal
    point.userData.selectionMesh = selectionMesh;
    
    // Animate selection
    gsap.fromTo(selectionMesh.scale, 
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1, duration: 0.3, ease: 'back.out(1.7)' }
    );
  }

  /**
   * Deselect a point
   */
  deselectPoint(point) {
    if (point.userData.selectionMesh) {
      // Animate out and remove selection mesh
      gsap.to(point.userData.selectionMesh.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          point.remove(point.userData.selectionMesh);
          delete point.userData.selectionMesh;
        }
      });
    }
    
    this.selectedPoint = null;
  }

  /**
   * Create particle effect at point position
   */
  createParticleEffect(position) {
    const particleCount = 20;
    const particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.02, 4, 4);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);
      
      // Random initial velocity
      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      );
      
      particles.add(particle);
    }
    
    this.scene.add(particles);
    
    // Animate particles
    gsap.to(particles.children, {
      scale: 0,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      stagger: 0.05,
      onComplete: () => {
        this.scene.remove(particles);
      }
    });
    
    // Animate particle positions
    particles.children.forEach(particle => {
      gsap.to(particle.position, {
        x: particle.position.x + particle.userData.velocity.x * 10,
        y: particle.position.y + particle.userData.velocity.y * 10,
        z: particle.position.z + particle.userData.velocity.z * 10,
        duration: 1,
        ease: 'power2.out'
      });
    });
  }

  /**
   * Update data with smooth transitions
   */
  updateData(newData, duration = 1) {
    if (!newData || !newData.points) return;
    
    // Store new data
    this.data = newData;
    
    // Animate data transition
    this.animateDataTransition(newData, duration);
  }

  /**
   * Animate data transition
   */
  animateDataTransition(newData, duration) {
    const newPoints = newData.points;
    const currentPoints = this.points;
    
    // Create new point geometries
    const newPointMeshes = this.createPointsFromData(newPoints);
    
    // Animate existing points out
    currentPoints.forEach((point, index) => {
      gsap.to(point.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: duration * 0.5,
        ease: 'power2.in',
        delay: index * 0.01
      });
      
      gsap.to(point.material, {
        opacity: 0,
        duration: duration * 0.5,
        ease: 'power2.in',
        delay: index * 0.01
      });
    });
    
    // Animate new points in
    setTimeout(() => {
      // Clear old points
      this.clearGeometry();
      
      // Add new points
      newPointMeshes.forEach((point, index) => {
        point.scale.set(0, 0, 0);
        point.material.opacity = 0;
        
        gsap.to(point.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: duration * 0.5,
          ease: 'back.out(1.7)',
          delay: index * 0.01
        });
        
        gsap.to(point.material, {
          opacity: this.config.pointOpacity,
          duration: duration * 0.5,
          ease: 'power2.out',
          delay: index * 0.01
        });
      });
      
      // Update points array
      this.points = newPointMeshes;
      
      // Re-add interactions
      this.addPointInteractions();
    }, duration * 0.5);
  }

  /**
   * Create points from data
   */
  createPointsFromData(data) {
    const points = [];
    const groups = new Map();
    
    // Group points by category
    data.forEach(point => {
      const category = point.category || 'default';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category).push(point);
    });
    
    // Create point groups
    groups.forEach((groupPoints, category) => {
      const group = new THREE.Group();
      const color = this.colorScale[category] || this.colorScale.default;
      
      groupPoints.forEach(point => {
        const pointMesh = this.createPoint(point, color);
        group.add(pointMesh);
        points.push(pointMesh);
      });
      
      this.scene.add(group);
    });
    
    return points;
  }

  /**
   * Clear all geometry
   */
  clearGeometry() {
    // Remove all points
    this.points.forEach(point => {
      if (point.parent) {
        point.parent.remove(point);
      }
    });
    
    // Clear arrays
    this.points = [];
    this.pointGroups.clear();
    this.interactiveObjects = [];
    
    // Remove grid and axes
    this.scene.children = this.scene.children.filter(child => 
      child.type !== 'GridHelper' && 
      child.type !== 'AxesHelper' &&
      child.type !== 'Group'
    );
  }

  /**
   * Override animate to handle point interactions
   */
  animate() {
    super.animate();
    
    // Update point positions if needed
    this.updatePointPositions();
    
    // Update performance display
    if (this.performanceMonitor) {
      this.performanceMonitor.updateFPSDisplay();
    }
  }

  /**
   * Update point positions (for dynamic data)
   */
  updatePointPositions() {
    // This can be used for real-time data updates
    // where point positions change over time
  }

  /**
   * Override dispose to clean up point-specific resources
   */
  dispose() {
    // Remove all points
    this.points.forEach(point => {
      if (point.geometry) point.geometry.dispose();
      if (point.material) point.material.dispose();
    });
    
    // Clear arrays
    this.points = [];
    this.pointGroups.clear();
    
    // Call parent dispose
    super.dispose();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScatterPlot3D;
} else {
  window.ScatterPlot3D = ScatterPlot3D;
}
