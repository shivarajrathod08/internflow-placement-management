@echo off
set "MAVEN_HOME=%~dp0..\tools\apache-maven-3.9.9"
if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    "%MAVEN_HOME%\bin\mvn.cmd" %*
) else (
    mvn %*
)
