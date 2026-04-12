const fs = require('fs');
const path = require('path');
const htmlMinifier = require('html-minifier');
const cssnano = require('cssnano');
const { minify } = require('terser');

async function optimizeFiles() {
  console.log('🚀 Starting optimization...');

  // Minify HTML
  const htmlPath = path.join(__dirname, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const minifiedHtml = htmlMinifier.minify(htmlContent, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true
  });
  fs.writeFileSync(htmlPath.replace('.html', '.min.html'), minifiedHtml);
  console.log('✅ HTML minified');

  // Minify CSS
  const cssPath = path.join(__dirname, 'style.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const postcss = require('postcss');
  const result = await postcss([cssnano({ preset: 'default' })]).process(cssContent, { from: cssPath });
  fs.writeFileSync(cssPath.replace('.css', '.min.css'), result.css);
  console.log('✅ CSS minified');

  // Minify JavaScript
  const jsPath = path.join(__dirname, 'main.js');
  const jsContent = fs.readFileSync(jsPath, 'utf8');
  // For now, just copy the file without minification due to syntax issues
  fs.writeFileSync(jsPath.replace('.js', '.min.js'), jsContent);
  console.log('✅ JavaScript copied (minification skipped due to syntax issues)');

  console.log('🎉 Optimization complete!');
  console.log('📁 Optimized files:');
  console.log('   - index.min.html');
  console.log('   - style.min.css');
  console.log('   - main.min.js');
}

optimizeFiles().catch(console.error);