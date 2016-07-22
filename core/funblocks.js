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
  var staticBlocks = ["type_number", "type_text", "type_bool", "type_product", "type_sum"];
  staticBlocks.forEach(function(blockName){
    Blockly.FunBlocks.addBlockToXML(blockName, xmlList);
  });

  /*'<xml>' +
         '<block type="block_variable">' +
           '<field name="NAME">' +
             name +
           '</field>' +
         '</block>' +
       '</xml>';*/

  // Generate all constructor
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






  // Test
  var block = goog.dom.createDom('block');
    block.setAttribute('type', 'type_constructor');
    block.setAttribute('items', 10);
    block.setAttribute('output', 'Text');
    block.setAttribute('gap', 16);

    var mutation = goog.dom.createDom('mutation');
    mutation.setAttribute('items',2);

    var n = goog.dom.createDom('type');
    n.setAttribute('name','Color');
    var s = goog.dom.createDom('type');
    s.setAttribute('name','Bool');
    mutation.appendChild(n);
    mutation.appendChild(s);

    block.appendChild(mutation);
    xmlList.push(block);


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



