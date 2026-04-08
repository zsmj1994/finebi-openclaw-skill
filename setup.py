"""
PyPI package configuration for finebi-cli.

Install locally:
    pip install -e .

This makes the 'finebi-cli' command available in PATH.
"""

from setuptools import find_namespace_packages, setup

setup(
    name="finebi-cli",
    version="1.0.0",
    description="CLI harness for FineDC / Nuclear BI Platform",
    long_description=open("README.md").read() if __import__("os").path.exists("README.md") else "",
    long_description_content_type="text/markdown",
    author="cli-anything",
    url="https://github.com/cli-anything/cli-anything-nuclear",
    packages=find_namespace_packages(include=["cli_anything", "cli_anything.*"]),
    # cli_anything/ is a PEP 420 namespace package (no __init__.py)
    # cli_anything/nuclear/ is a sub-package (has __init__.py)
    # No package_dir needed – packages resolve relative to setup.py location
    install_requires=[
        "click>=8.0",
        "requests>=2.28",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0",
            "pytest-cov>=3.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "finebi-cli=cli_anything.nuclear.nuclear_cli:main",
        ],
    },
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: Console",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    keywords="cli finedc finebi bi business-intelligence automation",
)
