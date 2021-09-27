import asyncio
import functools
import os
import urllib.parse
from urllib.parse import urlparse

import git
from git import GitCommandError, Repo


def get_git_base_url(any_where_in_git_url):
    if "${GITHUB_TOKEN}" in any_where_in_git_url:
        any_where_in_git_url = any_where_in_git_url.replace("${GITHUB_TOKEN}", os.getenv("GITHUB_TOKEN"))
    parsed_url = urlparse(any_where_in_git_url)
    repo_name, _ = parsed_url.path.split("@") if "@" in parsed_url.path else (parsed_url.path, None)
    url = urllib.parse.urlunsplit((parsed_url.scheme, parsed_url.netloc, repo_name, parsed_url.query, ""))
    return url


def clone_or_pull(git_url, target_dir):
    if "${GITHUB_TOKEN}" in git_url:
        git_url = git_url.replace("${GITHUB_TOKEN}", os.getenv("GITHUB_TOKEN"))
    parsed_url = urlparse(git_url)
    repo_name, branch = parsed_url.path.split("@") if "@" in parsed_url.path else (parsed_url.path, None)
    target_dir = os.path.join(target_dir, repo_name[1:])
    if not os.path.exists(target_dir):
        url = urllib.parse.urlunsplit((parsed_url.scheme, parsed_url.netloc, repo_name, parsed_url.query, ""))
        Repo.clone_from(url, target_dir, branch=branch, depth=1, filter="blob:none")
        # Repo.clone_from(url, target_dir,
        #                 branch=branch, depth=1, filter="blob:none")
    else:
        repo = Repo(target_dir)
        repo.remotes.origin.pull()
    return target_dir


def clone_or_pull_resolve_subdir(git_url, target_dir):
    if "${GITHUB_TOKEN}" in git_url:
        git_url = git_url.replace("${GITHUB_TOKEN}", os.getenv("GITHUB_TOKEN"))
    clone_dir = clone_or_pull(git_url, target_dir)
    parsed_url = urlparse(git_url)
    subdirectory = parsed_url.fragment.replace("subdirectory=", "./") if parsed_url.fragment else ""

    return os.path.abspath(os.path.join(clone_dir, subdirectory))


def is_git_repo(url):
    try:
        git_url = get_git_base_url(url)
        if "${GITHUB_TOKEN}" in git_url:
            git_url = url.replace("${GITHUB_TOKEN}", os.getenv("GITHUB_TOKEN"))
        git.Git().execute(["git", "ls-remote", f"{git_url}"])
        return True
    except GitCommandError:
        return False
