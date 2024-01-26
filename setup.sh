#!/bin/bash

# Update and install necessary packages
apt-get update
apt-get install -y \
  curl \
  git \
  gnupg2 \
  jq \
  sudo \
  zsh

# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | bash
