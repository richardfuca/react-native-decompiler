# React Native Decompiler [ALPHA]

**DOES NOT SUPPORT ENCRYPTED/BINARY (FACEBOOK, INSTAGRAM) BUNDLES**

Decompiles React Native `index.android.bundle` JS files.

# Usage

1. Download
2. `npm i`
3. Build or use ts-node (your choice).

Example command: `node ./out/main.js -i index.android.bundle -o ./output`, `ts-node ./src/main.js -i index.android.bundle -o ./output`

Command params:
- `-i` (required) - the path to the import bundle
- `-o` (required) - the path to the output folder
- `-e` - a module ID, if specified will only decompile that module & it's dependencies. also creates cache file to speed up future load times (useful for developing new plugins)
- `-p` - performance monitoring flag, will print out runtime for each decompiler plugin
- `-v` - verbose flag, does not include debug logging (use `DEBUG=`react-native-decompiler:*` env flag for that)
- `--noEslint` - does not run ESLint after doing decompilation
- `--decompileIgnored` - decompile ignored modules (modules are generally ignored if they are flagged as an NPM module)
- `--agressiveCache` - skips some cache checks at the expense of possible cache desync

# Extending

The decompiler operates on a tagger -> editor -> decompiler system.

* Taggers - Manipulates the module metadata
* Editors - Manipulates the module lines (add, move, or remove). Editors should not edit the actual lines in a meaningful way.
* Decompilers - Manipulates the module code. Line edits that also require meaningful code/line edits should be placed as a decompiler.

To add a new plugin, add it into the represpective list.

The plugins are initialized per module, so any data you store in your plugins will only persist for the current module.

If your plugin needs to be run before or after other plugins, adjust the ordering in the list, or modify it's pass position.
