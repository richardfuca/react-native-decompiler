# React Native Decompiler

Decompiles React Native `index.android.bundle`'s.

# Usage

`-i` accepts an input bundle, and `-o` accepts the folder where to output the decompiled files. Use `-e` with a module ID to only decompile that module & its dependencies.

When using `-e` flag, a cache file is also created to reduce loading times upon restarts (useful for development). This may increase the deompilating time on first run.

Use the `-p` flag to enable per plugin performance recording. Basic performance monitoring (per step) is always done.

# Extending

The decompiler operates on a tagger -> editor -> decompiler system.

* Taggers - Manipulates the module metadata
* Editors - Manipulates the module lines (add, move, or remove). Editors should not edit the actual lines in a meaningful way.
* Decompilers - Manipulates the module code. Line edits that also require meaningful code/line edits should be placed as a decompiler.

To add a new plugin, add it into the represpective list.

The plugins are initialized per module, so any data you store in your plugins will only persist for the current module.

If your plugin needs to be run before or after other plugins, adjust the ordering in the list, or modify it's pass position.