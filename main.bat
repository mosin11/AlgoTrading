@echo off

REM Initialize a new Git repository
git init
git add .
git commit -m "options token remove logic added"
git branch -M main

REM Wait for 5 seconds before proceeding
timeout /t 2 /nobreak

REM Add remote repositories
git remote add origin https://github.com/mosin11/AlgoTrading.git
timeout /t 2 /nobreak
git push -u origin main

REM Run npm predeploy
REM npm run predeploy

REM Run npm deploy
REM npm run deploy

REM Install angular-cli-ghpages if needed
REM npm install -g angular-cli-ghpages

REM Wait for 5 seconds before proceeding
timeout /t 2 /nobreak

REM Build the project
echo "Building the project..."
ng build --configuration production --base-href /AlgoTrading/ > build_log.txt 2>&1

REM Check if the build command succeeded
if %ERRORLEVEL% neq 0 (
    echo "Build failed. Check build_log.txt for details."
    exit /b %ERRORLEVEL%
)

REM Wait for 5 seconds before proceeding
timeout /t 5 /nobreak

REM Call the deployment batch file
echo "Calling deploy script..."
call ./deploy.bat

REM Exit the script
exit /b 0
