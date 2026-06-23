FROM node:26.3.1-bookworm

# use bash as default shell
SHELL ["/bin/bash", "-c"]

# setting CWD
WORKDIR /apidom
