#!/bin/bash

echo "🚀 Preparing for GitHub Pages Deployment..."

# Build the React app
echo "📦 Building React app..."
cd client
npm run build
cd ..

# Create a temporary directory for deployment
echo "📁 Preparing deployment files..."
rm -rf deploy
mkdir deploy
cp -r client/build/* deploy/

# Create a simple index.html redirect for SPA routing
echo "🔧 Setting up SPA routing..."
cat > deploy/404.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>ICD Connect</title>
    <script type="text/javascript">
        // Single Page Apps for GitHub Pages
        // MIT License
        // https://github.com/rafgraph/spa-github-pages
        var pathSegmentsToKeep = 0;
        var l = window.location;
        l.replace(
            l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
            l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
            l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
            (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
            l.hash
        );
    </script>
</head>
<body>
</body>
</html>
EOF

# Add redirect script to index.html
echo "📝 Adding redirect script to index.html..."
sed -i '' 's/<head>/<head><script type="text\/javascript">(function(l){if(l.search[1]==="\/"){var decoded=l.search.slice(1).split("&").map(function(s){return s.replace(/~and~/g,"&")}).join("?");window.history.replaceState(null,null,l.pathname.slice(0,-1)+decoded+l.hash)}})(window.location)<\/script>/' deploy/index.html

echo "✅ Deployment files ready!"
echo ""
echo "📋 Next steps for GitHub Pages:"
echo "1. Create a GitHub repository (if not already done)"
echo "2. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Update app'"
echo "   git push origin main"
echo "3. Enable GitHub Pages in repository settings"
echo "4. The GitHub Actions workflow will automatically deploy to gh-pages branch"
echo ""
echo "🌐 Your app will be available at: https://[username].github.io/[repository-name]"
echo ""
echo "📚 See DEPLOYMENT_GUIDE.md for detailed instructions!"

