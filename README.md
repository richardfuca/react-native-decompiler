# React Native Decompiler

Decompiles React Native `index.android.bundle`'s.

# Usage

`-i` accepts an input bundle, and `-o` accepts the folder where to output the decompiled files. Use `-e` with a module ID to only decompile that module & its dependencies.

# Extending

The decompiler operates on a tagger & decompiler system. The taggers generally modify the metadata of the modules, and the decompilers modify the code.

The taggers run first, then the decompilers.

To add taggers or decompilers, add the class into the represpective list. For decompilers, you will need to put it in the Node type that it parses.

If you are making a decompiler that works on a Node type not parsed before, you'll need to add it to `main.ts`.