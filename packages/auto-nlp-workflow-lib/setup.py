import sys

from shutil import rmtree

import io
import os
from setuptools import setup, find_packages, Command
import json

# Read package JSON file
with open("package.json") as f:
    packageJson = json.load(f)

NAME = "tagflip-" + packageJson["name"]
DESCRIPTION = packageJson["description"]
AUTHOR = packageJson["author"]
REQUIRES_PYTHON = ">=3.8.5,<4.0"
VERSION = packageJson["version"]
LICENSE = packageJson["license"]

here = os.path.abspath(os.path.dirname(__file__))

# Import the README and use it as the long-description.
# Note: this will only work if 'README.md' is present in your MANIFEST.in file!
try:
    with io.open(os.path.join(here, "README.md"), encoding="utf-8") as f:
        long_description = "\n" + f.read()
except FileNotFoundError:
    long_description = DESCRIPTION


class UploadCommand(Command):
    """Support setup.py upload."""

    description = "Build and publish the package."
    user_options = []

    @staticmethod
    def status(s):
        """Prints things in bold."""
        print("\033[1m{0}\033[0m".format(s))

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        try:
            self.status("Removing previous builds…")
            rmtree(os.path.join(here, "dist"))
        except OSError:
            pass

        self.status("Building Source and Wheel (universal) distribution…")
        os.system(
            "{0} setup.py sdist bdist_wheel --universal".format(sys.executable))

        self.status("Uploading the package to PyPI via Twine…")
        os.system("twine upload dist/*")

        self.status("Pushing git tags…")
        os.system("git tag v{0}".format(VERSION))
        os.system("git push --tags")

        sys.exit()


# Where the magic happens:
setup(
    name="tagflip",
    version=VERSION,
    description=DESCRIPTION,
    long_description=long_description,
    long_description_content_type="text/markdown",
    author=AUTHOR,
    python_requires=REQUIRES_PYTHON,
    package_dir={"": "src"},
    packages=find_packages(
        include=["tagflip", "tagflip.*"],
        exclude=["tests", "*.tests", "*.tests.*", "tests.*"],
    ),
    # If your package is a single module, use this instead of 'packages':
    # py_modules=['mypackage'],
    # entry_points={
    #     'console_scripts': ['mycli=mymodule:cli'],
    # },
    install_requires=[
        "alembic==1.4.1; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3'",
        "attrs==21.2.0; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3, 3.4'",
        "boto3==1.17.109",
        "botocore==1.20.109; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3, 3.4, 3.5'",
        "certifi==2021.5.30",
        "chardet==4.0.0; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3, 3.4'",
        "click==8.0.1; python_version >= '3.6'",
        "cliff==3.8.0; python_version >= '3.6'",
        "cloudpickle==1.6.0; python_version >= '3.5'",
        "cmaes==0.8.2; python_version >= '3.6'",
        "cmd2==2.1.2; python_version >= '3.6'",
        "colorama==0.4.4; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3, 3.4'",
        "colorlog==5.0.1",
        "databricks-cli==0.14.3",
        "datasets==1.18.3",
        "dill==0.3.4; python_version >= '2.7' and python_version != '3.0'",
        "docker==5.0.0; python_version >= '3.6'",
        "entrypoints==0.3; python_version >= '2.7'",
        "filelock==3.0.12",
        "flask==2.0.1; python_version >= '3.6'",
        "fsspec==2021.6.1; python_version >= '3.6'",
        "gitdb==4.0.7; python_version >= '3.4'",
        "gitpython==3.1.18; python_version >= '3.6'",
        "greenlet==1.1.0; python_version >= '3'",
        "gunicorn==20.1.0; platform_system != 'Windows'",
        "huggingface-hub==0.4.0; python_version >= '3.6'",
        "idna==2.10; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3'",
        "itsdangerous==2.0.1; python_version >= '3.6'",
        "jinja2==3.0.1; python_version >= '3.6'",
        "jmespath==0.10.0; python_version >= '2.6' and python_version not in '3.0, 3.1, 3.2, 3.3'",
        "joblib==1.0.1; python_version >= '3.6'",
        "mako==1.1.4; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3'",
        "markupsafe==2.0.1; python_version >= '3.6'",
        "mlflow==1.24.0",
        "multiprocess==0.70.12.2",
        "numpy==1.21.0; python_version >= '3.7'",
        "optuna==2.8.0",
        "packaging==21.0",
        "pandas==1.3.0; python_full_version >= '3.7.1'",
        "pbr==5.6.0; python_version >= '2.6'",
        "pillow==9.0.1; python_version >= '3.6'",
        "prettytable==2.1.0; python_version >= '3.6'",
        "prometheus-client==0.11.0; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3'",
        "prometheus-flask-exporter==0.18.2",
        "protobuf==3.17.3",
        "pyarrow==4.0.1; python_version >= '3.6'",
        "pydantic==1.8.2",
        "pyparsing==2.4.7; python_version >= '2.6' and python_version not in '3.0, 3.1, 3.2, 3.3'",
        "pyperclip==1.8.2",
        "python-dateutil==2.8.1; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3'",
        "python-editor==1.0.4",
        "pytz==2021.1",
        "pyyaml==5.4.1; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3, 3.4, 3.5'",
        "querystring-parser==1.2.4",
        "regex==2021.7.6",
        "requests==2.25.1; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3, 3.4'",
        "requests-cache==0.7.1",
        "s3transfer==0.4.2",
        "sacremoses==0.0.45",
        "scikit-learn==0.24.2; python_version >= '3.6'",
        "scipy==1.7.0; python_version < '3.10' and python_version >= '3.7'",
        "seqeval==1.2.2",
        "six==1.16.0; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3'",
        "smmap==4.0.0; python_version >= '3.5'",
        "sqlalchemy==1.4.20; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3, 3.4, 3.5'",
        "sqlparse==0.4.2; python_version >= '3.5'",
        "stevedore==3.3.0; python_version >= '3.6'",
        "tabulate==0.8.9",
        "threadpoolctl==2.2.0; python_version >= '3.6'",
        "tokenizers==0.11.6",
        "torch==1.11.0",
        "torchvision==0.9.1",
        "tqdm==4.63.0; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3'",
        "transformers==4.17.0",
        "typing-extensions==3.10.0.0; python_version < '3.9'",
        "typingx==0.5.3",
        "url-normalize==1.4.3; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3, 3.4, 3.5'",
        "urllib3==1.26.6; python_version >= '2.7' and python_version not in '3.0, 3.1, 3.2, 3.3, 3.4' and python_version < '4'",
        "wcwidth==0.2.5",
        "websocket-client==1.1.0; python_version >= '3.6'",
        "werkzeug==2.0.1; python_version >= '3.6'",
        "xxhash==2.0.2; python_version >= '2.6' and python_version not in '3.0, 3.1, 3.2, 3.3'",
    ],
    extras_require={},
    include_package_data=True,
    license=LICENSE,
    classifiers=[
        # Trove classifiers
        # Full list: https://pypi.python.org/pypi?%3Aaction=list_classifiers
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: Implementation :: CPython",
        "Programming Language :: Python :: Implementation :: PyPy",
    ],
    # $ setup.py publish support.
    cmdclass={"upload": UploadCommand, },
)
