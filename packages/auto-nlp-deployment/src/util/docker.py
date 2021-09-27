import subprocess


def registry_login(registry: str, username: str, password: str):
    process = subprocess.run(['docker', 'login', registry, '--username', username, '--password-stdin'],
                             input=password.encode(), capture_output=True)
    return process.returncode == 0
