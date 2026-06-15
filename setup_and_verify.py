#!/usr/bin/env python3
"""
setup_and_verify.py
===================
Cross-platform setup checker and first-run helper.
Verifies prerequisites and installs dependencies.
Run once before collect_submissions.py.
"""

import os
import sys
import shutil
import subprocess
import platform

REQUIRED_PYTHON = (3, 10)
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

# Disable ANSI on Windows if not supported
if platform.system() == "Windows":
    try:
        import ctypes
        kernel32 = ctypes.windll.kernel32
        kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
    except Exception:
        GREEN = RED = YELLOW = RESET = BOLD = ""


def ok(msg):    print(f"{GREEN}  ✔ {msg}{RESET}")
def fail(msg):  print(f"{RED}  ✘ {msg}{RESET}")
def warn(msg):  print(f"{YELLOW}  ⚠ {msg}{RESET}")
def info(msg):  print(f"  {msg}")


def check_python():
    print(f"\n{BOLD}[1] Python version{RESET}")
    v = sys.version_info
    if (v.major, v.minor) >= REQUIRED_PYTHON:
        ok(f"Python {v.major}.{v.minor}.{v.micro}")
        return True
    else:
        fail(f"Python {v.major}.{v.minor} found — need ≥ {REQUIRED_PYTHON[0]}.{REQUIRED_PYTHON[1]}")
        return False


def check_git():
    print(f"\n{BOLD}[2] Git installation{RESET}")
    git_path = shutil.which("git")
    if not git_path:
        fail("git not found on PATH")
        info("Install: https://git-scm.com/downloads")
        return False
    result = subprocess.run(["git", "--version"], capture_output=True, text=True)
    ok(result.stdout.strip())
    return True


def check_token():
    print(f"\n{BOLD}[3] GITHUB_TOKEN environment variable{RESET}")
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        fail("GITHUB_TOKEN is NOT set")
        if platform.system() == "Windows":
            info('Set it with: $env:GITHUB_TOKEN = "ghp_..."  (PowerShell)')
            info('         or: set GITHUB_TOKEN=ghp_...       (cmd.exe)')
        else:
            info('Set it with: export GITHUB_TOKEN="ghp_..."')
        return False
    if token.startswith("ghp_") or token.startswith("github_pat_"):
        ok(f"Token found (starts with {token[:8]}…)")
    else:
        warn(f"Token found but format is unusual — double-check it")
    return True


def check_in_git_repo():
    print(f"\n{BOLD}[4] Current directory is a Git repository{RESET}")
    if os.path.isdir(".git"):
        ok(f"Found .git in {os.getcwd()}")
        return True
    else:
        fail("No .git directory here")
        info("Run: git clone https://github.com/sunny2kk9/Blockchain.git && cd Blockchain")
        return False


def install_dependencies():
    print(f"\n{BOLD}[5] Installing Python dependencies{RESET}")
    req = os.path.join(os.path.dirname(__file__), "requirements.txt")
    if not os.path.isfile(req):
        fail("requirements.txt not found")
        return False
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", "-r", req, "--quiet"],
        capture_output=False,
    )
    if result.returncode == 0:
        ok("All packages installed")
        return True
    else:
        fail("pip install failed — see output above")
        return False


def main():
    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}  GitHub Assignment Collector — Setup Verification{RESET}")
    print(f"{BOLD}  Platform: {platform.system()} {platform.release()}{RESET}")
    print(f"{BOLD}{'='*60}{RESET}")

    checks = [
        check_python(),
        check_git(),
        check_token(),
        check_in_git_repo(),
        install_dependencies(),
    ]

    print(f"\n{BOLD}{'='*60}{RESET}")
    if all(checks):
        print(f"{GREEN}{BOLD}  All checks passed! Run:{RESET}")
        print(f"{GREEN}  python collect_submissions.py{RESET}\n")
    else:
        failed = sum(1 for c in checks if not c)
        print(f"{RED}{BOLD}  {failed} check(s) failed. Fix the issues above, then re-run.{RESET}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
