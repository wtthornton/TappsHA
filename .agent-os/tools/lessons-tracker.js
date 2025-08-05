/**
 * Lessons Tracker - Manages lessons learned and insights
 * 
 * Provides functionality to capture, list, and apply lessons learned
 * across the development process.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class LessonsTracker {
  constructor() {
    this.lessonsPath = path.join(__dirname, '../lessons-learned');
    this.categoriesPath = path.join(this.lessonsPath, 'categories');
    this.templatesPath = path.join(this.lessonsPath, 'templates');
    this.processPath = path.join(this.lessonsPath, 'process');
    this.integrationPath = path.join(this.lessonsPath, 'integration');
  }

  async handleLessons(options) {
    if (options.capture) {
      await this.captureLesson();
    } else if (options.list) {
      await this.listLessons();
    } else if (options.apply) {
      await this.applyLessons();
    } else {
      console.log('📚 Lessons Learned Management\n');
      console.log('Available commands:');
      console.log('  --capture  Capture new lesson learned');
      console.log('  --list     List all lessons learned');
      console.log('  --apply    Apply lessons learned to current project');
    }
  }

  async captureLesson() {
    console.log('📝 Capturing New Lesson Learned...\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    try {
      const lesson = await this.promptForLesson(rl);
      await this.saveLesson(lesson);
      console.log('\n✅ Lesson captured successfully!');
    } catch (error) {
      console.error('❌ Failed to capture lesson:', error.message);
    } finally {
      rl.close();
    }
  }

  async promptForLesson(rl) {
    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    const title = await question('📝 Lesson Title: ');
    const category = await question('📂 Category (technical/process/architecture/security): ');
    const description = await question('📖 Description: ');
    const context = await question('🔍 Context (when/where this occurred): ');
    const impact = await question('💡 Impact (what was learned): ');
    const action = await question('✅ Action (what to do differently): ');
    const tags = await question('🏷️  Tags (comma-separated): ');

    return {
      title,
      category,
      description,
      context,
      impact,
      action,
      tags: tags.split(',').map(t => t.trim()),
      timestamp: new Date().toISOString(),
      author: process.env.USER || 'unknown'
    };
  }

  async saveLesson(lesson) {
    // Ensure directories exist
    await this.ensureDirectories();

    // Create filename
    const filename = `${lesson.timestamp.split('T')[0]}-${lesson.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    const filepath = path.join(this.categoriesPath, lesson.category, filename);

    // Create markdown content
    const content = this.createLessonMarkdown(lesson);

    // Write file
    fs.writeFileSync(filepath, content);

    // Update index
    await this.updateLessonIndex(lesson);
  }

  createLessonMarkdown(lesson) {
    return `# ${lesson.title}

**Category:** ${lesson.category}  
**Date:** ${new Date(lesson.timestamp).toLocaleDateString()}  
**Author:** ${lesson.author}  
**Tags:** ${lesson.tags.join(', ')}

## Description
${lesson.description}

## Context
${lesson.context}

## Impact
${lesson.impact}

## Action
${lesson.action}

## Metadata
- **Created:** ${lesson.timestamp}
- **Category:** ${lesson.category}
- **Tags:** ${lesson.tags.join(', ')}
- **Status:** Active
`;
  }

  async ensureDirectories() {
    const dirs = [
      this.categoriesPath,
      path.join(this.categoriesPath, 'technical'),
      path.join(this.categoriesPath, 'process'),
      path.join(this.categoriesPath, 'architecture'),
      path.join(this.categoriesPath, 'security')
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  async updateLessonIndex(lesson) {
    const indexPath = path.join(this.lessonsPath, 'index.json');
    let index = [];

    if (fs.existsSync(indexPath)) {
      index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    }

    index.push({
      title: lesson.title,
      category: lesson.category,
      timestamp: lesson.timestamp,
      tags: lesson.tags,
      filename: `${lesson.timestamp.split('T')[0]}-${lesson.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`
    });

    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  }

  async listLessons() {
    console.log('📚 Lessons Learned Library\n');

    const indexPath = path.join(this.lessonsPath, 'index.json');
    if (!fs.existsSync(indexPath)) {
      console.log('No lessons found. Use --capture to add your first lesson.');
      return;
    }

    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

    // Group by category
    const byCategory = {};
    index.forEach(lesson => {
      if (!byCategory[lesson.category]) {
        byCategory[lesson.category] = [];
      }
      byCategory[lesson.category].push(lesson);
    });

    // Display by category
    for (const [category, lessons] of Object.entries(byCategory)) {
      console.log(`📂 ${category.toUpperCase()} (${lessons.length} lessons):`);
      lessons.forEach(lesson => {
        console.log(`  - ${lesson.title} (${new Date(lesson.timestamp).toLocaleDateString()})`);
        if (lesson.tags.length > 0) {
          console.log(`    Tags: ${lesson.tags.join(', ')}`);
        }
      });
      console.log('');
    }

    console.log(`📊 Total Lessons: ${index.length}`);
  }

  async applyLessons() {
    console.log('🔧 Applying Lessons Learned to Current Project...\n');

    const indexPath = path.join(this.lessonsPath, 'index.json');
    if (!fs.existsSync(indexPath)) {
      console.log('No lessons found to apply.');
      return;
    }

    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    const relevantLessons = await this.findRelevantLessons(index);

    if (relevantLessons.length === 0) {
      console.log('No relevant lessons found for current project.');
      return;
    }

    console.log(`📋 Found ${relevantLessons.length} relevant lessons:\n`);

    for (const lesson of relevantLessons) {
      console.log(`📝 ${lesson.title}`);
      console.log(`   Category: ${lesson.category}`);
      console.log(`   Action: ${lesson.action}`);
      console.log('');
    }

    // Generate recommendations
    await this.generateRecommendations(relevantLessons);
  }

  async findRelevantLessons(index) {
    // Simple relevance scoring based on project context
    const projectFiles = this.getProjectFiles();
    const relevantLessons = [];

    for (const lesson of index) {
      let relevanceScore = 0;

      // Check if lesson tags match project files
      for (const tag of lesson.tags) {
        if (projectFiles.some(file => file.toLowerCase().includes(tag.toLowerCase()))) {
          relevanceScore += 2;
        }
      }

      // Check category relevance
      if (lesson.category === 'technical' && projectFiles.some(f => f.includes('.java'))) {
        relevanceScore += 1;
      }
      if (lesson.category === 'architecture' && projectFiles.some(f => f.includes('Controller'))) {
        relevanceScore += 1;
      }

      if (relevanceScore > 0) {
        relevantLessons.push({ ...lesson, relevanceScore });
      }
    }

    return relevantLessons.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  getProjectFiles() {
    const projectRoot = path.join(__dirname, '../../');
    const files = [];

    // Get all relevant project files
    const patterns = ['**/*.java', '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/pom.xml', '**/package.json'];
    
    for (const pattern of patterns) {
      try {
        const glob = require('glob');
        const matches = glob.sync(pattern, { cwd: projectRoot });
        files.push(...matches);
      } catch (error) {
        // Skip if glob fails
      }
    }

    return files;
  }

  async generateRecommendations(lessons) {
    console.log('🎯 Recommendations Based on Lessons Learned:\n');

    const recommendations = [];

    for (const lesson of lessons) {
      const lessonPath = path.join(this.categoriesPath, lesson.category, lesson.filename);
      if (fs.existsSync(lessonPath)) {
        const content = fs.readFileSync(lessonPath, 'utf8');
        const actionMatch = content.match(/## Action\n([\s\S]*?)(?=\n##|$)/);
        
        if (actionMatch) {
          recommendations.push({
            lesson: lesson.title,
            action: actionMatch[1].trim()
          });
        }
      }
    }

    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. **${rec.lesson}**`);
      console.log(`   ${rec.action}`);
      console.log('');
    });

    // Save recommendations
    const recommendationsPath = path.join(this.lessonsPath, 'current-recommendations.md');
    const recommendationsContent = this.createRecommendationsMarkdown(recommendations);
    fs.writeFileSync(recommendationsPath, recommendationsContent);

    console.log(`💾 Recommendations saved to: ${recommendationsPath}`);
  }

  createRecommendationsMarkdown(recommendations) {
    let content = `# Current Project Recommendations

Generated from lessons learned on ${new Date().toLocaleDateString()}

## Recommendations

`;

    recommendations.forEach((rec, index) => {
      content += `### ${index + 1}. ${rec.lesson}

${rec.action}

---
`;
    });

    return content;
  }
}

module.exports = LessonsTracker; 