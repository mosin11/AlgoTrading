@echo off

REM Get the current date and time
set "DEPLOY_TIME=%DATE% %TIME%"

REM Format the date and time to be more readable (optional)
set "DEPLOY_TIME_FORMATTED=%DATE:~0,10% %TIME:~0,8%"

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

REM Log deployment time to a file
echo "Deployment complete at %DEPLOY_TIME_FORMATTED%" >> deploy_log.txt

REM Open the deployed site in the default web browser
echo "Deployment complete. Opening the site..."
start https://mosin11.github.io/AlgoTrading/
