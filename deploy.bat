@echo off

REM Deploy the Angular project to GitHub Pages
echo "Deploying to GitHub Pages..."
npx angular-cli-ghpages --dir=dist/frontend/browser > deploy_log.txt 2>&1

REM Check if the deploy command succeeded
if %ERRORLEVEL% neq 0 (
    echo "Deployment failed. Check deploy_log.txt for details."
    exit /b %ERRORLEVEL%
)

REM Wait for 5 seconds before proceeding
timeout /t 5 /nobreak

REM Open the deployed site in the default web browser
echo "Deployment complete. Opening the site..."
start https://mosin11.github.io/AlgoTrading/
