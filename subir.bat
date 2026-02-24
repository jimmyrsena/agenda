@echo off
cd /d "C:\_sistemas2026\agenda"
REM Remover supabase do git (causa erro build)
rmdir /s /q supabase 2>nul
git add .
git commit -m "Remove supabase local - fix deploy"
git push
echo ✅ Novo deploy em 30s. URL: https://agenda-orcin-pi.vercel.app/
