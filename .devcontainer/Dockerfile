ARG VARIANT="24-bookworm"
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:1-${VARIANT}

# Install 24.10.0 version of Node.js using nvm
ARG EXTRA_NODE_VERSION="24.10.0"
RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"
