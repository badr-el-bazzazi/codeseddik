{ lib
, stdenv
, makeWrapper
, nodejs
, nodePackages
, rustPlatform
, pkg-config
, openssl
, gtk3
, webkitgtk
, librsvg
, libayatana-appindicator
, shared-mime-info
, glib-networking
}:

let
  pname = "Code-Seddik";
  version = "0.1.0";
in
rustPlatform.buildRustPackage {
  inherit pname version;
  
  src = ./.;

  cargoLock = {
    lockFile = ./src-tauri/Cargo.lock;
  };

  buildAndTestSubdir = "src-tauri";

  # Include required dependencies for Node.js and TypeScript
  nativeBuildInputs = [
    pkg-config
    nodejs
    nodePackages.npm
    nodePackages.typescript # Add TypeScript explicitly
    makeWrapper
  ];

  buildInputs = [
    openssl
    gtk3
    webkitgtk
    librsvg
    libayatana-appindicator
    shared-mime-info
    glib-networking
  ];

  preBuild = ''
    export HOME=$(mktemp -d)
    export PATH=$PATH:$(pwd)/node_modules/.bin
    cd src-tauri
    npm install --production=false --force
    ln -s $(which tsc) ./node_modules/.bin/tsc # Link system-installed TypeScript
    npm run build
    cd $sourceRoot
  '';

  postInstall = ''
    wrapProgram $out/bin/${pname} \
      --prefix GIO_EXTRA_MODULES : "${glib-networking}/lib/gio/modules" \
      --prefix XDG_DATA_DIRS : "${gtk3}/share" \
      --prefix XDG_DATA_DIRS : "${shared-mime-info}/share"
  '';

  meta = with lib; {
    description = "Your Tauri application description";
    homepage = "https://github.com/badr-el-bazzazi";
    license = licenses.mit;
    maintainers = with maintainers; [ "Badr El-Bazzazi" ];
    platforms = platforms.linux;
  };
}
