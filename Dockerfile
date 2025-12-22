FROM node:24.10.0-bookworm

# use bash as default shell
SHELL ["/bin/bash", "-c"]

# setting CWD
WORKDIR /apidom
