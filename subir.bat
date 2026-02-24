@echo off
title 🚀 Deploy Agenda - Completo e Automatico
color 0A

:: Auto-elevar
whoami /groups | find "S-1-16-12288" >nul
if not %errorlevel%==0 (
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================
echo    🚀 DEPLOY AGENDA VERCEL AUTOMÁTICO
echo ========================================
echo.

cd /d "C:\_sistemas2026\agenda"

REM 1. Config Git se nao existir
if not exist ".git" git init

REM 2. Ignorar arquivos problematicos
echo supabase/ >> .gitignore
echo dist/ >> .gitignore
echo node_modules/ >> .gitignore
echo .env >> .gitignore

REM Remover supabase do git (causa erro build)
rmdir /s /q supabase 2>nul
git rm -r --cached supabase 2>nul

set /p USERNAME="GitHub username: " 
set /p REPO="Nome repo (agenda): "

REM 3. Commit e push
echo.
echo [1/4] Commit + Push...
git config user.name "%USERNAME%"
git config user.email "jimmy.sena@gmail.com"
git add .
git commit -m "Deploy auto %date% %time%" || echo Arquivos ja commitados
git remote rm origin 2>nul
git remote add origin https://github.com/%USERNAME%/%REPO%.git
git branch -M main
git push -u origin main --force

REM 4. Abrir Vercel + Site
echo.
echo [2/4] Abrindo Vercel...
start "" "https://vercel.com/new?repository=%USERNAME%/%REPO%"
timeout /t 5 /nobreak >nul

echo [3/4] Build local teste...
npm run build

echo [4/4] Abrindo site!
start "" "http://localhost:4173"
npx vite preview --port 4173

echo.
echo ========================================
echo ✅ PRONTO! Site: agenda-orcin-pi.vercel.app
echo    Proximos push auto-atualizam!
echo ========================================
pause
