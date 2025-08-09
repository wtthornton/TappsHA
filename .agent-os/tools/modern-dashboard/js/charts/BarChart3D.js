/**
 * BarChart3D - 3D Bar Chart implementation
 * Extends Chart3DRenderer with bar-specific visualization and interactions
 */

class BarChart3D extends Chart3DRenderer {
  constructor(config) {
    super(config);
    this.bars = [];
    this.labels = [];
    this.grid = null;
    this.axes = [];
  }
  
  createGeometry() {
    this.createGrid();
    this.createAxes();
    this.createBars();
    this.createLabels();
  }
  
  createGrid() {
    // Create a grid for reference
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -0.5;
    this.scene.add(gridHelper);
    this.grid = gridHelper;
  }
  
  createAxes() {
    const { categories, series } = this.data;
    const axisLength = 15;
    
    // X-axis (red)
    const xGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(axisLength, 0, 0)
    ]);
    const xMaterial = new THREE.LineBasicMaterial({ color: 0xff4444, linewidth: 2 });
    const xAxis = new THREE.Line(xGeometry, xMaterial);
    this.scene.add(xAxis);
    this.axes.push(xAxis);
    
    // Y-axis (green)
    const yGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, axisLength, 0)
    ]);
    const yMaterial = new THREE.LineBasicMaterial({ color: 0x44ff44, linewidth: 2 });
    const yAxis = new THREE.Line(yGeometry, yMaterial);
    this.scene.add(yAxis);
    this.axes.push(yAxis);
    
    // Z-axis (blue)
    const zGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, axisLength)
    ]);
    const zMaterial = new THREE.LineBasicMaterial({ color: 0x4444ff, linewidth: 2 });
    const zAxis = new THREE.Line(zGeometry, zMaterial);
    this.scene.add(zAxis);
    this.axes.push(zAxis);
  }
  
  createBars() {
    const { categories, series } = this.data;
    const barWidth = 0.8;
    const barDepth = 0.8;
    const barSpacing = 1.2;
    const maxValue = Math.max(...series.flatMap(s => s.data));
    
    series.forEach((seriesData, seriesIndex) => {
      seriesData.data.forEach((value, categoryIndex) => {
        const height = (value / maxValue) * 10; // Scale height to max 10 units
        const x = (categoryIndex - categories.length / 2) * barSpacing;
        const z = (seriesIndex - series.length / 2) * barSpacing;
        
        // Create bar geometry
        const geometry = new THREE.BoxGeometry(barWidth, height, barDepth);
        const material = new THREE.MeshPhongMaterial({ 
          color: seriesData.color,
          transparent: true,
          opacity: 0.8,
          shininess: 100
        });
        
        const bar = new THREE.Mesh(geometry, material);
        bar.position.set(x, height / 2, z);
        bar.castShadow = true;
        bar.receiveShadow = true;
        
        // Store data for interactions
        bar.userData = { 
          value, 
          category: categories[categoryIndex], 
          series: seriesData.name,
          originalColor: seriesData.color,
          originalScale: bar.scale.clone()
        };
        
        this.bars.push(bar);
        this.scene.add(bar);
        
        // Add hover interaction
        this.addHoverInteraction(bar);
        
        // Add click interaction
        this.addClickInteraction(bar);
      });
    });
  }
  
  createLabels() {
    const { categories, series } = this.data;
    
    // Create category labels (X-axis)
    categories.forEach((category, index) => {
      const x = (index - categories.length / 2) * 1.2;
      const label = this.createTextLabel(category, new THREE.Vector3(x, -1, 0));
      this.labels.push(label);
    });
    
    // Create series labels (Z-axis)
    series.forEach((seriesData, index) => {
      const z = (index - series.length / 2) * 1.2;
      const label = this.createTextLabel(seriesData.name, new THREE.Vector3(-2, 0, z));
      this.labels.push(label);
    });
  }
  
  createTextLabel(text, position) {
    // Create a simple text label using CSS overlay
    const label = document.createElement('div');
    label.className = 'chart-label';
    label.textContent = text;
    label.style.position = 'absolute';
    label.style.color = '#ffffff';
    label.style.fontSize = '12px';
    label.style.fontFamily = 'Arial, sans-serif';
    label.style.pointerEvents = 'none';
    label.style.zIndex = '100';
    
    // Position will be updated in animate method
    label.userData = { position };
    document.body.appendChild(label);
    
    return label;
  }
  
  addHoverInteraction(bar) {
    const originalColor = bar.material.color.clone();
    const highlightColor = new THREE.Color(0xffff00);
    
    bar.addEventListener('mouseenter', (event) => {
      // Scale up the bar
      bar.scale.multiplyScalar(1.1);
      
      // Change color
      bar.material.color.copy(highlightColor);
      
      // Show tooltip
      this.showBarTooltip(bar, event);
    });
    
    bar.addEventListener('mouseleave', (event) => {
      // Scale back down
      bar.scale.copy(bar.userData.originalScale);
      
      // Restore original color
      bar.material.color.copy(originalColor);
      
      // Hide tooltip
      this.removeTooltip();
    });
  }
  
  addClickInteraction(bar) {
    bar.addEventListener('click', (event) => {
      // Create particle effect
      this.createParticleEffect(bar.position);
      
      // Highlight selected bar
      this.highlightBar(bar);
      
      // Dispatch custom event
      this.dispatchEvent(new CustomEvent('barSelected', {
        detail: bar.userData
      }));
    });
  }
  
  showBarTooltip(bar, event) {
    const content = `
      <div class="tooltip-content">
        <strong>${bar.userData.category}</strong><br>
        ${bar.userData.series}: ${bar.userData.value}%
      </div>
    `;
    
    const tooltip = this.createTooltip(content, {
      x: event.clientX + 10,
      y: event.clientY - 10
    });
    
    // Add styling
    tooltip.style.background = 'rgba(0, 0, 0, 0.9)';
    tooltip.style.color = '#ffffff';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.fontFamily = 'Arial, sans-serif';
    tooltip.style.border = '1px solid #333';
    tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
  }
  
  highlightBar(bar) {
    // Reset all bars
    this.bars.forEach(b => {
      b.material.opacity = 0.3;
    });
    
    // Highlight selected bar
    bar.material.opacity = 1.0;
    
    // Animate the highlight
    gsap.to(bar.scale, {
      x: 1.2,
      y: 1.2,
      z: 1.2,
      duration: 0.3,
      ease: "power2.out",
      yoyo: true,
      repeat: 1
    });
  }
  
  createParticleEffect(position) {
    const particleCount = 20;
    const particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const material = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.8
      });
      
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);
      particles.add(particle);
      
      // Animate particle
      gsap.to(particle.position, {
        x: position.x + (Math.random() - 0.5) * 3,
        y: position.y + (Math.random() - 0.5) * 3,
        z: position.z + (Math.random() - 0.5) * 3,
        duration: 1 + Math.random(),
        ease: "power2.out",
        onComplete: () => {
          particles.remove(particle);
        }
      });
      
      gsap.to(particle.material, {
        opacity: 0,
        duration: 1 + Math.random(),
        ease: "power2.out"
      });
    }
    
    this.scene.add(particles);
    
    // Remove particles group after animation
    setTimeout(() => {
      this.scene.remove(particles);
    }, 2000);
  }
  
  // Override animate method to update label positions
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (this.controls) {
      this.controls.update();
    }
    
    // Update label positions
    this.updateLabelPositions();
    
    this.renderer.render(this.scene, this.camera);
  }
  
  updateLabelPositions() {
    this.labels.forEach(label => {
      const worldPosition = label.userData.position.clone();
      worldPosition.project(this.camera);
      
      const x = (worldPosition.x * 0.5 + 0.5) * window.innerWidth;
      const y = -(worldPosition.y * 0.5 - 0.5) * window.innerHeight;
      
      label.style.left = x + 'px';
      label.style.top = y + 'px';
    });
  }
  
  // Data animation methods
  animateDataTransition(newData, duration = 1) {
    const currentBars = [...this.bars];
    const newBars = this.createBarsFromData(newData);
    
    // Animate out current bars
    currentBars.forEach((bar, index) => {
      gsap.to(bar.scale, {
        y: 0,
        duration: duration * 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          this.scene.remove(bar);
        }
      });
    });
    
    // Animate in new bars
    newBars.forEach((bar, index) => {
      bar.scale.y = 0;
      this.scene.add(bar);
      
      gsap.to(bar.scale, {
        y: 1,
        duration: duration * 0.5,
        delay: duration * 0.5 + index * 0.1,
        ease: "power2.out"
      });
    });
  }
  
  createBarsFromData(data) {
    // Helper method to create bars from new data
    const bars = [];
    const { categories, series } = data;
    const barWidth = 0.8;
    const barDepth = 0.8;
    const barSpacing = 1.2;
    const maxValue = Math.max(...series.flatMap(s => s.data));
    
    series.forEach((seriesData, seriesIndex) => {
      seriesData.data.forEach((value, categoryIndex) => {
        const height = (value / maxValue) * 10;
        const x = (categoryIndex - categories.length / 2) * barSpacing;
        const z = (seriesIndex - series.length / 2) * barSpacing;
        
        const geometry = new THREE.BoxGeometry(barWidth, height, barDepth);
        const material = new THREE.MeshPhongMaterial({ 
          color: seriesData.color,
          transparent: true,
          opacity: 0.8
        });
        
        const bar = new THREE.Mesh(geometry, material);
        bar.position.set(x, height / 2, z);
        bar.userData = { value, category: categories[categoryIndex], series: seriesData.name };
        
        bars.push(bar);
      });
    });
    
    return bars;
  }
  
  // Override dispose to clean up labels
  dispose() {
    // Remove labels
    this.labels.forEach(label => {
      if (label.parentNode) {
        label.parentNode.removeChild(label);
      }
    });
    
    super.dispose();
  }
}
