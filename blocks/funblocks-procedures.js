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

// Actually we require this, but it errors on build
//goog.require('Blockly.Procedures');

var HUE = 300;

Blockly.Blocks['procedures_letFunc'] = {
  /**
   * Block for defining a procedure with a return value.
   * @this Blockly.Block
   */
  init: function() {
    var A = Blockly.TypeVar.getUnusedTypeVar();
    var nameField = new Blockly.FieldTextInput(
        "bar",
        Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
        .appendField("Let")
        .appendField(nameField, 'NAME')
        .appendField('', 'PARAMS');
    this.appendValueInput('RETURN')
        .setTypeExpr(A);
    this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);
    this.arguments_ = [];
    this.setStatements_(false);
    this.statementConnection_ = null;
  },
  setStatements_: Blockly.Blocks['procedures_defnoreturn'].setStatements_,
  validate: Blockly.Blocks['procedures_defnoreturn'].validate,
  updateParams_: Blockly.Blocks['procedures_defnoreturn'].updateParams_,
  mutationToDom: Blockly.Blocks['procedures_defnoreturn'].mutationToDom,
  domToMutation: Blockly.Blocks['procedures_defnoreturn'].domToMutation,

  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('procedures_mutatorcontainer_nostatements');
    containerBlock.initSvg();

    // Parameter list.
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.arguments_.length; i++) {
      var paramBlock = workspace.newBlock('procedures_mutatorarg');
      paramBlock.initSvg();
      paramBlock.setFieldValue(this.arguments_[i], 'NAME');
      // Store the old location.
      paramBlock.oldLocation = i;
      connection.connect(paramBlock.previousConnection);
      connection = paramBlock.nextConnection;
    }
    // Initialize procedure's callers with blank IDs.
    Blockly.Procedures.mutateCallers(this);
    return containerBlock;
  },



  compose: Blockly.Blocks['procedures_defnoreturn'].compose,
  dispose: Blockly.Blocks['procedures_defnoreturn'].dispose,
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   *     - that it DOES have a return value.
   * @this Blockly.Block
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, true];
  },
  getVars: Blockly.Blocks['procedures_defnoreturn'].getVars,
  renameVar: Blockly.Blocks['procedures_defnoreturn'].renameVar,
  customContextMenu: function(o){},
  callType_: 'procedures_callreturn',


  onchange: function(changeEvent) {
    var name = this.getFieldValue('NAME');
    var defBlock = this;
    var workspace = Blockly.getMainWorkspace();
    var eventBlock = workspace.getBlockById(changeEvent.blockId);
    if(!eventBlock || eventBlock.blockId != this.blockId)
      return; // Only care about events on the parent this block

    var parentBlock = null;
    if(changeEvent.oldParentId)
      parentBlock = workspace.getBlockById(changeEvent.oldParentId);
    else if(changeEvent.newParentId)
      parentBlock = workspace.getBlockById(changeEvent.newParentId);

    if(!parentBlock || parentBlock.type != 'procedures_letFunc')
      return; 

    if(parentBlock.getFieldValue('NAME') != name)
      return; // Only event when parentblock is this block

    if(changeEvent.type == Blockly.Events.MOVE && changeEvent.newInputName)
    {
      // Plug in new block
      var callers = Blockly.Procedures.getCallers(name, workspace);
      var tp = defBlock.getInput("RETURN").connection.getTypeExpr();
      callers.forEach(function(block)
          {
            if(block.getProcedureCall() == name)
            {
              if(block.outputConnection.typeExpr.name != tp.name)
              {
                // block.outputConnection.bumpAwayFrom_(block.outputConnection.targetConnection);
                block.unplug();
                block.moveBy(-20,-20);

                block.setOutputTypeExpr(tp);
                block.setColourByType(tp);
                if(block.outputConnection.typeExpr)
                  block.outputConnection.typeExpr.unify(tp);

                block.render();
              }
            }
          });
    }
    else if(changeEvent.type == Blockly.Events.MOVE && changeEvent.oldInputName)
    {
    }
  }

};



Blockly.Blocks['procedures_mutatorcontainer_nostatements'] = {
  /**
   * Mutator block for procedure container.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TITLE);
    this.appendStatementInput('STACK');
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TOOLTIP);
    this.contextMenu = false;
  }
};


