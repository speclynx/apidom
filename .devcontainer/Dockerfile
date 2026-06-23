ARG VARIANT="24-bookworm"
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

# Install 26.3.1 version of Node.js using nvm
ARG EXTRA_NODE_VERSION="26.3.1"
RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"
