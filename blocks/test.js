/*
  Copyright 2016 Stefan Jacholke. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

'use strict';

goog.provide('Blockly.Blocks.testBlocks');

goog.require('Blockly.Blocks');

// For tests /////////////////////////////////////

Blockly.Blocks['take_func_test'] = {
  /**
   * Block for comparison operator.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(210);
    this.setOutput(true, 'Boolean');
    this.setOutputTypeExpr(new Blockly.TypeExpr('Picture'));

    var A = Blockly.TypeVar.getUnusedTypeVar();
    this.appendValueInput('A')
        .setTypeExpr(new Blockly.TypeExpr('Function_', 
              [new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Bool') ]  ));
    this.appendValueInput('B')
        .setTypeExpr(new Blockly.TypeExpr('Number'))
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
  }
};

Blockly.Blocks['func_test'] = {
  /**
   * Block for comparison operator.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(210);
    this.setOutput(true);
    // this.setOutputTypeExpr(new Blockly.TypeExpr('Function_', 
    //          [new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Bool') ]  ));
    this.setOutputTypeExpr(new Blockly.TypeExpr('Bool'));

    this.appendDummyInput()
        .appendField('Niemand');
    this.appendValueInput('A')
        .setTypeExpr(new Blockly.TypeExpr('Number'));
    this.appendValueInput('B')
        .setTypeExpr(new Blockly.TypeExpr('Number'))
    this.appendValueInput('A')
        .setTypeExpr(new Blockly.TypeExpr('Number'));

  }
};

Blockly.Blocks['fieldVarInputTest'] = {
  init: function() {
    this.setColour(160);
    this.appendValueInput('NUM')
        .setTypeExpr(new Blockly.TypeExpr('Number'))
        .appendField(new Blockly.FieldVarInput('Regal', null, new Blockly.TypeExpr('Picture')));
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr('Picture'));
    this.functionName = "circle";
  }
};


Blockly.Blocks['drawingOfTest'] = {
  init: function() {
    this.setColour(160);
    this.appendValueInput()
        .setTypeExpr(new Blockly.TypeExpr('Custom'))
        .appendField('Drawing Of');
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr('Custom'));
  }
};

Blockly.Blocks['math_test'] = {
  /**
   * Block for basic arithmetic operator.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(230);
    this.setOutput(true);
    // Sorin
    this.setOutputTypeExpr(new Blockly.TypeExpr('Number'));
    this.appendValueInput('A');
    this.appendValueInput('B')
        .appendField('YEAH');
    this.setInputsInline(true);
    this.arrows = [new Blockly.TypeExpr('_POLY_A'), new Blockly.TypeExpr('Number'),
                   new Blockly.TypeExpr('Number')];
  }
};


