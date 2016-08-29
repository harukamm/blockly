# Functional Blockly
This Blockly can be used to build a block environment for a functional language.

Some features of this fork:
* Features custom connector shapes.
* Allows types to be polymorphic.
* Uses Hindley Milner type inference to determine the types of blocks.
* Changes the way local variables work. They can be instantiated by dragging
  them from the definining block.
* Allows custom using data types to be defined using algabraic data types, using
  sum and product blocks.
* Some support for first class functions.

A showcase of the this fork can be found at [CodeWorld
Blocks](https://code.world/blocks), which is a visual functional programming
environment, which generates CodeWorld programs that are run in the browser. 
CodeWorld uses Haskell, which is a pure functional programming language, no side-effects allowed !.

This fork uses further changes from the following users:

* [awmorph](https://github.com/awmorp) with [his Blockly
  fork](https://github.com/awmorp/blockly) which he uses for math
  expressions, this fork is extends the work from Sorin's fork (below).
* [slerner](https://github.com/slerner) with [his Blockly
  fork](https://github.com/UCSD-PL/typed-blockly) that
  supports better types and polymorphism.

# Blockly

Google's Blockly is a web-based, visual programming editor.  Users can drag
blocks together to build programs.  All code is free and open source.

**The project page is https://developers.google.com/blockly/**

![](https://developers.google.com/blockly/images/sample.png)
