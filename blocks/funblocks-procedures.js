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

Blockly.Blocks['procedures_letVar']  = {
  /**
   * Block for defining a procedure with a return value.
   * @this Blockly.Block
   */
  init: function() {
    var thisBlock = this;
    var A = Blockly.TypeVar.getUnusedTypeVar();
    var nameField = new Blockly.FieldTextInput(
        "foo",
        Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel("Let","blocklyTextEmph"))
        .appendField(nameField, 'NAME')
        .appendField('', 'PARAMS');
    this.appendValueInput('RETURN')
        .setTypeExpr(A)
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
  decompose: Blockly.Blocks['procedures_defnoreturn'].decompose,
  compose: Blockly.Blocks['procedures_defnoreturn'].compose,
  dispose: Blockly.Blocks['procedures_defnoreturn'].dispose,


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

    if(!parentBlock || parentBlock.type != 'procedures_letVar')
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
    if(changeEvent.type == Blockly.Events.MOVE && changeEvent.oldInputName)
    {
      // Disconnect old block, make polymorphic
      var callers = Blockly.Procedures.getCallers(name, workspace);
      var tp = defBlock.getInput("RETURN").connection.getTypeExpr();

      callers.forEach(function(block)
      {
        if(block.outputConnection && block.outputConnection.isConnected() && block.getProcedureCall() == name)
        {
          var targetBlock = block.outputConnection.targetBlock();
          var targetConnection = block.outputConnection.targetConnection;

          block.outputConnection.disconnect();
          block.setOutput(true);
          block.setColour(Blockly.Blocks.procedures.HUE);
          
          block.setOutputTypeExpr(tp);
          block.setColourByType(tp);
          if(block.outputConnection.typeExpr)
            block.outputConnection.typeExpr.unify(tp);

          block.outputConnection.connect(targetConnection);
          block.render();
        }
        else if(block.outputConnection)
        {
          block.outputConnection.dispose();
        }
        block.outputConnection = null;
        block.setOutput(true);
        block.setColour(Blockly.Blocks.procedures.HUE);

        block.setOutputTypeExpr(tp);
        if(block.outputConnection.typeExpr)
          block.outputConnection.typeExpr.unify(tp);

        block.render();
      });
    }
  },
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, true];
  },
  getVars: Blockly.Blocks['procedures_defnoreturn'].getVars,
  customContextMenu: function(o){},
  renameVar: Blockly.Blocks['procedures_defnoreturn'].renameVar,
  callType_: 'procedures_let_callreturn'
};





Blockly.Blocks['procedures_let_callreturn'] = {
  /**
   * Block for calling a procedure with a return value.
   * @this Blockly.Block
   */

  init: function() {
    this.appendDummyInput('TOPROW')
        .appendField('', 'NAME');
    this.setOutput(true);
    this.setColour(HUE);
    // Tooltip is set in domToMutation.
    this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLRETURN_HELPURL);
    this.arguments_ = [];
    this.quarkConnections_ = {};
    this.quarkIds_ = null;

  },
  getProcedureCall: Blockly.Blocks['procedures_callnoreturn'].getProcedureCall,
  renameProcedure: Blockly.Blocks['procedures_callnoreturn'].renameProcedure,
  setProcedureParameters_:
      Blockly.Blocks['procedures_callnoreturn'].setProcedureParameters_,
  updateShape_: Blockly.Blocks['procedures_callnoreturn'].updateShape_,
  mutationToDom: Blockly.Blocks['procedures_callnoreturn'].mutationToDom,
  domToMutation: Blockly.Blocks['procedures_callnoreturn'].domToMutation,
  renameVar: Blockly.Blocks['procedures_callnoreturn'].renameVar,
  customContextMenu: Blockly.Blocks['procedures_callnoreturn'].customContextMenu
};




