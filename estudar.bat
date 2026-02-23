@echo off
:: Auto-elevar para Administrador
whoami /groups | find "S-1-16-12288" >nul
if not %errorlevel%==0 (
    echo Solicitando permissao de administrador...
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

REM Ir para a pasta do projeto
cd /d "C:\_sistemas2026\agenda"

REM Subir o servidor (Vite) em um terminal
start "Vite Dev" cmd /k "npm run dev"

REM Esperar o servidor subir
timeout /t 8 /nobreak >nul

REM Abrir o navegador na porta correta (8080)
start "" "http://localhost:8080"

exit
