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

/* Blocks from typed-blockly project
   https://github.com/UCSD-PL/typed-blockly
*/

// TODO, move blocks over to Haskell
'use strict';

goog.provide('Blockly.Blocks.typedBlocks');

goog.require('Blockly.Blocks');


Blockly.Blocks['logic_boolean_typed'] = {
  /**
   * Block for boolean data type: true and false.
   * @this Blockly.Block
   */
  init: function() {
    var BOOLEANS =
        [[Blockly.Msg.LOGIC_BOOLEAN_TRUE, 'TRUE'],
         [Blockly.Msg.LOGIC_BOOLEAN_FALSE, 'FALSE']];
    this.setHelpUrl(Blockly.Msg.LOGIC_BOOLEAN_HELPURL);
    this.setColour(210);
    this.setOutput(true, 'Bool');
    // Sorin
    this.setOutputTypeExpr(new Blockly.TypeExpr('Bool'));
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(BOOLEANS), 'BOOL');
    this.setTooltip(Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP);
  }
};

Blockly.Blocks['logic_compare_typed'] = {
  /**
   * Block for comparison operator.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS = Blockly.RTL ? [
          ['=', 'EQ'],
          ['\u2260', 'NEQ'],
          ['>', 'LT'],
          ['\u2265', 'LTE'],
          ['<', 'GT'],
          ['\u2264', 'GTE']
        ] : [
          ['=', 'EQ'],
          ['\u2260', 'NEQ'],
          ['<', 'LT'],
          ['\u2264', 'LTE'],
          ['>', 'GT'],
          ['\u2265', 'GTE']
        ];
    this.setHelpUrl(Blockly.Msg.LOGIC_COMPARE_HELPURL);
    this.setColour(210);
    this.setOutput(true, 'Bool');
    // Sorin
    this.setOutputTypeExpr(new Blockly.TypeExpr('Bool'));
    this.appendValueInput('A');
    this.appendValueInput('B')
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
    this.setInputsInline(true);

    this.arrows = [new Blockly.TypeExpr('_POLY_A'), new Blockly.TypeExpr('_POLY_A'), new Blockly.TypeExpr('Bool')];

    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var op = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'EQ': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_EQ,
        'NEQ': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_NEQ,
        'LT': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LT,
        'LTE': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LTE,
        'GT': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GT,
        'GTE': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GTE
      };
      return TOOLTIPS[op];
    });
  }
};

Blockly.Blocks['logic_ternary_typed'] = {
  /**
   * Block for ternary operator.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.LOGIC_TERNARY_HELPURL);
    this.setColour(210);
    var A = Blockly.TypeVar.getUnusedTypeVar();
    this.appendValueInput('IF')
        .setCheck('Bool')
        .setTypeExpr(new Blockly.TypeExpr('Bool'))
        .appendField(Blockly.Msg.LOGIC_TERNARY_CONDITION);
    this.appendValueInput('THEN')
        .setTypeExpr(A)
        .appendField(Blockly.Msg.LOGIC_TERNARY_IF_TRUE);
    this.appendValueInput('ELSE')
        .setTypeExpr(A)
        .appendField(Blockly.Msg.LOGIC_TERNARY_IF_FALSE);
    this.setInputsInline(true);
    this.setOutput(true);
    this.setOutputTypeExpr(A);
    this.setTooltip(Blockly.Msg.LOGIC_TERNARY_TOOLTIP);
  }
};

Blockly.Blocks['math_arithmetic_typed'] = {
  /**
   * Block for basic arithmetic operator.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.MATH_ADDITION_SYMBOL, 'ADD'],
         [Blockly.Msg.MATH_SUBTRACTION_SYMBOL, 'MINUS'],
         [Blockly.Msg.MATH_MULTIPLICATION_SYMBOL, 'MULTIPLY'],
         [Blockly.Msg.MATH_DIVISION_SYMBOL, 'DIVIDE'],
         [Blockly.Msg.MATH_POWER_SYMBOL, 'POWER']];
    this.setHelpUrl(Blockly.Msg.MATH_ARITHMETIC_HELPURL);
    this.setColour(230);
    this.setOutput(true);
    // Sorin
    this.setOutputTypeExpr(new Blockly.TypeExpr('Number'));
    this.appendValueInput('A')
        .setTypeExpr(new Blockly.TypeExpr('Number'));
    this.appendValueInput('B')
        .setTypeExpr(new Blockly.TypeExpr('Number'))
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'ADD': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_ADD,
        'MINUS': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MINUS,
        'MULTIPLY': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MULTIPLY,
        'DIVIDE': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_DIVIDE,
        'POWER': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_POWER
      };
      return TOOLTIPS[mode];
    });
  }
};


Blockly.Blocks['pair_first_typed'] = {
  /**
   * Block for ternary operator.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(210);
    var A = Blockly.TypeVar.getUnusedTypeVar();
    var B = Blockly.TypeVar.getUnusedTypeVar();
    this.appendValueInput('PAIR')
        .setTypeExpr(new Blockly.TypeExpr ("pair", [A, B]))
        .appendField(new Blockly.FieldLabel("fst","blocklyTextEmph") );
    this.setOutput(true);
    this.setOutputTypeExpr(A);
  }
};

Blockly.Blocks['pair_second_typed'] = {
  /**
   * Block for ternary operator.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(210);
    var A = Blockly.TypeVar.getUnusedTypeVar();
    var B = Blockly.TypeVar.getUnusedTypeVar();
    this.appendValueInput('PAIR')
        .setTypeExpr(new Blockly.TypeExpr ("pair", [A, B]))
        .appendField(new Blockly.FieldLabel("snd","blocklyTextEmph") );
    this.setOutput(true);
    this.setOutputTypeExpr(B);
  }
};

/**
 * First class functions
 */

Blockly.Blocks.lambda_id = 0;

Blockly.Blocks['lambda_typed'] = {
  /**
   */
  init: function() {
    this.setColour(290);
    var A = Blockly.TypeVar.getUnusedTypeVar();
    var B = Blockly.TypeVar.getUnusedTypeVar();
    this.argName = 'X' + Blockly.Blocks.lambda_id;
    Blockly.Blocks.lambda_id++;
    this.appendDummyInput()
        .appendField('function with arg: ' + this.argName);
    this.appendValueInput('RETURN')
        .setTypeExpr(B)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr ("fun", [A, B]));
  },

  getVars: function () {
    return [this.argName];
  },

  getVarsWithTypes: function() {
    var result = {};
    result[this.argName] = this.outputConnection.typeExpr.children[0];
    return result;
  }
}

Blockly.Blocks['lambda_app_typed'] = {
  /**
   */
  init: function() {
    this.setColour(290);
    var A = Blockly.TypeVar.getUnusedTypeVar();
    var B = Blockly.TypeVar.getUnusedTypeVar();
    this.appendValueInput('FUN')
        .setTypeExpr(new Blockly.TypeExpr ("fun", [A, B]))
        .appendField('call function');
    this.appendValueInput('ARG')
        .setTypeExpr(A)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('with arg');
    this.setOutput(true);
    this.setOutputTypeExpr(B);
  },

  getVars: function () {
    return [this.argName];
  },

  getVarsWithTypes: function() {
    var result = {};
    result[this.argName] = this.outputConnection.typeExpr.children[0];
    return result;
  }
}

/**
 * Typed variables
 */

Blockly.Blocks['variables_get_typed'] = {
  /**
   * Block for variable getter.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
    this.setColour(330);
    this.appendDummyInput()
        .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        .appendField(new Blockly.FieldVariable(
          Blockly.Msg.VARIABLES_GET_ITEM, this.createDropDownChangeFunction()), 'VAR')
        .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
    this.setOutput(true);
    this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
    this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
    this.contextMenuType_ = 'variables_set';
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getVars: function() {
    return [this.getFieldValue('VAR')];
  },
  /**
   * Notification that a variable is renaming.
   * If the name matches one of this block's variables, rename it.
   * @param {string} oldName Previous name of variable.
   * @param {string} newName Renamed variable.
   * @this Blockly.Block
   */
  renameVar: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
      this.setFieldValue(newName, 'VAR');
    }
  },
  /**
   * Add menu option to create getter/setter block for this setter/getter.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    var option = {enabled: true};
    var name = this.getFieldValue('VAR');
    option.text = this.contextMenuMsg_.replace('%1', name);
    var xmlField = goog.dom.createDom('field', null, name);
    xmlField.setAttribute('name', 'VAR');
    var xmlBlock = goog.dom.createDom('block', null, xmlField);
    xmlBlock.setAttribute('type', this.contextMenuType_);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);
  },

  createDropDownChangeFunction: function() {
    var self = this;
    return function(text) {
      var blocks = Blockly.mainWorkspace.getAllBlocks();
      for (var i = 0; i < blocks.length; i++) {
        if (blocks[i].getVarsWithTypes) {
          var varsWithTypes = blocks[i].getVarsWithTypes();
          if (text in varsWithTypes) {
            self.setOutputTypeExpr(varsWithTypes[text]);
          }
        }
      }
      return undefined;
    };
  }
};







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

