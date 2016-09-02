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
    this.appendValueInput('RETURN')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('=');
    this.setMutator(new Blockly.Mutator(['procedures_mutatorarg_auto']));
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);
    this.arguments_ = [];
    this.argTypes_ = [];
    this.setStatements_(false);
    this.statementConnection_ = null;
    this.allowRename = false;
    this.arrows = Type.Func(Type.Var("a"), Type.Var("func") ); // Top level hack
  },

  initArrows: function(){
    this.getInput("RETURN").connection.setNewTypeExpr(Type.generateTypeVar('funcret'));
  },

  updateTypes: function(tp){
    this.argTypes_ = [];
    while(tp.isFunction()){
      this.argTypes_.push(tp.getFirst());
      tp = tp.getSecond();
    }

    if(this.getInput("RETURN").connection.isConnected()) // Whats the point otherwise ?
      this.getInput("RETURN").connection.setNewTypeExpr(tp);

    var inp = this.getInput("HEADER");

    var i = 0;
    for(var f = 0; f < inp.fieldRow.length; f++){
      var fieldvar = inp.fieldRow[f];
      if(fieldvar instanceof Blockly.FieldLocalVar){
        fieldvar.setNewTypeExpr(this.argTypes_[i++]);
      }
    }
    
  },

  getExpr: function(){
    if(this.getInput("RETURN").connection.isConnected()){
      var targCon = this.getInput("RETURN").connection;
      var targBlock = this.getInput("RETURN").connection.targetBlock();
      var eqExp = targBlock.getExpr();
      eqExp.tag = targCon;

      var cp = [];
      this.arguments_.forEach(a => cp.push(a));

      var exp = eqExp;
      if (this.arguments_.length > 0){
        exp = Exp.AbsFunc(cp, eqExp); 
      }
      exp.tag = this;
      return exp; 
    }
    else{
      var exp = Exp.Var("undef");
      exp.tag = this.getInput("RETURN").connection;
      return exp;
    }
  },
  setNewTypeExpr: function(tp){
    this.typeExpr = tp;
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
      header.appendField(' ( ');
    for (var i = 0; i < this.arguments_.length; i++) {
      var field = new Blockly.FieldLocalVar(this.arguments_[i],this.argTypes_[i]);
      header.appendField(field);
      if(i != this.arguments_.length - 1)
        header.appendField(', ');
    }
    if(this.arguments_.length > 0)
      header.appendField(')');
    this.inputList = this.inputList.concat(bodyInput);
 

    Blockly.Events.disable();
    // this.setFieldValue(paramString, 'PARAMS');
    Blockly.Events.enable();
  },
  getArgType: function(localId){

    var thisBlock = this;
    var inp = this.getInput("HEADER");
    var tps = [];

    for(var f = 0; f < inp.fieldRow.length; f++){
      var fieldvar = inp.fieldRow[f];
      if(fieldvar instanceof Blockly.FieldLocalVar){
        tps.push(fieldvar.typeExpr);
      }
    }

    return tps[localId];
  },

  mutationToDom: Blockly.Blocks['procedures_defnoreturn'].mutationToDom,
  domToMutation: function(xmlElement) {
    this.arguments_ = [];
    this.argTypes_ = [];
    for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        this.arguments_.push(childNode.getAttribute('name'));
        this.argTypes_.push(Type.generateTypeVar('var'));
      }
    }
    // console.log(this.arguments_);
    this.updateParams_();
    // if(this.arguments_.length == 0)
    //  throw "Scar";
    // console.log(this.arguments_);
    // Blockly.Procedures.mutateCallers(this);

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
    this.argTypes_ = [];
    this.paramIds_ = [];
    var paramBlock = containerBlock.getInputTargetBlock('STACK');
    var i = 0;
    while (paramBlock) {
      this.arguments_.push(paramBlock.getFieldValue('NAME'));
      this.argTypes_.push(Type.generateTypeVar('var'));
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
    Blockly.TypeInf.inferWorkspace(this.workspace);
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
    // TODO, figure out what to do here
    // var name = this.getFieldValue('NAME');
    // var defBlock = this;
    // var workspace = Blockly.getMainWorkspace();
    // var eventBlock = workspace.getBlockById(changeEvent.blockId);
    // if(!eventBlock || eventBlock.blockId != this.blockId)
    //   return; // Only care about events on the parent this block

    // var parentBlock = null;
    // if(changeEvent.oldParentId)
    //   parentBlock = workspace.getBlockById(changeEvent.oldParentId);
    // else if(changeEvent.newParentId)
    //   parentBlock = workspace.getBlockById(changeEvent.newParentId);

    // if(!parentBlock || parentBlock.type != 'procedures_letFunc')
    //   return; 

    // if(parentBlock.getFieldValue('NAME') != name)
    //   return; // Only event when parentblock is this block

    // if(changeEvent.type == Blockly.Events.MOVE && changeEvent.newInputName)
    // {
    //   // Plug in new block
    //   var callers = Blockly.Procedures.getCallers(name, workspace);
    //   var tp = defBlock.getInput("RETURN").connection.getTypeExpr();
    //   callers.forEach(function(block)
    //       {
    //         if(block.getProcedureCall() == name)
    //         {
    //           if(block.outputConnection.typeExpr.name != tp.name)
    //           {
    //             // block.outputConnection.bumpAwayFrom_(block.outputConnection.targetConnection);
    //             block.unplug();
    //             block.moveBy(-20,-20);

    //             block.setOutputTypeExpr(tp);
    //             block.setColourByType(tp);
    //             if(block.outputConnection.typeExpr)
    //               block.outputConnection.typeExpr.unify(tp);

    //             block.render();
    //           }
    //         }
    //       });
    // }
    // else if(changeEvent.type == Blockly.Events.MOVE && changeEvent.oldInputName)
    // {
    // }
  },
  assignVars: function(){
    var i = 0;
    var thisBlock = this;
    var inp = this.getInput("HEADER");

    for(var f = 0; f < inp.fieldRow.length; f++){
      var fieldvar = inp.fieldRow[f];
      if(fieldvar instanceof Blockly.FieldLocalVar){
        var tp = thisBlock.argTypes_[i++];
        fieldvar.typeExpr = tp;
      }
    }
  },

  resetCallers: function(){
    var defBlock = this;
    var workspace = Blockly.getMainWorkspace();
    var name = this.getFieldValue('NAME');
    var callers = Blockly.Procedures.getCallers(name, workspace);
    var outputType = defBlock.getInput("RETURN").connection.typeExpr;
    callers.forEach(function(caller){
      caller.setOutputTypeExpr(outputType);
      for(var k = 0; k < defBlock.argTypes_.length; k++){
          // inp.setTypeExpr(tp);
      }
      caller.render();
    });
  },
  onCreate: function(){
    var newName = Blockly.Procedures.findLegalName(this.getFieldValue('NAME'),this);
    this.setFieldValue(newName /**/, 'NAME');
    this.allowRename = true;
  },

};


Blockly.Blocks['procedures_mutatorcontainer_nostatements'] = {
  /**
   * Mutator block for procedure container.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField('Parameters');
    this.appendStatementInput('STACK');
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.setTooltip('Add input parameters to the function');
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
 
  },
  getExpr: null
};



Blockly.Blocks['procedures_mutatorarg_auto'] = {

  init: function() {

    this.appendDummyInput()
        .appendField('parameter: ')
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
      // If we aren't dragging a newly created block exit
      if(Blockly.selected != this) return;
      if(Blockly.dragMode_==Blockly.DRAG_NONE) return;

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

    var srcBlck = this.sourceBlock_;
    var curArgs = [];
    this.sourceBlock_.workspace.getAllBlocks().forEach(function(b){
      if(b && b != srcBlck){
        var val = b.getFieldValue('NAME');
        if(val)
          curArgs.push(val);
      }
    });

    var exc = [];
    var blocks = Blockly.getMainWorkspace().getTopBlocks();
    blocks.forEach(function(b){
      if(b && b.type=='procedures_letFunc')
        exc.push(b.getFieldValue('NAME'));
    });

    name = name.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
    name = name.replace(' ','');
    name = name.charAt(0).toLowerCase() + name.slice(1); // Make first letter uppercase
    if(/[^a-z_]/.test( name[0] ) )
      name = 'x1';

    if(name == '')
      return null;
    if(exc.indexOf(name) >= 0)
      return null; 
    if(curArgs.indexOf(name) >= 0)
      return null;


    return name;
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
    this.arrows = Type.Var("a");
    this.dom_ = null;
  },

  getExpr: function(){
    var exp = Exp.Var(this.getFieldValue('NAME'));
    exp.tag = this;
    return exp; 
  },


  domToMutation: function(xmlElement) {  
    var name = xmlElement.getAttribute('name');
    this.parentId = xmlElement.getAttribute('parentid'); // Name of parent function
    this.localId = Number(xmlElement.getAttribute('localid')); // Name of parent function
    this.setFieldValue(name, 'NAME');

    var typeDom = xmlElement.childNodes[0];
    var type = Blockly.TypeInf.fromDom(typeDom);
    this.dom_ = typeDom;
    this.arrows = type;
    this.initArrows();
  },

  initArrows: function(){
    //this.arrows = this.getType();
    //this.setOutputTypeExpr(Type.getOutput(this.arrows));
    //this.render();
    //console.log(this.arrows.toString());
    this.outputConnection.typeExpr = this.arrows;
  },

  getType: function(){
    var workspace = Blockly.getMainWorkspace();
    var parentBlock = workspace.getBlockById(this.parentId);
    var parenttp;
    if(!parentBlock)
      return this.arrows;
    if(parentBlock.getArgType){
      var tp = parentBlock.getArgType(this.localId);
      if(tp)
        parenttp = tp;
    }
    if(!parenttp)
      return this.outputConnection.typeExpr;
    if(!this.outputConnection.isConnected())
      return parenttp;

    var localtp = this.outputConnection.targetConnection.typeExpr;

    try{
      var s = Type.mgu(localtp, parenttp);
      var res = Type.apply(s,localtp);
    }
    catch(e){
      console.log(e);
      if(localtp) return localtp;
      return parenttp;
    }
  
  },

  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('name', this.getFieldValue('NAME'));

    container.setAttribute('parentid', this.parentId);
    container.setAttribute('localid', this.localId);

    var tp = this.arrows;
    var typeDom = Blockly.TypeInf.toDom(tp);
    container.appendChild(typeDom);

    return container;
  },


  setNewTypeExpr: function(tp){
    this.typeExpr = tp;
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
