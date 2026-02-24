@echo off
cd /d "C:\_sistemas2026\agenda"
git add .
git commit -m "Fix deploy $(date /t)"
git push
echo ✅ Push feito! Vercel atualiza automatico em 30s.
echo URL: https://agenda-orcin-pi.vercel.app
start "" "https://agenda-orcin-pi.vercel.app"
