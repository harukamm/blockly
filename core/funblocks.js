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

goog.provide('Blockly.FunBlocks');

goog.require('Blockly.Blocks');
goog.require('Blockly.Field');
goog.require('Blockly.Names');
goog.require('Blockly.Workspace');

Blockly.FunBlocks.dataFlyoutCategory = function(workspace){

  var xmlList = [];
  var staticBlocks = ["type_sum", "type_number", "type_text", "type_bool", "type_product"];
  staticBlocks.forEach(function(blockName){
    Blockly.FunBlocks.addBlockToXML(blockName, xmlList);
  });

  // Generate a case for each data type
  Blockly.FunBlocks.generateCases(xmlList);

  // Generate all constructor
  Blockly.FunBlocks.generateConstructors(xmlList);
  return xmlList;
};



Blockly.FunBlocks.addBlockToXML = function(blockName, xmlList){
  if (Blockly.Blocks[blockName]) {
    var block = goog.dom.createDom('block');
    block.setAttribute('type', blockName);
    block.setAttribute('gap', 16);
    xmlList.push(block);

  }
};


Blockly.FunBlocks.generateCases = function(xmlList){
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
      block.setAttribute('type','type_case');
      block.setAttribute('gap',16);
      block.appendChild(mutation);

      xmlList.push(block);
    }
  });


}


Blockly.FunBlocks.generateConstructors = function(xmlList){
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
        block.setAttribute('type', 'type_constructor');
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
