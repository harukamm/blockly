/*
 * Copyright 2016 The CodeWorld Authors. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

goog.provide('Blockly.Blocks.Types');

goog.require('Blockly.Blocks');


Blockly.Blocks['type_list'] = {
  init: function() {
    this.setColour(60);
    this.setOutput(true);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('List', 'blocklyTextEmph'), 'NAME');
    this.appendValueInput('TP');
    this.setInputsInline(true);
    this.setTooltip('A list data type');

    this.arrows = Type.fromList([Type.Lit("Type"), Type.Lit("Type")]);
  },
  getType: function(){
    if(!this.getInput('TP').connection.isConnected())
      return Type.Lit("list", [Type.Var("a")]);
    var targTp = this.getInput('TP').connection.targetBlock().getType();
    return Type.Lit('list',[targTp]);
  }
};

Blockly.Blocks['type_user'] = {
  init: function() {
    this.setColour(60);
    this.setOutput(true);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('User', 'blocklyTextEmph'), 'NAME');
    this.setAsLiteral("Type");
    this.setTooltip('A simple data type');
  },
  domToMutation: function(xmlElement) {
    var name = xmlElement.getAttribute('name');
    this.setFieldValue(name, 'NAME');
  },
  mutationToDom: function(){
    var container = document.createElement('mutation');
    container.setAttribute('name', this.getFieldValue('NAME'));
    return container;
  },
  getType: function(){
    return Type.Lit(this.getFieldValue('Name'));
  }
};

// Product of types
Blockly.Blocks['type_product'] = {
  init: function() {
    this.setColour(90);
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('Constructor', Blockly.UserTypes.renameProduct), 'CONSTRUCTOR')
    this.appendValueInput('TP0');
    this.appendValueInput('TP1');
    this.setOutput(true);

    this.arrows = Type.fromList([Type.Lit("Type"), Type.Lit("Type"), Type.Lit("Product")]);
    
    this.setInputsInline(true);
    this.setMutator(new Blockly.Mutator(['tp_create_with_field']));
    this.setTooltip('Add a term to an algabraic data type');
    this.itemCount_ = 2;
    this.allowRename = false;
  },

  fixName: function() {
    var newName = Blockly.UserTypes.findConstructorName(this.getFieldValue('CONSTRUCTOR'),this);
    this.getField('CONSTRUCTOR').setValue(newName);
  },
  

  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  domToMutation: function(xmlElement) {
    for (var x = 0; x < this.itemCount_; x++) {
      this.removeInput('TP' + x);
    }
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    var tps = [];
    for (var x = 0; x < this.itemCount_; x++) {
      var input = this.appendValueInput('TP' + x);
      tps.push(Type.Lit("Type"));
    }
    tps.push(Type.Lit("Product"));
    this.arrows = Type.fromList(tps);
    this.initArrows();
  },
  decompose: function(workspace) {
    var containerBlock =
        workspace.newBlock('tp_create_with_container_product');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = workspace.newBlock('tp_create_with_field');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    if (this.itemCount_ == 0) {
    } else {
      for (var x = this.itemCount_ - 1; x >= 0; x--) {
        this.removeInput('TP' + x);
      }
    }
    this.itemCount_ = 0;
    // Rebuild the block's inputs.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var tps = [];
    while (itemBlock) {
      var input = this.appendValueInput('TP' + this.itemCount_);
      tps.push(Type.Lit("Type"));
      // Reconnect any child blocks.
      if (itemBlock.valueConnection_) {
        input.connection.connect(itemBlock.valueConnection_);
      }
      this.itemCount_++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    tps.push(Type.Lit("Product"));
    this.arrows = Type.fromList(tps);
    this.initArrows();
    this.renderMoveConnections_();
  },
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (itemBlock) {
      var input = this.getInput('TP' + x);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  },
  onCreate: function(){
    var newName = Blockly.UserTypes.findConstructorName(this.getFieldValue('CONSTRUCTOR'),this);
    this.setFieldValue(newName /**/, 'CONSTRUCTOR');
    this.allowRename = true;
  }


};

Blockly.Blocks['tp_create_with_container_variants'] = {
  /**
   * Mutator block for list container.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.lists.HUE);
    this.appendDummyInput()
        .appendField('Sum');
    this.appendStatementInput('STACK');
    this.setTooltip('Contains a list of variants which make up the sum type');
    this.contextMenu = false;
  }
};

Blockly.Blocks['tp_create_with_container_product'] = {
  init: function() {
    this.setColour(Blockly.Blocks.lists.HUE);
    this.appendDummyInput()
        .appendField('Product');
    this.appendStatementInput('STACK');
    this.setTooltip('Contains a list of fields that make up the product type');
    this.contextMenu = false;
  }
};

Blockly.Blocks['tp_create_with_field'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.lists.HUE);
    this.appendDummyInput()
        .appendField('field');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('A data type');
    this.contextMenu = false;
  }
};

Blockly.Blocks['tp_create_with_variant'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.lists.HUE);
    this.appendDummyInput()
        .appendField('variant');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('A data type');
    this.contextMenu = false;
  }
};

/* 
 * Custom user data type
 * Mutator allows mutable products to be added
 */
Blockly.Blocks['type_sum'] = {
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('UserType',Blockly.UserTypes.renameType), 'NAME');
    this.appendValueInput('PROD0')
        .appendField('|')
        .setAlign(Blockly.ALIGN_RIGHT);
    this.setOutput(false);
    this.setMutator(new Blockly.Mutator(['tp_create_with_variant']));
    this.setTooltip('Define a specific data type');
    this.itemCount_ = 1;
    this.allowRename = false;

    this.arrows = Type.fromList([Type.Lit("Product"), Type.Lit("Sum")]);
  },

  fixName: function() {
    var newName = Blockly.UserTypes.findTypeName(this.getFieldValue('NAME'),this);
    this.getField('NAME').setValue(newName);
  },
  
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    container.setAttribute('name', this.getFieldValue('NAME'));
    return container;
  },
  domToMutation: function(xmlElement) {
    for (var x = 0; x < this.itemCount_; x++) {
      this.removeInput('PROD' + x);
    }
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    var tps = [];
    for (var x = 0; x < this.itemCount_; x++) {
      var input = this.appendValueInput('PROD' + x)
                      .appendField('|')
                      .setAlign(Blockly.ALIGN_RIGHT);
      tps.push(Type.Lit("Product"));
    }
    tps.push(Type.Lit("Sum"));
    this.arrows = Type.fromList(tps);
    this.initArrows();
  
  },
  decompose: function(workspace) {
    var containerBlock =
        workspace.newBlock('tp_create_with_container_variants');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = workspace.newBlock('tp_create_with_variant');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    if (this.itemCount_ == 0) {
    } else {
      for (var x = this.itemCount_ - 1; x >= 0; x--) {
        this.removeInput('PROD' + x);
      }
    }
    this.itemCount_ = 0;
    // Rebuild the block's inputs.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var tps = [];
    while (itemBlock) {
      var input = this.appendValueInput('PROD' + this.itemCount_)
                      .appendField('|')
                      .setAlign(Blockly.ALIGN_RIGHT);
      tps.push(Type.Lit("Product"));
      // Reconnect any child blocks.
      if (itemBlock.valueConnection_) {
        input.connection.connect(itemBlock.valueConnection_);
      }
      this.itemCount_++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    tps.push("Sum");
    this.arrows = Type.fromList(tps);
    this.initArrows();
    this.renderMoveConnections_();
    Blockly.UserTypes.mutateCases(this);
  },
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (itemBlock) {
      var input = this.getInput('PROD' + x);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    // Assign 'this' to a variable for use in the tooltip closure below.
  },
  onCreate: function(){
    var newName = Blockly.UserTypes.findTypeName(this.getFieldValue('NAME'),this);
    this.setFieldValue(newName /**/, 'NAME');
    this.allowRename = true;
  }
};

Blockly.Blocks['expr_constructor'] = {
  init: function() {
    this.setColour(90);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('Case of', 'blocklyTextEmph'),'NAME');
    this.appendValueInput('TP0');
    this.appendValueInput('TP1');
    this.setOutput(true);

    this.setInputsInline(true);
    this.setTooltip('Construct a specific data type');
    this.itemCount_ = 2;
  },

  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    container.setAttribute('name', this.getFieldValue('NAME'));
    container.setAttribute('output', this.outputConnection.typeExpr.name);

    for (var i = 0; i < this.itemCount_; i++) {
      var tp = this.getInput("TP" + i).connection.typeExpr; 
      container.appendChild( Blockly.TypeInf.toDom(tp));
    }
    return container;
  },
  getUserType: function(){
    return this.outputConnection.typeExpr.name;
  },
  domToMutation: function(xmlElement) {
    for (var x = 0; x < this.itemCount_; x++) {
      this.removeInput('TP' + x);
    }

    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    this.setFieldValue(xmlElement.getAttribute('name'), 'NAME');

    var tps = [];
    for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'type') {
        var typename = childNode.getAttribute('name');

        var typeExpr = Blockly.TypeInf.fromDom(childNode);
        var input = this.appendValueInput('TP' + i);
        tps.push(typeExpr);
      }
    }
    tps.push(Type.Lit(xmlElement.getAttribute('output')));
    this.arrows = Type.fromList(tps);
    this.initArrows();
  },

  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (itemBlock) {
      var input = this.getInput('TP' + x);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  }
};

Blockly.Blocks['expr_case'] = {
  init: function() {
    this.setColour(190);
    this.a = Type.Var('a');
    this.appendValueInput('INPUT')
        .appendField(new Blockly.FieldLabel('Case of', 'blocklyTextEmph'))
        .appendField(new Blockly.FieldLabel('Maybe', 'blocklyTextEmph'), 'NAME');
    var f = new Blockly.FieldVarInput('a');
    f.type = 'Number';
    this.appendValueInput('CS0')
        .appendField('Just')
        .appendField(' ')
        .appendField(f);
    this.appendValueInput('CS1')
        .appendField('Nothing');
    this.setOutput(true);
    this.setTooltip('Decompose a data type piecewise');
    this.itemCount_ = 2;

    this.arrows = Type.fromList([Type.Lit("Maybe"), this.a, this.a, this.a ]);

  },

  getInputConstructor: function(index){
    return this.getInput('CS' + index).fieldRow[0].getValue();
  },

  getUserType: function(){
    return this.getInput('INPUT').connection.typeExpr.name;
  },

  getInputVars: function(index){
    var vars = [];
    var inp = this.getInput('CS' + index);
    
    for(var j = 1; j < inp.fieldRow.length; j++){
      if(inp.fieldRow[j].getValue() == '' || inp.fieldRow[j].getValue() == ' ') continue; // Skip spaces

      vars.push(inp.fieldRow[j].getValue());
    }
    return vars;
  },

  getVars: function(connection){
    var i = 0;
    for(i = 0; i < this.itemCount_; i++){
      if(this.getInput('CS' + i).connection == connection){
        return this.getInputVars(i);
      }
    }
    return [];
  },

  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('name', this.getFieldValue('NAME'));
    container.setAttribute('items', this.itemCount_);

    for (var i = 0; i < this.itemCount_; i++) {

      var prodDom = document.createElement('product');
      var inp = this.getInput('CS' + i);
      var constructorName = inp.fieldRow[0].getValue();
      var its = 0;
      for(var j = 1; j < inp.fieldRow.length; j++){
        if(inp.fieldRow[j].getValue() == '' || inp.fieldRow[j].getValue() == ' ') continue; // Skip spaces
        var tp = inp.fieldRow[j].getType();
        its++;

        var typeDom = Blockly.TypeInf.toDom(tp);
        prodDom.appendChild(typeDom);
      }
      prodDom.setAttribute('constructor',constructorName); 
      prodDom.setAttribute('items',its); 
      container.appendChild(prodDom);
    }
    return container;
  },

  domToMutation: function(xmlElement) {
    for (var x = 0; x < this.itemCount_; x++) {
      this.removeInput('CS' + x);
    }

    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    var name = xmlElement.getAttribute('name');
    this.setFieldValue(name, 'NAME');
    var tps = [];
    tps.push(Type.Lit(name));
    for (var i = 0, productNode; productNode = xmlElement.childNodes[i]; i++) {
      if (productNode.nodeName.toLowerCase() == 'product') {
        var constructorName = productNode.getAttribute('constructor');

        var input = this.appendValueInput('CS' + i);
        tps.push(this.a);

        input.appendField(constructorName);
        
        for(var j = 0, typeNode; typeNode = productNode.childNodes[j]; j++){
          if(typeNode.nodeName.toLowerCase() != 'type') continue;
          var tp = Blockly.TypeInf.fromDom(typeNode);
          input.appendField(' ');
          input.appendField(new Blockly.FieldVarInput(String.fromCharCode(97 + j),tp));
        }
      }
      
      tps.push(this.a);
      this.arrows = Type.fromList(tps);
      this.initArrows();
    }
  },

  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (itemBlock) {
      var input = this.getInput('CS' + x);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  },

  onchange: function(changeEv){

    for (var i = 0; i < this.itemCount_; i++) {
      var inp = this.getInput('CS' + i);

      var exc = [];
      for(var j = 1; j < inp.fieldRow.length; j++){
        if(inp.fieldRow[j].getValue() == '' || inp.fieldRow[j].getValue() == ' ') 
           continue; // Skip spaces

        var name = inp.fieldRow[j].getValue();
        var varname = Blockly.Procedures.getUnusedVar(this.outputConnection, exc); 
        exc.push(varname); // Can't use again
        inp.fieldRow[j].setValue(varname);
      }
    }
  }
};


/**
* Pairs
*/
Blockly.Blocks['pair_create_typed'] = {
 /**
  * Block for ternary operator.
  * @this Blockly.Block
  */
 init: function() {
   this.setColour(210);
   this.appendValueInput('FIRST')
       .appendField(new Blockly.FieldLabel('(', 'blocklyTextEmph') );
   this.appendValueInput('SECOND')
       .appendField(new Blockly.FieldLabel(',', 'blocklyTextEmph') )
   this.appendDummyInput()
       .appendField(new Blockly.FieldLabel(')','blocklyTextEmph') );
   this.setOutput(true);
   this.setInputsInline(true);
   this.functionName = ",";
   Blockly.TypeInf.defineFunction(",", Type.fromList([Type.Var("a"), Type.Var("b"), Type.Lit("pair", [Type.Var("a"), Type.Var("b")])]));
   this.setAsFunction(",");
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
        .appendField(new Blockly.FieldLabel("firstOfPair","blocklyTextEmph") );
    this.setOutput(true);

    Blockly.TypeInf.defineFunction("fst", Type.fromList([Type.Lit("pair", [Type.Var("a"), Type.Var("b")]), Type.Var("a")]));
    this.setAsFunction("fst");
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
        .appendField(new Blockly.FieldLabel("secondOfPair","blocklyTextEmph") );
    this.setOutput(true);

    Blockly.TypeInf.defineFunction("fst", Type.fromList([Type.Lit("pair", [Type.Var("a"), Type.Var("b")]), Type.Var("a")]));
    this.setAsFunction("fst");
  }
};


