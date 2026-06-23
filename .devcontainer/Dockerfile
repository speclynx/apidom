ARG VARIANT="22-bookworm"
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:1-${VARIANT}

# Install 26.3.1 version of Node.js using nvm
ARG EXTRA_NODE_VERSION="26.3.1"
RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"
