#!/bin/bash

# Vérifiez si Homebrew est installé
if ! command -v brew &> /dev/null
then
    echo "Homebrew could not be found, installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Installer les dépendances nécessaires
brew install pkg-config cairo pango libpng jpeg giflib librsvg
