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

goog.provide('Blockly.Blocks.funblocksProcedures');

goog.require('Blockly.Blocks');


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
    this.appendDummyInput("HEADER")
        .appendField("")
        .appendField(nameField, 'NAME');
    this.appendValueInput('RETURN')
        .setTypeExpr(A);
    this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);
    this.arguments_ = [];
    this.argTypes_ = [];
    this.setStatements_(false);
    this.statementConnection_ = null;
  },
  setStatements_: Blockly.Blocks['procedures_defnoreturn'].setStatements_,
  validate: Blockly.Blocks['procedures_defnoreturn'].validate,
  updateParams_: function() {
    // Check for duplicated arguments.
    var badArg = false;
    var hash = {};
    for (var i = 0; i < this.arguments_.length; i++) {
      if (hash['arg_' + this.arguments_[i].toLowerCase()]) {
        badArg = true;
        break;
      }
      hash['arg_' + this.arguments_[i].toLowerCase()] = true;
    }
    if (badArg) {
      this.setWarningText(Blockly.Msg.PROCEDURES_DEF_DUPLICATE_WARNING);
    } else {
      this.setWarningText(null);
    }

    var procName = this.getFieldValue('NAME');
    var bodyInput = this.inputList[this.inputList.length - 1]; 
    // Remove header
    var thisBlock = this;
    Blockly.FieldParameterFlydown.withChangeHanderDisabled(
      function() {thisBlock.removeInput('HEADER');}
    );
    this.inputList = [];
    // Readd header
    var nameField = new Blockly.FieldTextInput(
        procName,
        Blockly.Procedures.rename);
    nameField.setSpellcheck(false);

    var header = this.appendDummyInput("HEADER")
               //      .appendField("Let")
                     .appendField(nameField, 'NAME');
    if(this.arguments_.length > 0)
      header.appendField(' ');
    for (var i = 0; i < this.arguments_.length; i++) {
      var field = new Blockly.FieldVarInput(this.arguments_[i]);
      var oldField = new Blockly.FieldParameterFlydown(this.arguments_[i],true,
                            Blockly.FieldFlydown.DISPLAY_RIGHT, function(o){});
        header.appendField(field);
    }
    this.inputList = this.inputList.concat(bodyInput);
 

    Blockly.Events.disable();
    // this.setFieldValue(paramString, 'PARAMS');
    Blockly.Events.enable();
  },
  mutationToDom: Blockly.Blocks['procedures_defnoreturn'].mutationToDom,
  domToMutation: function(xmlElement) {
    this.arguments_ = [];
    for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        this.arguments_.push(childNode.getAttribute('name'));
        this.argTypes_.push(Blockly.TypeVar.getUnusedTypeVar());
      }
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);

    // Show or hide the statement input.
    this.setStatements_(xmlElement.getAttribute('statements') !== 'false');
  },


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

  compose: function(containerBlock) {
    // Parameter list.
    this.arguments_ = [];
    this.paramIds_ = [];
    var paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock) {
      this.arguments_.push(paramBlock.getFieldValue('NAME'));
      this.argTypes_.push(Blockly.TypeVar.getUnusedTypeVar());
      // TODO, make sure argTypes_ do not get garbage collected !
      this.paramIds_.push(paramBlock.id);
      paramBlock = paramBlock.nextConnection &&
          paramBlock.nextConnection.targetBlock();
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);
  },

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


Blockly.Blocks['procedures_let'] = {
  /**
   * Block for defining a procedure with a return value.
   * @this Blockly.Block
   */
  init: function() {
    var A = Blockly.TypeVar.getUnusedTypeVar();
    var B = Blockly.TypeVar.getUnusedTypeVar();
    var nameField = new Blockly.FieldTextInput(
        "bar",
        Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput("HEADER")
        .appendField("Let")
        .appendField(nameField, 'NAME');
    this.appendValueInput('RETURN')
        .appendField('=')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setTypeExpr(A);
    this.appendValueInput('IN')
        .appendField('in')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setTypeExpr(B);
    this.setOutput(true);
    this.setOutputTypeExpr(B);
    this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);
    this.arguments_ = [];
    this.argTypes_ = [];
    this.setStatements_(false);
    this.statementConnection_ = null;
  },
  setStatements_: Blockly.Blocks['procedures_defnoreturn'].setStatements_,
  validate:       Blockly.Blocks['procedures_defnoreturn'].validate,
  updateParams_:  Blockly.Blocks['procedures_letFunc'].updateParams_, 
  mutationToDom:  Blockly.Blocks['procedures_defnoreturn'].mutationToDom,
  domToMutation:  Blockly.Blocks['procedures_letFunc'].domToMutation, 
  getProcedureDef:  Blockly.Blocks['procedures_letFunc'].domToMutation, 
  decompose:      Blockly.Blocks['procedures_letFunc'].decompose, 
  compose:        Blockly.Blocks['procedures_letFunc'].compose, 
  dispose:        Blockly.Blocks['procedures_letFunc'].dispose, 
  onchange:       Blockly.Blocks['procedures_letFunc'].onchange, 
  getVars:        Blockly.Blocks['procedures_defnoreturn'].getVars,
  renameVar:      Blockly.Blocks['procedures_defnoreturn'].renameVar,
  customContextMenu: function(o){}
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

Blockly.Blocks['procedures_getVar'] = {
  init: function() {
    this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
    this.setColour(330);
    var dropdown = new Blockly.FieldDropdown(this.genMenu, this.createDropdownChangeFunction());
    dropdown.master = this;
    this.appendDummyInput()
        .appendField(dropdown,"VAR");
    this.setOutput(true);
    this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
  },

  customContextMenu: function(options) {
  },

  createDropdownChangeFunction: function() {
    var self = this;
    return function(text) {
    var par = self.getParent();
    var varList = [];
    // get type of most immediate parent declaring the variable
    while(par)
    {
      if(par.type == "procedures_letFunc")
      {
        for(var i =0; i < par.arguments_.length; i++)
        {
          if(par.arguments_[i] == text)
          {
            var tp = par.argTypes_[i];
            
            par.argTypes_[i] = self.outputConnection.typeExpr;
            //self.setOutputTypeExpr(tp);
            //self.setColourByType(tp);
          

            return undefined;    
          }
        }
      }
      par = par.getParent();
    }
    return undefined;
    };
  },

  genMenu: function() {
    var def = [["None","None"]];

    if(!this.master)
      return def; 

    var varList = [];
    var par = this.master.getParent();
    var vars = Blockly.Variables.getVariablesUp(par);
    vars.forEach(function(v){
      varList.push([v,v]);
    });

    if(varList.length < 1)
      return def;
    return varList;
  }
};

Blockly.Blocks['vars_local'] = {
  init: function() {
    this.setColour(150);
    this.appendDummyInput()
        .appendField('x', 'NAME');
    this.setOutput(true);
    this.setOutputTypeExpr(Blockly.TypeVar.getUnusedTypeVar());
  },

  domToMutation: function(xmlElement) {
    var name = xmlElement.getAttribute('name');
    var typeName = xmlElement.getAttribute('typename');
    this.setOutputTypeExpr(new Blockly.TypeExpr(typeName));
    this.setFieldValue(name, 'NAME');
  }

};


