REM Salve como fix.bat e execute
cd C:\_sistemas2026\agenda
git rm -r --cached supabase 2>nul
echo supabase/ >> .gitignore
git add .
git commit -m "Fix: remove supabase from build"
git push
