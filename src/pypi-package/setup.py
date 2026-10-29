from pathlib import Path

from setuptools import setup, find_packages

HERE = Path(__file__).parent
long_description = (HERE / "README.md").read_text(encoding="utf-8")

setup(
    name="pyams_lib",
    version="0.3.0",
    author="Dhiabi.Fathi",
    author_email="dhiabi.fathi@gmail.com",
    maintainer="Dhiabi.Fathi",
    description="Simulation modeling of analog, digital and mixed-signal electronic elements and circuits",
    long_description=long_description,
    long_description_content_type="text/markdown",
    license="MIT",
    license_files=["LICENSE"],
    url="https://github.com/d-fathi/pyams_lib",
    packages=find_packages(include=["pyams", "pyams.*"]),
    include_package_data=True,
    python_requires=">=3.8",
    install_requires=[
        "numpy>=1.20",
        "matplotlib>=3.3",
    ],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Science/Research",
        "Intended Audience :: Developers",
        "Intended Audience :: Education",
        "Topic :: Scientific/Engineering",
        "Topic :: Scientific/Engineering :: Electronic Design Automation (EDA)",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Operating System :: OS Independent",
    ],
    keywords=[
        "simulation", "circuit", "electronics", "mixed-signal",
        "analog", "EDA", "electronic modeling", "electrical engineering",
        "SPICE", "Verilog-AMS",
    ],
    project_urls={
        "Website": "https://pyams.sf.net",
        "Source": "https://github.com/d-fathi/pyams_lib",
        "Documentation": "https://pyams-lib.readthedocs.io/",
        "Bug Tracker": "https://github.com/d-fathi/pyams_lib/issues",
        "Support": "https://github.com/d-fathi/pyams_lib/discussions",
        "Donate": "https://ko-fi.com/pyams",
    },
)
