@echo off

REM Initialize a new Git repository
git init
REM Add all files to the staging area
git add .
REM Commit the changes
git commit -m "web soclet addedd"
REM Rename the default branch to 'main'
git branch -M main
REM Wait for 5 seconds before proceeding
timeout /t 5 /nobreak
REM Add remote repositories
git remote add origin https://github.com/mosin11/AlgoTrading.git
REM Wait for 5 seconds before proceeding
timeout /t 5 /nobreak
REM Push changes to the remote repository
git push -u origin main
REM Run npm predeploy
REM npm run predeploy
REM Run npm deploy
REM npm run deploy
REM npm install -g angular-cli-ghpages
REM ng deploy --base-href=https://mosin11.github.io/AlgoTrading/
REM Wait for 5 seconds before proceeding
timeout /t 5 /nobreak
echo "Building the project..."
ng build --configuration production --base-href /AlgoTrading/
REM Wait for 5 seconds before proceeding
timeout /t 5 /nobreak
echo "Deploying to GitHub Pages..."
npx angular-cli-ghpages --dir=dist/frontend/browser > deploy_log.txt 2>&1
REM Wait for 5 seconds before proceeding
timeout /t 5 /nobreak
REM Open the deployed site in the default web browser
echo "Deployment complete. Opening the site..."
start https://mosin11.github.io/AlgoTrading/

