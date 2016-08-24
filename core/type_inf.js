/**
 * @fileoverview Classes for representing type expressions and type variables.
 */
'use strict';

goog.provide('Blockly.TypeInf');
goog.provide('RColor');

goog.require('Type');



Blockly.TypeInf.toDom = function(type){
   var typeDom = goog.dom.createDom('type');
   if(type.isLiteral()){
     typeDom.setAttribute('type', 'literal');
     typeDom.setAttribute('name', type.getLiteralName());

     type.getLiteralChildren().forEach(function(child){
       typeDom.appendChild(Blockly.TypeInf.toDom(child));
     });
   }
   else if(type.isFunction()){
     typeDom.setAttribute('type', 'function');
     typeDom.appendChild(Blockly.TypeInf.toDom(type.getFirst()));
     typeDom.appendChild(Blockly.TypeInf.toDom(type.getSecond()));
   }
   else if(type.isTypeVar()){
     typeDom.setAttribute('type', 'var');
     typeDom.setAttribute('var', type.getTypeVar());
   }
   else
     throw "Unknown type";

   return typeDom;
}

Blockly.TypeInf.fromDom = function(element){
  var type = element.getAttribute('type');
  if(type == 'literal'){
    var name = element.getAttribute('name');
    var childNodes = element.childNodes;
    var children = []
    childNodes.forEach(function(childNode){
      children.push(Blockly.TypeInf.fromDom(childNode));
    });
    return Type.Lit(name,children);
  }
  else if (type == 'function'){
    var fst = Blockly.TypeInf.fromDom(element.childNodes[0]);
    var snd = Blockly.TypeInf.fromDom(element.childNodes[1]);
    return Type.Func(fst, snd);

  }
  else if (type == 'var'){
    var name = element.getAttribute('var');
    return Type.Var(name);

  }
  throw "Unknown type" + type;
}


Blockly.TypeInf.activeVars = {};
Blockly.TypeInf.getTypeVarColor = function(name) {
  if(Blockly.TypeInf.activeVars[name])
    return Blockly.TypeInf.activeVars[name];
  // Otherwise generate a random color
  var col_ = new RColor();
  var col = col_.get(true);
  Blockly.TypeInf.activeVars[name] = col;
  return col;
};


/**
 * @param {Blockly.Block} block - A block that is part of the component
 */
Blockly.TypeInf.UnifyComponent = function(block){
  var blocks = Blockly.TypeInf.getComponent(block);
  // blocks.forEach(function(b){
  //    console.log(b.type);
  //    console.log(b.getType().toString());
  // }); 
  var subs = blocks.map(b => b.getSubstitutions());
  var s = subs[0];
  for(var i = 1; i < subs.length; i++){
    s = Type.composeSubst(s,subs[i]);
  }

  blocks.forEach(b => b.applySubst(s));
  blocks.forEach(b => b.render());
  blocks.forEach(b => b.redrawAdditional());
}


Blockly.TypeInf.connectComponent = function(block){
  Blockly.TypeInf.UnifyComponent(block);
}

Blockly.TypeInf.disconnectComponent = function(parentBlock, childBlock){
  Blockly.TypeInf.resetComponent(childBlock);
  Blockly.TypeInf.resetComponent(parentBlock);
  // Now we have two components
  // Unify here !
  Blockly.TypeInf.UnifyComponent(childBlock);
  Blockly.TypeInf.UnifyComponent(parentBlock);
};

Blockly.TypeInf.getComponent = function(block){
  var father = Blockly.TypeInf.getGrandParent(block);  
  var blocks = Blockly.TypeInf.getBlocksDown(father);
  blocks.push(father);
  return blocks;
}

Blockly.TypeInf.resetComponent = function(block){
  var blocks = Blockly.TypeInf.getComponent(block);
  blocks.forEach(function(b){
    b.initArrows();
    b.render();
  });
};

Blockly.TypeInf.getGrandParent = function(block){
  if(!block.outputConnection)
    return block;
  if(!block.outputConnection.isConnected())
    return block;
  else
    return Blockly.TypeInf.getGrandParent(block.outputConnection.targetBlock());
};

Blockly.TypeInf.getBlocksDown = function(block){

  var bs = [];
  block.inputList.forEach(function(inp){
    if(inp.connection && inp.connection.targetBlock())
      bs.push(inp.connection.targetBlock());
  });

  var cs = [];
  bs.forEach(function(b){
    cs = cs.concat( Blockly.TypeInf.getBlocksDown(b));
  });

  return bs.concat(cs);

}


Blockly.TypeInf.builtinTypes = {};
// ensure globals have different types otherwise the environment gets confused
Blockly.TypeInf.builtinTypes['undef'] = Type.Var("z");

Blockly.TypeInf.defineFunction = function(functionName, type){
  Blockly.TypeInf.builtinTypes[functionName] = type;
}



/**
 * @constructor
 */
RColor = function() {
  this.hue = Math.random();
  this.goldenRatio = 0.618033988749895;
  this.hexwidth	= 2;
}; 


RColor.prototype.hsvToRgb = function (h,s,v) {
  var	h_i	= Math.floor(h*6),
	f 	= h*6 - h_i,
	p	= v * (1-s),
	q	= v * (1-f*s),
	t	= v * (1-(1-f)*s),
	r	= 255,
	g	= 255,
	b	= 255;
  switch(h_i) {
    case 0:	r = v, g = t, b = p;	break;
    case 1:	r = q, g = v, b = p;	break;
    case 2:	r = p, g = v, b = t;	break;
    case 3:	r = p, g = q, b = v;	break;
    case 4: r = t, g = p, b = v;	break;
    case 5: r = v, g = p, b = q;	break;
  }
  return [Math.floor(r*256),Math.floor(g*256),Math.floor(b*256)];
};

RColor.prototype.padHex = function(str) {
  if(str.length > this.hexwidth) return str;
  return new Array(this.hexwidth - str.length + 1).join('0') + str;
};

RColor.prototype.get = function(hex,saturation,value) {
  this.hue += this.goldenRatio;
  this.hue %= 1;
  if(typeof saturation !== "number")	saturation = 0.5;
  if(typeof value !== "number")		value = 0.95;
  var rgb = this.hsvToRgb(this.hue,saturation,value);
  if(hex)
    return "#" + this.padHex(rgb[0].toString(16))
               + this.padHex(rgb[1].toString(16))
  	       + this.padHex(rgb[2].toString(16));
  else 
    return rgb;
};



