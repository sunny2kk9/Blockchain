#!/usr/bin/env python3
"""
GitHub Assignment Submission Collector
=======================================
Collects student assignment submissions from forked repositories,
organizes them into a submissions folder, and pushes to the main repo.

Author: DevOps Automation Engineer
Version: 1.0.0
"""

import os
import sys
import time
import shutil
import logging
import tempfile
import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Optional

import git
import requests
from github import Github, GithubException
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

# ─────────────────────────────────────────────
# CONFIGURATION — edit these or override via CLI
# ─────────────────────────────────────────────
CONFIG = {
    "REPO_OWNER": "sunny2kk9",
    "REPO_NAME": "Blockchain",
    "ASSIGNMENT_BRANCH": "assignment3",          # branch name in student forks
    "SUBMISSIONS_FOLDER": "submissions",         # destination folder in main repo
    "CLONE_TIMEOUT": 120,                        # seconds before clone is aborted
    "MAX_RETRIES": 3,
    "RETRY_WAIT_MIN": 2,
    "RETRY_WAIT_MAX": 10,
    "LOG_LEVEL": "INFO",
    "REPORT_FILE": "submission_report.json",
}

# ─────────────────────────────────────────────
# LOGGING SETUP
# ─────────────────────────────────────────────
def setup_logging(log_level: str = "INFO") -> logging.Logger:
    level = getattr(logging, log_level.upper(), logging.INFO)
    fmt = "%(asctime)s [%(levelname)8s] %(message)s"
    logging.basicConfig(
        level=level,
        format=fmt,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("collector.log", encoding="utf-8"),
        ],
    )
    return logging.getLogger("collector")


log = setup_logging(CONFIG["LOG_LEVEL"])


# ─────────────────────────────────────────────
# GITHUB API HELPERS (with retry logic)
# ─────────────────────────────────────────────
@retry(
    stop=stop_after_attempt(CONFIG["MAX_RETRIES"]),
    wait=wait_exponential(
        multiplier=1,
        min=CONFIG["RETRY_WAIT_MIN"],
        max=CONFIG["RETRY_WAIT_MAX"],
    ),
    retry=retry_if_exception_type((requests.exceptions.ConnectionError,
                                   requests.exceptions.Timeout,
                                   GithubException)),
    reraise=True,
)
def get_forks(gh: Github, full_name: str) -> list:
    """Fetch all forks of a repository with retry logic."""
    repo = gh.get_repo(full_name)
    forks = list(repo.get_forks())
    log.info(f"Found {len(forks)} fork(s) for {full_name}")
    return forks


@retry(
    stop=stop_after_attempt(CONFIG["MAX_RETRIES"]),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(GithubException),
    reraise=True,
)
def branch_exists(repo, branch_name: str) -> bool:
    """Check if a branch exists in a repository."""
    try:
        repo.get_branch(branch_name)
        return True
    except GithubException as e:
        if e.status == 404:
            return False
        raise


# ─────────────────────────────────────────────
# GIT OPERATIONS
# ─────────────────────────────────────────────
def clone_repo(clone_url: str, dest: Path, branch: str, token: str) -> Optional[git.Repo]:
    """
    Clone a repository and checkout the specified branch.
    Injects the token into the URL for authenticated cloning.
    """
    # Inject token into HTTPS URL: https://<token>@github.com/owner/repo.git
    auth_url = clone_url.replace("https://", f"https://{token}@")
    try:
        log.debug(f"  Cloning {clone_url} → {dest}")
        cloned = git.Repo.clone_from(
            auth_url,
            str(dest),
            branch=branch,
            depth=1,                   # shallow clone to save bandwidth
            single_branch=True,
        )
        log.debug(f"  Checkout {branch} ✓")
        return cloned
    except git.exc.GitCommandError as e:
        log.error(f"  Git error while cloning: {e}")
        return None
    except Exception as e:
        log.error(f"  Unexpected error during clone: {e}")
        return None


def copy_files(src: Path, dst: Path) -> list[str]:
    """
    Copy all files from src into dst.
    Returns list of relative paths of copied files.
    Skips .git directories. Handles duplicates by not overwriting.
    """
    dst.mkdir(parents=True, exist_ok=True)
    copied = []

    for item in src.rglob("*"):
        # Skip .git internals
        if ".git" in item.parts:
            continue
        rel = item.relative_to(src)
        target = dst / rel

        if item.is_dir():
            target.mkdir(parents=True, exist_ok=True)
            continue

        if target.exists():
            log.warning(f"    SKIP (exists): {rel}")
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(str(item), str(target))
            copied.append(str(rel))
            log.debug(f"    Copied: {rel}")

    return copied


# ─────────────────────────────────────────────
# MAIN REPO GIT OPERATIONS
# ─────────────────────────────────────────────
def commit_and_push(main_repo_path: Path, token: str, owner: str, repo_name: str) -> bool:
    """Stage, commit, and push all changes in the main repository."""
    try:
        repo = git.Repo(str(main_repo_path))

        # Stage everything under submissions/
        repo.git.add(A=True)

        status = repo.git.status("--short")
        if not status.strip():
            log.info("Nothing new to commit — working tree clean.")
            return True

        log.info("Staged changes:\n" + status)

        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
        commit_msg = (
            f"chore: import Assignment 3 submissions [{timestamp}]\n\n"
            "Automated collection via collect_submissions.py"
        )
        repo.index.commit(commit_msg)
        log.info("Committed ✓")

        # Push — set remote URL with token
        remote_url = f"https://{token}@github.com/{owner}/{repo_name}.git"
        origin = repo.remote("origin")
        origin.set_url(remote_url)
        origin.push()
        log.info("Pushed to origin ✓")
        return True

    except git.exc.GitCommandError as e:
        log.error(f"Git commit/push failed: {e}")
        return False
    except Exception as e:
        log.error(f"Unexpected error during commit/push: {e}")
        return False


# ─────────────────────────────────────────────
# REPORT GENERATION
# ─────────────────────────────────────────────
def generate_report(results: list[dict], report_path: Path) -> None:
    """Write a JSON summary report and a human-readable text report."""
    summary = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total_forks": len(results),
        "branch_found": sum(1 for r in results if r["branch_found"]),
        "branch_not_found": sum(1 for r in results if not r["branch_found"]),
        "total_files_copied": sum(len(r["files_copied"]) for r in results),
        "students": results,
    }

    # JSON report
    json_path = report_path.with_suffix(".json")
    json_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    log.info(f"JSON report → {json_path}")

    # Human-readable text report
    txt_path = report_path.with_suffix(".txt")
    lines = [
        "=" * 72,
        " ASSIGNMENT 3 — SUBMISSION COLLECTION REPORT",
        f" Generated: {summary['generated_at']}",
        "=" * 72,
        f" Total forks scanned : {summary['total_forks']}",
        f" Branch found        : {summary['branch_found']}",
        f" Branch not found    : {summary['branch_not_found']}",
        f" Total files copied  : {summary['total_files_copied']}",
        "=" * 72,
        "",
    ]

    for student in results:
        lines.append(f"┌─ {student['username']}")
        lines.append(f"│  Repo URL    : {student['repo_url']}")
        lines.append(f"│  Branch      : {'✔ FOUND' if student['branch_found'] else '✘ NOT FOUND'}")
        lines.append(f"│  Files copied: {len(student['files_copied'])}")
        if student["files_copied"]:
            for f in student["files_copied"][:10]:
                lines.append(f"│    • {f}")
            if len(student["files_copied"]) > 10:
                lines.append(f"│    … and {len(student['files_copied']) - 10} more")
        if student["errors"]:
            lines.append(f"│  ⚠ Errors:")
            for err in student["errors"]:
                lines.append(f"│    - {err}")
        lines.append("│")

    lines.append("=" * 72)

    txt_path.write_text("\n".join(lines), encoding="utf-8")
    log.info(f"Text report  → {txt_path}")

    # Also print to stdout
    print("\n" + "\n".join(lines))


# ─────────────────────────────────────────────
# CORE WORKFLOW
# ─────────────────────────────────────────────
def run(config: dict) -> None:
    # 1. Read token from environment
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        log.critical("GITHUB_TOKEN environment variable not set. Aborting.")
        sys.exit(1)

    owner          = config["REPO_OWNER"]
    repo_name      = config["REPO_NAME"]
    assignment_br  = config["ASSIGNMENT_BRANCH"]
    submissions_dir = config["SUBMISSIONS_FOLDER"]
    report_file    = config["REPORT_FILE"]

    full_name = f"{owner}/{repo_name}"
    log.info(f"Starting collection for {full_name} | branch: {assignment_br}")

    # 2. Connect to GitHub
    gh = Github(token)
    try:
        me = gh.get_user()
        log.info(f"Authenticated as: {me.login}")
    except GithubException as e:
        log.critical(f"GitHub authentication failed: {e}")
        sys.exit(1)

    # 3. Locate main repo on disk (must already be cloned)
    main_repo_path = Path.cwd()
    if not (main_repo_path / ".git").exists():
        log.critical(
            "Current directory is not a Git repository. "
            "Please run this script from inside your cloned main repository."
        )
        sys.exit(1)

    submissions_path = main_repo_path / submissions_dir
    submissions_path.mkdir(parents=True, exist_ok=True)
    log.info(f"Submissions will be written to: {submissions_path}")

    # 4. Fetch all forks
    try:
        forks = get_forks(gh, full_name)
    except Exception as e:
        log.critical(f"Could not fetch forks: {e}")
        sys.exit(1)

    if not forks:
        log.warning("No forks found. Nothing to do.")
        return

    results = []

    # 5. Process each fork
    with tempfile.TemporaryDirectory(prefix="gh_collect_") as tmpdir:
        for fork in forks:
            username = fork.owner.login
            repo_url = fork.html_url
            clone_url = fork.clone_url
            result = {
                "username": username,
                "repo_url": repo_url,
                "branch_found": False,
                "files_copied": [],
                "errors": [],
            }

            log.info(f"\n{'─'*60}")
            log.info(f"Processing fork: {username} — {repo_url}")

            # 5a. Check branch existence
            try:
                found = branch_exists(fork, assignment_br)
            except Exception as e:
                msg = f"Could not check branch: {e}"
                log.warning(f"  {msg}")
                result["errors"].append(msg)
                results.append(result)
                continue

            if not found:
                log.info(f"  Branch '{assignment_br}' NOT FOUND — skipping")
                results.append(result)
                continue

            result["branch_found"] = True
            log.info(f"  Branch '{assignment_br}' found ✓")

            # 5b. Clone the fork
            clone_dest = Path(tmpdir) / username
            cloned_repo = clone_repo(clone_url, clone_dest, assignment_br, token)
            if cloned_repo is None:
                msg = "Clone failed"
                result["errors"].append(msg)
                results.append(result)
                continue

            # 5c. Copy files → submissions/<username>/
            student_dest = submissions_path / username
            try:
                copied = copy_files(clone_dest, student_dest)
                result["files_copied"] = copied
                log.info(f"  Copied {len(copied)} file(s) → {student_dest}")
            except Exception as e:
                msg = f"File copy error: {e}"
                log.error(f"  {msg}")
                result["errors"].append(msg)

            results.append(result)

    log.info(f"\n{'═'*60}")
    log.info(f"Collection complete. Processed {len(results)} fork(s).")

    # 6. Generate report
    report_path = main_repo_path / report_file
    generate_report(results, report_path)

    # 7. Commit and push
    log.info("\nCommitting and pushing to main repository…")
    success = commit_and_push(main_repo_path, token, owner, repo_name)
    if success:
        log.info("All done! ✓")
    else:
        log.error("Commit/push failed. Check logs above.")
        sys.exit(1)


# ─────────────────────────────────────────────
# CLI ENTRYPOINT
# ─────────────────────────────────────────────
def parse_args():
    parser = argparse.ArgumentParser(
        description="Collect GitHub assignment submissions from forks."
    )
    parser.add_argument("--owner",      default=CONFIG["REPO_OWNER"],
                        help="GitHub username / org owning the main repo")
    parser.add_argument("--repo",       default=CONFIG["REPO_NAME"],
                        help="Main repository name")
    parser.add_argument("--branch",     default=CONFIG["ASSIGNMENT_BRANCH"],
                        help="Assignment branch name to look for in forks")
    parser.add_argument("--dest",       default=CONFIG["SUBMISSIONS_FOLDER"],
                        help="Destination folder name inside main repo")
    parser.add_argument("--report",     default=CONFIG["REPORT_FILE"],
                        help="Output report file (without extension)")
    parser.add_argument("--log-level",  default=CONFIG["LOG_LEVEL"],
                        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
                        help="Logging verbosity")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    CONFIG.update({
        "REPO_OWNER":        args.owner,
        "REPO_NAME":         args.repo,
        "ASSIGNMENT_BRANCH": args.branch,
        "SUBMISSIONS_FOLDER": args.dest,
        "REPORT_FILE":       args.report,
        "LOG_LEVEL":         args.log_level,
    })
    # Re-apply log level after args parsed
    logging.getLogger().setLevel(getattr(logging, args.log_level.upper(), logging.INFO))
    run(CONFIG)
