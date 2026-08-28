' ==============================================================================
' University Course Tracker - 1-Click Auto-Update & Localhost Launcher
' ==============================================================================
' This script automatically:
'  1. Pulls the latest updates from your connected Git repository (git pull)
'  2. Silently boots the local server in the background without any cmd windows
'  3. Opens http://localhost:3000 automatically in your default browser
' ==============================================================================

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the absolute directory where this launch.vbs script is located
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)

' 1. Pull the latest updates from Git silently (hidden cmd window = 0, synchronous = True)
' If git is not installed or not configured, it fails gracefully without blocking the launcher
WshShell.Run "cmd /c cd /d """ & currentDir & """ && git pull", 0, True

' 2. Launch the local development server silently in the background
WshShell.Run "cmd /c cd /d """ & currentDir & """ && npm run dev", 0, False

' 3. Wait 2.5 seconds for the server to initialize
WScript.Sleep 2500

' 4. Open localhost in your default web browser
WshShell.Run "http://localhost:3000"
