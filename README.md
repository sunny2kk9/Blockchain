# 📦 GitHub Assignment Submission Collector

Automates the collection of student assignment submissions from **forked GitHub repositories** into a single, organized `submissions/` folder, then commits and pushes everything back to your main repository.

---

## 📁 Project Structure

```
github_assignment_collector/
├── collect_submissions.py   # ← Main automation script
├── requirements.txt         # Python dependencies
├── README.md                # This file
└── (generated at runtime)
    ├── collector.log            # Full run log
    ├── submission_report.json   # Machine-readable report
    └── submission_report.txt    # Human-readable report
```

After running, your **main repository** will gain:

```
submissions/
├── student_alice/
│   ├── contract.sol
│   └── README.md
├── student_bob/
│   └── assignment3.py
└── ...
submission_report.json
submission_report.txt
```

---

## ⚙️ Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | ≥ 3.10 | [python.org](https://python.org) |
| Git | ≥ 2.30 | Must be on your `PATH` |
| GitHub PAT | Classic or Fine-Grained | Needs `repo` + `read:org` scopes |

---

## 🚀 Installation

### Step 1 — Clone your main repository

```bash
# Replace with your actual details
git clone https://github.com/sunny2kk9/Blockchain.git
cd Blockchain
```

### Step 2 — Copy the collector script into the repo

```bash
# From the downloaded release or cloned tool repo:
cp /path/to/collect_submissions.py .
cp /path/to/requirements.txt .
```

### Step 3 — Create and activate a virtual environment

**Ubuntu / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows 10 (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

> If you see a PowerShell execution-policy error, run:
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Step 4 — Install dependencies

```bash
pip install -r requirements.txt
```

### Step 5 — Set your GitHub Token

**Ubuntu / macOS:**
```bash
export GITHUB_TOKEN="ghp_yourTokenHere"
```

**Windows 10 (PowerShell):**
```powershell
$env:GITHUB_TOKEN = "ghp_yourTokenHere"
```

**Windows 10 (Command Prompt):**
```cmd
set GITHUB_TOKEN=ghp_yourTokenHere
```

> ⚠️ **Never hardcode your token** in any file or commit it to Git.

---

## 🎯 Usage

### Basic run (uses defaults from CONFIG in the script)

```bash
python collect_submissions.py
```

### Fully parameterized run

```bash
python collect_submissions.py \
  --owner sunny2kk9 \
  --repo Blockchain \
  --branch assignment3 \
  --dest submissions \
  --report submission_report \
  --log-level INFO
```

### Windows equivalent

```powershell
python collect_submissions.py `
  --owner sunny2kk9 `
  --repo Blockchain `
  --branch assignment3 `
  --dest submissions `
  --report submission_report `
  --log-level INFO
```

### All CLI flags

| Flag | Default | Description |
|------|---------|-------------|
| `--owner` | `sunny2kk9` | GitHub user/org owning the main repo |
| `--repo` | `Blockchain` | Main repository name |
| `--branch` | `assignment3` | Branch name to look for in each fork |
| `--dest` | `submissions` | Destination folder inside the main repo |
| `--report` | `submission_report` | Base name for the report files |
| `--log-level` | `INFO` | `DEBUG` / `INFO` / `WARNING` / `ERROR` |

---

## 📋 Sample Output

### Terminal output

```
2024-11-15 10:23:01 [    INFO] Authenticated as: sunny2kk9
2024-11-15 10:23:02 [    INFO] Found 4 fork(s) for sunny2kk9/Blockchain
2024-11-15 10:23:02 [    INFO] ────────────────────────────────────────────────────
2024-11-15 10:23:02 [    INFO] Processing fork: alice_dev — https://github.com/alice_dev/Blockchain
2024-11-15 10:23:04 [    INFO]   Branch 'assignment3' found ✓
2024-11-15 10:23:07 [    INFO]   Copied 5 file(s) → submissions/alice_dev
2024-11-15 10:23:07 [    INFO] ────────────────────────────────────────────────────
2024-11-15 10:23:07 [    INFO] Processing fork: bob_coder — https://github.com/bob_coder/Blockchain
2024-11-15 10:23:08 [    INFO]   Branch 'assignment3' NOT FOUND — skipping
2024-11-15 10:23:08 [    INFO] ────────────────────────────────────────────────────
2024-11-15 10:23:08 [    INFO] Processing fork: carol_dev — https://github.com/carol_dev/Blockchain
2024-11-15 10:23:09 [    INFO]   Branch 'assignment3' found ✓
2024-11-15 10:23:13 [    INFO]   Copied 3 file(s) → submissions/carol_dev
2024-11-15 10:23:14 [    INFO] Committed ✓
2024-11-15 10:23:16 [    INFO] Pushed to origin ✓
2024-11-15 10:23:16 [    INFO] All done! ✓
```

### submission_report.txt

```
════════════════════════════════════════════════════════════════════════
 ASSIGNMENT 3 — SUBMISSION COLLECTION REPORT
 Generated: 2024-11-15T10:23:14Z
════════════════════════════════════════════════════════════════════════
 Total forks scanned : 4
 Branch found        : 3
 Branch not found    : 1
 Total files copied  : 8
════════════════════════════════════════════════════════════════════════

┌─ alice_dev
│  Repo URL    : https://github.com/alice_dev/Blockchain
│  Branch      : ✔ FOUND
│  Files copied: 5
│    • contract.sol
│    • deploy.js
│    • test/contract.test.js
│    • README.md
│    • hardhat.config.js
│

┌─ bob_coder
│  Repo URL    : https://github.com/bob_coder/Blockchain
│  Branch      : ✘ NOT FOUND
│  Files copied: 0
│

┌─ carol_dev
│  Repo URL    : https://github.com/carol_dev/Blockchain
│  Branch      : ✔ FOUND
│  Files copied: 3
│    • Assignment3.sol
│    • migrations/1_deploy.js
│    • README.md
│

════════════════════════════════════════════════════════════════════════
```

---

## 🔒 Security Notes

1. **Revoke any exposed token immediately** at https://github.com/settings/tokens
2. Always use environment variables for secrets — never commit tokens.
3. Add `.env` and `venv/` to your `.gitignore`.
4. The script injects the token into clone URLs in memory only; it is never written to disk.

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| `GITHUB_TOKEN not set` | Run `export GITHUB_TOKEN=...` before the script |
| `Not a git repository` | Run script from inside your cloned repo directory |
| `403 Forbidden` on clone | Token needs `repo` scope; regenerate at GitHub settings |
| `Rate limit exceeded` | Wait ~1 hour or use a token with higher rate limits |
| Clone hangs | Reduce `CLONE_TIMEOUT` or check network; shallow clones require Git ≥ 2.17 |
| PowerShell script blocked | `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |

---

## 📄 License

MIT — free to use and modify for educational purposes.
