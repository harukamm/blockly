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
    var nameField = new Blockly.FieldTextInput(
        "var",
        Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput("HEADER")
        .appendField("")
        .appendField(nameField, 'NAME');
    this.appendValueInput('RETURN');
    this.setMutator(new Blockly.Mutator(['procedures_mutatorarg_auto']));
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);
    this.arguments_ = [];
    this.argTypes_ = [];
    this.setStatements_(false);
    this.statementConnection_ = null;
    this.allowRename = false;
    this.arrows = [new Blockly.TypeExpr('_POLY_A')];
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
      var field = new Blockly.FieldVarInput(this.arguments_[i],this.getArgType,i);
      header.appendField(field);
    }
    this.inputList = this.inputList.concat(bodyInput);
 

    Blockly.Events.disable();
    // this.setFieldValue(paramString, 'PARAMS');
    Blockly.Events.enable();
  },
  getArgType: function(localId){
    return this.argTypes_[localId];
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
      var paramBlock = workspace.newBlock('procedures_mutatorarg_auto');
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
    var oldArgs = this.arguments_;
    this.arguments_ = [];
    this.paramIds_ = [];
    var paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock) {
      this.arguments_.push(paramBlock.getFieldValue('NAME'));
      this.argTypes_.push(Blockly.TypeVar.getUnusedTypeVar());
      this.paramIds_.push(paramBlock.id);
      paramBlock = paramBlock.nextConnection &&
          paramBlock.nextConnection.targetBlock();
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);


    // Remove all deleted blocks
    
    var thisBlock = this;
    Blockly.getMainWorkspace().getAllBlocks().forEach(function(block){
      if(block.parent_ && block.parent_ == thisBlock){
        var name = block.getFieldValue('NAME');
        var oldIndex = oldArgs.indexOf(name);
        if(oldIndex >= thisBlock.arguments_.length){
          block.dispose();
          block = null;
        }
        else{
          var newName = thisBlock.arguments_[oldIndex];
          block.setFieldValue(newName,'NAME');
        }
      }
    });
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
  },
  resetCallers: function(){
    var defBlock = this;
    var workspace = Blockly.getMainWorkspace();
    var name = this.getFieldValue('NAME');
    var callers = Blockly.Procedures.getCallers(name, workspace);
    var outputType = defBlock.getInput("RETURN").connection.getTypeExpr();
    callers.forEach(function(caller){
      caller.setOutputTypeExpr(outputType);
      for(var k = 0; k < defBlock.argTypes_.length; k++){
        var tp = defBlock.argTypes_[k];
        caller.getInput("ARG" + k).setTypeExpr(tp);
      }
      caller.render();
    });
  },
  onCreate: function(){
    var newName = Blockly.Procedures.findLegalName(this.getFieldValue('NAME'),this);
    this.setFieldValue(newName /**/, 'NAME');
    this.allowRename = true;
  },
  onTypeChange: function(){ // Reset the types of this block and it's callers
      // this.initArrows(); // this is already done in connection.js -
      // disconnect()
      // TODO - updateParams creates a new fieldvarinput.
      //        * Ensure that local_vars point to the new field
      //        * Store type info in argTypes_ and sync
      //        * Loop through all local_vars, set the argType_ (and field typeExpr) to the
      //          local_var that is monomorphic
      this.reconnectInputs();
      var workspace = Blockly.getMainWorkspace();
      var name = this.getFieldValue("NAME");
      // var callers = Blockly.Procedures.getCallers(name, workspace);
      // var tp = this.getInput("RETURN").connection.getTypeExpr();
      // var isMono = true;
      // for(var k = 0; k < callers.length; k++){// First pass, if a child is connected, reinvoke the connection to set the types properly
      //   var block = callers[k];
      //   if(block.outputConnection.isConnected()){
      //     var conn = block.outputConnection.targetConnection;
      //     block.outputConnection.connect__(conn); // Recon
      //     isMono = false;
      //     break;
      //   }
      // }
      // if(isMono){ // Then we need to make all callers polymorphic
      //   for(var k = 0; k < callers.length; k++){
      //     var block = callers[k];
      //     block.setOutputTypeExpr(tp);
      //     block.render();
      //   }
      // }


      // Update local_vars
      var thisBlock = this;
      this.arguments_.forEach(function(varName){
        var callers = [];  // That correspond to the current variable. TODO make more effective !!
        Blockly.getMainWorkspace().getAllBlocks().forEach(function(block){
          if(block.type == "vars_local"){
            var owner = block.parentBlock__;
            if(owner == thisBlock && block.getFieldValue("NAME") == varName){
              callers.push(block);
            }
          }
        });


        var isMono = true;
        for(var k = 0; k < callers.length; k++){// First pass, if a child is connected, reinvoke the connection to set the types properly
          var block = callers[k];
          if(block.outputConnection.isConnected()){
            var conn = block.outputConnection.targetConnection;
            try{block.outputConnection.connect__(conn);}catch(e){} // Recon
            isMono = false;
            break;
          }
        }
        if(isMono){ // Then we need to make all callers polymorphic
          var tp = Blockly.TypeVar.getUnusedTypeVar();
          for(var k = 0; k < callers.length; k++){
            var block = callers[k];
            block.setOutputTypeExpr(tp);
            block.render();
          }
        }

        // Type unification works well on blocks, so we just copy the type over
        // now
        if(callers[0]){
          var tp = callers[0].outputConnection.typeExpr;
          var ind = thisBlock.arguments_.indexOf(varName);
          thisBlock.argTypes_[ind] = tp;
        }

      });

      this.updateParams_();
      this.resetCallers();
      this.render();
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
  },

  getUnusedVar : function(){
    var connection = this.getInput('STACK').connection;
    var vars = [];

    var paramBlock = this.getInputTargetBlock('STACK');
    while (paramBlock) {
      vars.push(paramBlock.getFieldValue('NAME'));
      paramBlock = paramBlock.nextConnection &&
          paramBlock.nextConnection.targetBlock();
    }

    var k = 0;
    while(k<26){
      var j = ((k++) + 23) % 26;

      var chr = String.fromCharCode(97 + j);
      if (vars.indexOf(chr) < 0)
        return chr;
    }
 
  }
};



Blockly.Blocks['procedures_mutatorarg_auto'] = {

  init: function() {

    this.appendDummyInput()
        .appendField(Blockly.Msg.PROCEDURES_MUTATORARG_TITLE)
        .appendField(new Blockly.FieldTextInput('x', this.validator_), 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_MUTATORARG_TOOLTIP);
    this.contextMenu = false;
  
  },

  onchange : function(evChange){

    if(evChange.type == Blockly.Events.CREATE){
      if(this.isInFlyout)
        return;
      if(evChange.blockId != this.id)
        return;

      var workspace = this.workspace;
      var blocks = workspace.getAllBlocks();
      var stack;
      for(var i =0; i < blocks.length; i++){
        if(blocks[i].type == 'procedures_mutatorcontainer_nostatements'){
          stack = blocks[i];
          break;
        }
      }
      var varName = 'x';
      if(stack)
        varName = stack.getUnusedVar();

      this.setFieldValue(varName, 'NAME');
    }

  },

  validator_: function(name) {
    var exc = [];
    var blocks = Blockly.getMainWorkspace().getTopBlocks();
    blocks.forEach(function(b){
      if(b.type='procedures_letFunc')
        exc.push(b.getFieldValue('NAME'));
    });

    name = name.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
    name = name.replace(' ','');
    name = name.charAt(0).toLowerCase() + name.slice(1); // Make first letter uppercase
    if(/[^a-z_]/.test( name[0] ) )
      name = 'x1';

    if(exc.indexOf(name) >= 0)
      return null;

    return name || null;
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
    this.parentId = null; // Which block spawned me?
    this.localId = -1; // Which field and so on
    this.arrows = [new Blockly.TypeExpr('_POLY_A')];
    this.dom_ = null;
  },

  domToMutation: function(xmlElement) {  // TODO, this needs work, what in the case of a list expr or case block? 
    var name = xmlElement.getAttribute('name');
    this.parentId = xmlElement.getAttribute('parentId'); // Name of parent function
    this.localId = Number(xmlElement.getAttribute('localId')); // Name of parent function
    this.setFieldValue(name, 'NAME');

    var typeDom = xmlElement.childNodes[0];
    var type = Blockly.TypeExpr.fromDom(typeDom);
    this.dom_ = typeDom;
    this.setOutputTypeExpr(type);

  },

  getType: function(){
    var workspace = Blockly.getMainWorkspace();
    var parentBlock = workspace.getBlockById(this.parentId);
    if(parentBlock.getArgType){
      var tp = parentBlock.getArgType(this.localId);
      if(tp)
        return tp;
    }

    return this.outputConnection.typeExpr; // Current type
  },

  // Overide the base method
  initArrows: function(){

    // this.setOutputTypeExpr(this.getType());

    // if(!this.dom_){
    //   this.setOutputTypeExpr(Blockly.TypeVar.getUnusedTypeVar());
    // }
    // else{
    //   this.setOutputTypeExpr(Blockly.TypeExpr.fromDom(this.dom_))
    // }
  },

  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('name', this.getFieldValue('NAME'));
    if(this.parent_)
    container.setAttribute('parentId', this.parentId);
    container.setAttribute('localId', this.localId);

    var typeDom = this.outputConnection.typeExpr.toDom();
    container.appendChild(typeDom);

    return container;
  },

  onTypeChange: function(){
  },

  isParentInScope: function(p){

    var parentBlock = Blockly.getMainWorkspace().getBlockById(this.parentId);
    if(!parentBlock)
      return true; // Assume it is

    while(p){
      if(p==parentBlock) 
        return true;
      if(p.outputConnection)
        p = p.outputConnection.targetBlock();
      else 
        p = null;
    }
    return false;
  }

};
