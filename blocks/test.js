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


Blockly.Blocks['test_logic_ternary'] = {
  /**
   * Block for ternary operator.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.LOGIC_TERNARY_HELPURL);
    this.setColour(210);
    this.appendValueInput('IF')
        .appendField('if');
    this.appendValueInput('THEN');
    this.appendValueInput('ELSE');
    this.setInputsInline(true);
    this.setOutput(true);

    Blockly.Block.defineFunction('if', Type.fromList([Type.Lit("Bool"),Type.Var("a"),Type.Var("a"),Type.Var("a")]));
    this.setAsFunction('if'); 
  }
};

Blockly.Blocks['test_number'] = {
  /**
   * Block for ternary operator.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField('5', 'NAME');
    this.setInputsInline(true);
    this.setOutput(true);
    this.setAsLiteral('Number'); 
  }
};

Blockly.Blocks['test_true'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField('True','NAME');
    this.setInputsInline(true);
    this.setOutput(true);
    this.setAsLiteral('Bool'); 
  }
};
