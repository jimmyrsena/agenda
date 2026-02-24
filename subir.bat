@echo off
cd /d "C:\_sistemas2026\agenda"

REM Ignorar supabase local do build
echo node_modules/ > .gitignore
echo supabase/functions/ >> .gitignore
echo dist/ >> .gitignore
echo .env >> .gitignore

git add .
git commit -m "Fix deploy - ignore supabase local"
git push

echo ✅ Push feito! Novo deploy automatico em 30s
echo URL: https://agenda-orcin-pi.vercel.app/
start "" "https://vercel.com/jimmyrsena/agenda-orcin-pi"
start "" "https://agenda-orcin-pi.vercel.app/"
