@echo off
REM Add API keys to .env file
REM Run this script to automatically add your API keys

echo Adding API keys to .env file...

REM Backup existing .env
copy .env .env.backup

REM Add Lens API Key
echo LENS_API_KEY=kbldgx3c3vP5PF7XKqhT3mUMuRLWyxkNKaVpZTD25QmJdoiipcHF >> .env

REM Add Semantic Scholar API Key
echo SEMANTIC_SCHOLAR_API_KEY=DK56EEYTvw6DysKouDxy75QzuQRNXZXJ7u0ZVlvg >> .env

echo.
echo ========================================
echo API Keys Added Successfully!
echo ========================================
echo.
echo Lens API Key: Added
echo Semantic Scholar API Key: Added
echo.
echo Backup saved to: .env.backup
echo ========================================

pause
