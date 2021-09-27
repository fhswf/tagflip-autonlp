from util.git import clone_or_pull_resolve_subdir, is_git_repo


def test_clone_sparse_subdirectory():
    url = 'https://github.com/fhswf/tagflip-backend.git'
    print(clone_or_pull_resolve_subdir(url, "./"))


def test_is_git_repo():
    assert is_git_repo("https://github.com/fhswf/tagflip-backend.git")
    assert not is_git_repo("https://www.fh-swf.de")
