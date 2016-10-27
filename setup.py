from setuptools import setup

setup(
    name = "Budget",
    version = "0.1",
    description = "Personal budgeting application",
    url = "http://github.com/felamaslen/budget",
    author = "Fela Maslen",
    author_email = "felamaslen@gmail.com",
    license = "MIT",
    packages = ['budget'],
    install_requires = [
        'flask',
    ],
    zip_safe = False
)
