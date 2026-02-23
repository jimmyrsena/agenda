@echo off
title Subir para Vercel - Agenda
color 0A

:: Auto-elevar como admin
whoami /groups | find "S-1-16-12288" >nul
if not %errorlevel%==0 (
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================
echo    🚀 SUBIR AGENDA PARA VERCEL
echo ========================================
echo.

REM Ir para pasta do projeto
cd /d "C:\_sistemas2026\agenda"

REM 1. Configurar Git se nao tiver
if not exist ".git" (
    echo [1/6] Inicializando Git...
    git init
    git add .
)

REM 2. Configurar usuario Git
set /p USERNAME="Seu GitHub username (ex: JimmySena): "
set /p EMAIL="Seu email GitHub: "

git config user.name "%USERNAME%"
git config user.email "%EMAIL%"

REM 3. Commit
echo [2/6] Fazendo commit...
git add .
git commit -m "Deploy automatico $(date /t) $(time /t)" || echo Commit ja existe, pulando...

REM 4. Nome do repo
set /p REPO_NAME="Nome do repo GitHub (ex: agenda): "

REM 5. Adicionar remote e push
echo [3/6] Fazendo push para GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/%USERNAME%/%REPO_NAME%.git
git branch -M main
git push -u origin main --force

if %errorlevel% neq 0 (
    echo ERRO no push! Verifique login GitHub.
    pause
    exit /b 1
)

REM 6. Abrir Vercel para deploy
echo [4/6] Repo enviado! Agora deploy no Vercel...
echo Acesse: https://vercel.com/new?repository=%USERNAME%/%REPO_NAME%
start "" "https://vercel.com/new?repository=%USERNAME%/%REPO_NAME%"

REM 7. Build local para testar
echo [5/6] Testando build local...
npm run build

REM 8. Abrir preview local
echo [6/6] Abrindo preview local em http://localhost:4173
npx vite preview --port 4173

echo.
echo ========================================
echo ✅ PRONTO! Site Vercel: seu-projeto.vercel.app
echo ========================================
pause
