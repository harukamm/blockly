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

goog.provide('Blockly.Blocks.cwMath');

goog.require('Blockly.Blocks');


// Stefan
Blockly.Blocks['numNumber'] = {
  /**
   * Block for numeric value.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
    this.setColour(210);
    var field = new Blockly.FieldNumber('0');
    field.setValidator(Blockly.FieldNumber.prototype.basicNumberValidator);
    this.appendDummyInput()
        .appendField(field, 'NUMBER');
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr('Number'));
    this.setTooltip(Blockly.Msg.MATH_NUMBER_TOOLTIP);
    this.functionName = "";
  }
};

// TODO, moves these to Haskell
Blockly.Blocks['numNumberPerc'] = {
  /**
   * Block for numeric value.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
    this.setColour(210);
    var field = new Blockly.FieldNumber('0');
    field.setValidator(Blockly.FieldNumber.prototype.basicNumberValidator);
    this.appendDummyInput()
        .appendField(field, 'NUMBER')
        .appendField(new Blockly.FieldLabel('%','blocklyTextEmph'));
    this.setOutput(true, 'Number');
    // Sorin
    this.setOutputTypeExpr(new Blockly.TypeExpr('Number'));
    this.setTooltip(Blockly.Msg.MATH_NUMBER_TOOLTIP);
    this.functionName = "";
  }
};

Blockly.Blocks['numAdd'] = {
  init: function() {
    this.setColour(210);
    this.appendValueInput('LEFT');
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('+','blocklyTextEmph'));
    this.appendValueInput('RIGHT');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};

Blockly.Blocks['numSub'] = {
  init: function() {
    this.setColour(210);
    this.appendValueInput('LEFT');
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('-','blocklyTextEmph'));
    this.appendValueInput('RIGHT');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};

Blockly.Blocks['numMult'] = {
  init: function() {
    this.setColour(210);
    this.appendValueInput('LEFT');
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('*','blocklyTextEmph'));
    this.appendValueInput('RIGHT');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};

Blockly.Blocks['numDiv'] = {
  init: function() {
    this.setColour(210);
    this.appendValueInput('LEFT');
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('/','blocklyTextEmph'));
    this.appendValueInput('RIGHT');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};

Blockly.Blocks['numExp'] = {
  init: function() {
    this.setColour(210);
    this.appendValueInput('LEFT');
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('^','blocklyTextEmph'));
    this.appendValueInput('RIGHT');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};

Blockly.Blocks['numMax'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('Maximum','blocklyTextEmph'));
    this.appendValueInput('LEFT');
    this.appendValueInput('RIGHT');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};

Blockly.Blocks['numMin'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('Minimum','blocklyTextEmph'));
    this.appendValueInput('LEFT');
    this.appendValueInput('RIGHT');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};

Blockly.Blocks['numQuot'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('Quotient','blocklyTextEmph'));
    this.appendValueInput('LEFT');
    this.appendValueInput('RIGHT');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};
Blockly.Blocks['numRem'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('Remainder','blocklyTextEmph'));
    this.appendValueInput('LEFT');
    this.appendValueInput('RIGHT');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};
Blockly.Blocks['numGCD'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('GCD','blocklyTextEmph'));
    this.appendValueInput('LEFT');
    this.appendValueInput('RIGHT');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};
Blockly.Blocks['numLCM'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('LCM','blocklyTextEmph'));
    this.appendValueInput('LEFT');
    this.appendValueInput('RIGHT');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'),new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};
Blockly.Blocks['numOpposite'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('Opposite','blocklyTextEmph'));
    this.appendValueInput('NUM');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};
Blockly.Blocks['numAbs'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('Absolute Value','blocklyTextEmph'));
    this.appendValueInput('NUM');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};
Blockly.Blocks['numRound'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('Round','blocklyTextEmph'));
    this.appendValueInput('NUM');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};
Blockly.Blocks['numReciprocal'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('Reciprocal','blocklyTextEmph'));
    this.appendValueInput('NUM');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};
Blockly.Blocks['numSqrt'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('_/','blocklyTextEmph'));
    this.appendValueInput('NUM');
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};

Blockly.Blocks['numPi'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('Pi','blocklyTextEmph'));
    this.setOutput(true);
    this.arrows = [new Blockly.TypeExpr('Number')];
    this.setInputsInline(true);
  }
};
















