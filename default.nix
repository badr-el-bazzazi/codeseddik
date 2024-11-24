{ pkgs ? import <nixpkgs> {} }:

with pkgs;

stdenv.mkDerivation rec {
  pname = "code-seddik";  # Changed to match your project name
  version = "1.0.0";

  src = ./.;

  nativeBuildInputs = [
    makeWrapper
    nodejs_20  # Specifically using Node.js 20
    nodePackages_latest.npm  # Using latest npm
    nodePackages_latest.typescript  # Using latest typescript
    cargo
    rustc
    pkg-config
  ];

  buildInputs = [
    openssl
    gtk3
    webkitgtk
    librsvg
    libayatana-appindicator
  ];

  buildPhase = ''
    export HOME=$(mktemp -d)
    
    # Verify the project structure
    if [ ! -d "src" ]; then
      echo "Error: src directory not found!"
      exit 1
    fi
    
    if [ ! -d "src-tauri" ]; then
      echo "Error: src-tauri directory not found!"
      exit 1
    fi

    # Install npm dependencies
    npm ci  # Using ci instead of install for more reliable builds

    # Build the Vite + React frontend
    # Removed typecheck since it's part of your build script
    NODE_ENV=production npm run build

    # Build the Tauri app
    cd src-tauri
    CARGO_HOME=$(mktemp -d) cargo build --release --verbose
    cd ..
  '';

  installPhase = ''
    mkdir -p $out/bin
    mkdir -p $out/share/applications
    mkdir -p $out/share/icons/hicolor/128x128/apps

    # Copy the binary
    cp src-tauri/target/release/${pname} $out/bin/${pname}

    # Create desktop entry
    cat > $out/share/applications/${pname}.desktop << EOF
    [Desktop Entry]
    Name=Code Seddik
    Exec=$out/bin/${pname}
    Icon=${pname}
    Type=Application
    Categories=Development;
    StartupWMClass=${pname}
    EOF

    # Copy icon
    cp src-tauri/icons/128x128.png $out/share/icons/hicolor/128x128/apps/${pname}.png

    # Wrap binary with required libraries
    wrapProgram $out/bin/${pname} \
      --prefix LD_LIBRARY_PATH : "${lib.makeLibraryPath buildInputs}"
  '';

  # Environment variables for the build
  VITE_APP_VERSION = version;
  NODE_ENV = "production";

  # Prevent npm from trying to fetch dependencies during build
  npmFlags = ["--offline"];

  # Keep the node_modules directory for the build
  dontPrune = true;

  meta = with lib; {
    description = "A Tauri application built with Vite, React, and TypeScript";
    license = licenses.mit;
    platforms = platforms.linux;
  };
}
