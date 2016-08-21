/**
 * @fileoverview Classes for representing type expressions and type variables.
 */
'use strict';

goog.provide('Blockly.TypeExpr');
goog.provide('Blockly.TypeVar');

goog.require('Type');


Blockly.TypeExpr = function(name, children /* = [] */ ) {
  this.name = name;
  this.children = arguments.length == 2 ? children : [];
  // this.inputs = [new Blockly.TypeExpr('NumberSmall'), new Blockly.TypeExpr('NumberSmall')];
  this.inputs = [];
}

Blockly.TypeExpr.prototype.toDom = function(){
   var typeDom = goog.dom.createDom('type');
   typeDom.setAttribute('name', this.name);

   this.children.forEach(function(child){
      typeDom.appendChild(child.toDom());
   });

   return typeDom;
}

Blockly.TypeExpr.fromDom = function(element){
  var name = element.getAttribute('name');
  var childNodes = element.childNodes;

  var children = []
  childNodes.forEach(function(childNode){
    children.push(Blockly.TypeExpr.fromDom(childNode));
  });

  return new Blockly.TypeExpr(name,children);
}

Blockly.TypeExpr.prototype.isTypeVar = function() {
  return this.name in Blockly.TypeVar.getTypeVarDB_();
}

Blockly.TypeVar.getTypeVarColor = function(name) {
  return "Navy";
}

