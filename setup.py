from setuptools import setup, find_packages

setup(
    name="pyams_cad",
    version="0.1.4",
    author="Dhiabi.Fathi",
    author_email="dhiabi.fathi@gmail.com",
    description="Design and simulation of circuits and modeling of analog and mixed-signal electronic components using CAD systems.",
    long_description=open("README.md", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    license_file="LICENSE",
    url="https://pyams.sf.net/",
    packages=find_packages(),
    include_package_data=True, 
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Science/Research",
        "Intended Audience :: Developers",
        "Topic :: Scientific/Engineering :: Electronic Design Automation (EDA)",
        "License :: OSI Approved :: GNU General Public License v3 (GPLv3)",
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
    install_requires=['PyQt5','PyQtWebEngine'],
    keywords=[
        "simulation", "circuit", "electronics", "mixed-signal", 
        "analog", "EDA", "electronic modeling", "electrical engineering"
    ],
    project_urls={
        "Source": "https://github.com/d-fathi/pyams",
        "Documentation": "https://pyams.sf.net/doc",
        "Bug Tracker": "https://github.com/d-fathi/pyams/issues",
    }
)
