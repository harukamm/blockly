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

/**
 * @fileoverview Functions for letting defining user types.
 * @author stefanjacholke@gmail.com (Stefan Jacholke)
 */
'use strict';

goog.provide('Blockly.UserTypes');

goog.require('Blockly.Blocks');
goog.require('Blockly.Field');
goog.require('Blockly.Names');
goog.require('Blockly.Workspace');


/**
 * Returns an xml list of blocks for the types flyout.
 * @param {!Blockly.Workspace} workspace The workspace, it gets ignored though
 */
Blockly.UserTypes.dataFlyoutCategory = function(workspace){

  var xmlList = [];
  var staticBlocks = ["type_sum", "type_product", "type_list"];
  staticBlocks.forEach(function(blockName){
    Blockly.UserTypes.addBlockToXML(blockName, xmlList);
  });

  var userBlocks = ["Bool", "Number", "Color", "Picture", "Text"];
  userBlocks.forEach(function(name){
    Blockly.UserTypes.addUserType(name, xmlList);
  });

  // Generate a type block for each user data type
  Blockly.UserTypes.addUserTypes(xmlList);

  // Generate a case for each data type
  Blockly.UserTypes.generateCases(xmlList);

  // Generate all constructor
  Blockly.UserTypes.generateConstructors(xmlList);

  return xmlList;
};

/**
 * Adds the specified block name to the xmlList.
 * @param {!String} blockName The type of the block
 * @param {!Object} xmlList List of current blocks
 */
Blockly.UserTypes.addBlockToXML = function(blockName, xmlList){
  if (Blockly.Blocks[blockName]) {
    var block = goog.dom.createDom('block');
    block.setAttribute('type', blockName);
    block.setAttribute('gap', 16);
    xmlList.push(block);

  }
};

Blockly.UserTypes.addUserType = function(name, xmlList){
    var mutation = goog.dom.createDom('mutation');
    mutation.setAttribute('name',name);

    var block = goog.dom.createDom('block');
    block.setAttribute('type','type_user');
    block.setAttribute('gap',16);
    block.appendChild(mutation);

    xmlList.push(block);
}

/**
 * Adds the user specified types on the main workspace to the toolbox.
 * @param {!Object} xmlList List of current blocks
 */
Blockly.UserTypes.addUserTypes = function(xmlList){
  var blocks = Blockly.getMainWorkspace().getTopBlocks();
  blocks.forEach(function(block){
    if (block.type == 'type_sum')
    {
      var name = block.getFieldValue('NAME');
      Blockly.UserTypes.addUserType(name, xmlList);
    }
  });
};

/**
 * Adds the a case block for each user defined type to the toolbox 
 * @param {!Object} xmlList List of current blocks
 */
Blockly.UserTypes.generateCases = function(xmlList){
  var blocks = Blockly.getMainWorkspace().getTopBlocks();
  blocks.forEach(function(block){
    if (block.type == 'type_sum')
    {
      var name = block.getFieldValue('NAME');
      var mutation = goog.dom.createDom('mutation');
      mutation.setAttribute('name',block.getFieldValue('NAME'));
      var count = 0;
      for(var i = 0; i < block.itemCount_; i++) {
        var product = block.getInputTargetBlock('PROD' + i);
        if(!product) continue; // Maybe error here 
        var prodDom = goog.dom.createDom('product');
        prodDom.setAttribute('constructor', product.getFieldValue('CONSTRUCTOR'));

        // Get product types
        var typeCount = 0;
        for(var j = 0; j < product.itemCount_; j++)
        {
          var typeBlock = product.getInputTargetBlock('TP' + j);
          if(!typeBlock)
            continue;
          var typeDom = goog.dom.createDom('type');
          var typeName = typeBlock.getFieldValue('NAME');
          typeDom.setAttribute('name',name);
          prodDom.appendChild(typeDom);
          typeCount++;
        }
        prodDom.setAttribute('items',typeCount);
        mutation.appendChild(prodDom); 
        count++;
      }
      mutation.setAttribute('items',count);
      var block = goog.dom.createDom('block');
      block.setAttribute('type','expr_case');
      block.setAttribute('gap',16);
      block.appendChild(mutation);

      xmlList.push(block);
    }
  });
};

/**
 * Adds a constructor block for each user defined product type to the toolbox 
 * @param {!Object} xmlList List of current blocks
 */
Blockly.UserTypes.generateConstructors = function(xmlList){
  var blocks = Blockly.getMainWorkspace().getAllBlocks(false);
  blocks.forEach(function(block){
    if(block.type == 'type_product')
    {
      if(block.outputConnection.isConnected())
      {
        var parentBlock = block.outputConnection.targetBlock();
        var userTypeName = parentBlock.getFieldValue('NAME');

        var name = block.getFieldValue('CONSTRUCTOR');
        var types = [];
        
        for(var i =0; i < block.itemCount_; i++){
          var typeBlock = block.getInputTargetBlock('TP' + i);
          if(!typeBlock) continue;
          var typeName = typeBlock.getFieldValue('NAME');
          types.push(typeName);
        }

        // Create dom
        var block = goog.dom.createDom('block');
        block.setAttribute('type', 'expr_constructor');
        block.setAttribute('items', 10);
        block.setAttribute('gap', 16);
        var mutation = goog.dom.createDom('mutation');
        mutation.setAttribute('items',types.length);
        mutation.setAttribute('name',name );
        mutation.setAttribute('output',userTypeName);
        types.forEach(function(type){
          var tp = goog.dom.createDom('type');
          tp.setAttribute('name',type);
          mutation.appendChild(tp);
        });
        block.appendChild(mutation);
        xmlList.push(block);
      }
    }
  });
};
