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

goog.provide('Blockly.Blocks.cwLists');

goog.require('Blockly.Blocks');

var listsHUE = 260;


Blockly.Blocks['lists_comprehension'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(listsHUE);
    this.vars_ = ['x','y','z'];
    this.varTypes_ = [Blockly.TypeVar.getUnusedTypeVar(),Blockly.TypeVar.getUnusedTypeVar(),Blockly.TypeVar.getUnusedTypeVar()];
    var OUT = Blockly.TypeVar.getUnusedTypeVar();
    this.appendValueInput("DO")
        .appendField(new Blockly.FieldLabel("List Comprehension","blocklyTextEmph"))
        .setTypeExpr(OUT);
    this.appendValueInput('VAR0')
          .setTypeExpr(new Blockly.TypeExpr ("list", [this.varTypes_[0]]))
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(new Blockly.FieldVarInput(this.vars_[0],null,this.varTypes_[0]))
          .appendField('\u2190');
    this.appendValueInput('VAR1')
          .setTypeExpr(new Blockly.TypeExpr ("list", [this.varTypes_[1]]))
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(new Blockly.FieldVarInput(this.vars_[1],null,this.varTypes_[1]))
          .appendField('\u2190');
    this.setOutput(true, 'Array');
    this.setOutputTypeExpr( new Blockly.TypeExpr("list", [OUT]) );
    this.setMutator(new Blockly.Mutator(['lists_comp_var', 'lists_comp_guard']));
    this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_TOOLTIP);
    this.varCount_ = 2;
    this.guardCount_ = 0;
  },

  getVars: function(connection){
    var i = 0;
    for(i = 0; i < this.varCount_; i++){
      if(this.getInput('DO').connection == connection)
        return this.vars_;
      if(this.getInput('VAR' + i).connection == connection)
        return [this.vars_[i]];
      
    }
    return [];
  },
  /**
   * Create XML to represent list inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('guardcount', this.guardCount_);
    container.setAttribute('varcount', this.varCount_);

    for (var i = 0; i < this.varCount_; i++) {
      var parameter = document.createElement('var');
      parameter.setAttribute('name', this.vars_[i]);
      
      container.appendChild(parameter);
    }

    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {

    for (var x = 0; x < this.varCount_; x++) {
      this.removeInput('VAR' + x);
    }
    for (var x = 0; x < this.guardCount_; x++) {
      this.removeInput('GUARD' + x);
    }
    this.vars_ = [];
    this.varTypes_ = [];

    this.varCount_ = parseInt(xmlElement.getAttribute('varcount'), 10);
    this.guardCount_ = parseInt(xmlElement.getAttribute('guardcount'), 10);

    for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'var') {
        var name = childNode.getAttribute('name');

        this.varTypes_.push(Blockly.TypeVar.getUnusedTypeVar());

        var input = this.appendValueInput('VAR' + i)
            .setTypeExpr(new Blockly.TypeExpr ("list", [this.varTypes_[i]]))
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(new Blockly.FieldVarInput(name, null, this.varTypes_[i]))
            .appendField('\u2190');
        this.vars_.push(name);
      }
    }

    for (var x = 0; x < this.guardCount_; x++){
      var input = this.appendValueInput('GUARD' + x)
                      .setTypeExpr(new Blockly.TypeExpr ("Bool"))
                      .setAlign(Blockly.ALIGN_RIGHT)
                      .appendField('If');
    }


  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock =
        workspace.newBlock('lists_create_with_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;

    for (var x = 0; x < this.varCount_; x++) {
      var itemBlock = workspace.newBlock('lists_comp_var');
      itemBlock.setFieldValue(this.vars_[x], 'NAME');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    for (var x = 0; x < this.guardCount_; x++) {
      var itemBlock = workspace.newBlock('lists_comp_guard');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }

    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    // Disconnect all input blocks and remove all inputs.
    for (var x = this.varCount_ - 1; x >= 0; x--) {
      this.removeInput('VAR' + x);
    }
    for (var x = this.guardCount_ - 1; x >= 0; x--) {
      this.removeInput('GUARD' + x);
    }
    this.vars_ = [];
    this.varTypes_ = [];

    this.varCount_ = 0;
    this.guardCount_ = 0;
    // Rebuild the block's inputs.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    while (itemBlock) {
      if(itemBlock.type == 'lists_comp_var')
      {
        this.varTypes_.push(Blockly.TypeVar.getUnusedTypeVar());

        var name = itemBlock.getFieldValue('NAME');
        this.vars_[this.varCount_] = name;
        var input = this.appendValueInput('VAR' + this.varCount_)
            .setTypeExpr(new Blockly.TypeExpr ("list", [this.varTypes_[this.varCount_]]))
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(new Blockly.FieldVarInput(name, null, this.varTypes_[this.varCount_]))
            .appendField('\u2190');

        this.vars_.push(name);
        // Reconnect any child blocks.
        if (itemBlock.valueConnection_) {
          input.connection.connect(itemBlock.valueConnection_);
        }
        this.varCount_++;
      }
      else if(itemBlock.type == 'lists_comp_guard')
      {
          var input = this.appendValueInput('GUARD' + this.guardCount_)
                          .setTypeExpr(new Blockly.TypeExpr ("Bool"))
                          .setAlign(Blockly.ALIGN_RIGHT)
                          .appendField('If');
          if (itemBlock.valueConnection_) {
            input.connection.connect(itemBlock.valueConnection_);
          }
          this.guardCount_++;
      }

      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    this.renderMoveConnections_();
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (itemBlock) {
      var input = this.getInput('VAR' + x);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  }
};

Blockly.Blocks['lists_comp_var'] = {
  /**
   * Mutator block for procedure argument.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('x'), 'NAME')
        .appendField('\u2190');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(listsHUE);
    this.setTooltip('Assign a binding to a list');
    this.contextMenu = false;
  }
};

Blockly.Blocks['lists_comp_guard'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(listsHUE);
    this.appendDummyInput()
        .appendField("Guard");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Guard against a boolean expression");
    this.contextMenu = false;
  }
};





Blockly.Blocks['variables_get_lists'] = {
  /**
   * Block for variable getter.
   * @this Blockly.Block
   */
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
  },

  createDropdownChangeFunction: function() {
    var self = this;
    return function(text) {
    var par = self.getParent();
    var varList = [];
    // get type of most immediate parent declaring the variable
    while(par)
    {
      if(par.type == "lists_comprehension")
      {
        for(var i =0; i < par.varCount_; i++)
        {
          if(par.vars_[i] == text)
          {
            var inp = par.getInput("VAR" + i);

            var tp = inp.getTypeExpr().children[0];

            self.setOutputTypeExpr(tp);
            self.setColourByType(tp);

            self.outputConnection.targetConnection.setTypeExpr(tp); // This actually changes the connector, but not the output expressino of the block

            par.render();
            self.render();

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

    var par = this.master.getParent();

    var varList = [];

    while(par)
    {
      if(par.type == "lists_comprehension")
      {
        for(var i =0; i < par.varCount_; i++)
        {
          varList.push([par.vars_[i], par.vars_[i]]);
        }
      }
      par = par.getParent();
    }
    if(varList.length < 1)
      return def;
    return varList;
  }
};

Blockly.Blocks['lists_numgen'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("[");
    this.appendValueInput("LEFT")
        .setTypeExpr(new Blockly.TypeExpr('Number'));
    this.appendValueInput("RIGHT")
        .appendField("...")
        .setTypeExpr(new Blockly.TypeExpr('Number'));
    this.appendDummyInput()
        .appendField("]");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr('list',[new Blockly.TypeExpr('Number')]));
    this.setColour(listsHUE);
    this.setTooltip('Generates a list of numbers between the first and second inputs');
  }
};

Blockly.Blocks['lists_path'] = {
  init: function() {
    this.setColour(160);
    var pair = new Blockly.TypeExpr('pair', [new Blockly.TypeExpr('Number'), new Blockly.TypeExpr('Number')]);
    this.appendValueInput('LST')
        .setTypeExpr(new Blockly.TypeExpr('list',[pair]))
        .appendField(new Blockly.FieldLabel("Path","blocklyTextEmph") );
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr('Picture'));
    this.functionName = "path";
  }
};

Blockly.Blocks['lists_length'] = {
  init: function() {
    var a = Blockly.TypeVar.getUnusedTypeVar();
    this.setColour(210);
    this.appendValueInput('LST')
        .setTypeExpr(new Blockly.TypeExpr('list',[a]))
        .appendField(new Blockly.FieldLabel("Length","blocklyTextEmph") );
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr('Number'));
    this.functionName = "length";
  }
};

Blockly.Blocks['lists_at'] = {
  init: function() {
    var a = Blockly.TypeVar.getUnusedTypeVar();
    this.setColour(210);
    this.appendValueInput('LST')
        .setTypeExpr(new Blockly.TypeExpr('list',[a]));
    this.appendValueInput('POS')
        .setTypeExpr(new Blockly.TypeExpr('Number'))
        .appendField(new Blockly.FieldLabel("at","blocklyTextEmph") );
    this.setOutput(true);
    this.setInputsInline(true);
    this.setOutputTypeExpr(a);
    this.functionName = "at";
  }
};

Blockly.Blocks['lists_cons'] = {
  init: function() {
    var a = Blockly.TypeVar.getUnusedTypeVar();
    this.setColour(210);
    this.appendValueInput('ITEM')
        .setTypeExpr(a);
    this.appendValueInput('LST')
        .setTypeExpr(new Blockly.TypeExpr('list',[a]))
        .appendField(new Blockly.FieldLabel(":","blocklyTextEmph") );
    this.setOutput(true);
    this.setOutputTypeExpr(new Blockly.TypeExpr('Number'));
    this.setInputsInline(true);
    this.functionName = ":";
  }
};



Blockly.Blocks['lists_create_with_typed'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.typeParams = { elmtType: Blockly.TypeVar.getUnusedTypeVar() };
    this.appendValueInput('ADD0')
        .setTypeExpr(this.typeParams.elmtType)
        .appendField(new Blockly.FieldLabel("List","blocklyTextEmph"));
    this.appendValueInput('ADD1')
        .setTypeExpr(this.typeParams.elmtType);
    this.appendValueInput('ADD2')
        .setTypeExpr(this.typeParams.elmtType);
    this.setOutput(true, 'Array');
    this.setOutputTypeExpr(new Blockly.TypeExpr('list', [this.typeParams.elmtType]));
    this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
    this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_TOOLTIP);
    this.itemCount_ = 3;
  },
  /**
   * Create XML to represent list inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    for (var x = 0; x < this.itemCount_; x++) {
      this.removeInput('ADD' + x);
    }
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    for (var x = 0; x < this.itemCount_; x++) {
      var input = this.appendValueInput('ADD' + x)
                      .setTypeExpr(this.typeParams.elmtType);
      if (x == 0) {
        input.appendField("List");
      }
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
          .appendField(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE);
    }
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock =
        workspace.newBlock('lists_create_with_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = workspace.newBlock('lists_create_with_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    // Disconnect all input blocks and remove all inputs.
    if (this.itemCount_ == 0) {
      this.removeInput('EMPTY');
    } else {
      for (var x = this.itemCount_ - 1; x >= 0; x--) {
        this.removeInput('ADD' + x);
      }
    }
    this.itemCount_ = 0;
    // Rebuild the block's inputs.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    while (itemBlock) {
      var input = this.appendValueInput('ADD' + this.itemCount_)
                      .setTypeExpr(this.typeParams.elmtType);
      if (this.itemCount_ == 0) {
        input.appendField("List");
      }
      // Reconnect any child blocks.
      if (itemBlock.valueConnection_) {
        input.connection.connect(itemBlock.valueConnection_);
      }
      this.itemCount_++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
          .appendField("[]");
    }
    this.renderMoveConnections_();
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + x);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  }
};


