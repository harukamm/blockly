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
 * Most general unification
 * @param {Blockly.Block} block - A block that is part of the component
 */
Blockly.TypeInf.mguComponent = function(block){
  throw "obsolete";

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
  // Debug
  // blocks.forEach(b => {
  //   var t = b.getOutputType();
  //   if(t)
  //     console.log(t.toString());
  // });
}


Blockly.TypeInf.isEnabled = true;
Blockly.TypeInf.unifyComponent = function(){throw "obsolete"};

Blockly.TypeInf.getComponent = function(block){
  var father = Blockly.TypeInf.getGrandParent(block);  
  var blocks = Blockly.TypeInf.getBlocksDown(father);
  blocks.push(father);

  return blocks;
}

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


Blockly.TypeInf.testDom = function(){
  var r = Type.fromList([Type.Lit("Int"),Type.Lit("Float"),Type.Var("a")]);
  var y = Type.fromList([Type.Var("a"),Type.Var("b"),Type.Var("a")]);
  // var z = Type.mgu(r,y);
  var k = Type.Lit("Pair",[Type.Var("a"), Type.Var("b")]);
  var l = Type.Lit("Pair",[Type.Lit("Int"), Type.Var("c")]);
  // var m = Type.mgu(k,l);

  var e = l;
  console.log("original: " + e.toString()); 
  var t0 = Blockly.TypeInf.toDom(e);
  console.log('dom: ');
  console.log(t0);
  console.log('recovering: ');
  var t1 = Blockly.TypeInf.fromDom(t0);
  console.log(t1.toString());



}


Blockly.TypeInf.inferWorkspace = function(workspace){
  if(!workspace)
    return;
  if(workspace.isFlyout)
    return;

  Blockly.Events.disable();

  // Setup the environment
  var dic = Blockly.TypeInf.builtinTypes;
  var env = {};
  for (var functionName in dic) {
    if (dic.hasOwnProperty(functionName)) {
      var s = new Scheme(Type.ftv(dic[functionName]), dic[functionName] );
      env[functionName] = s;
    }
  }

  // Add some used things
  env['undef'] = new Scheme(['z'],Type.Var('z'));
  env['[]'] = new Scheme(['a'],Type.Lit('list',[Type.Var('a')]) );
  // Add constructors
  Blockly.TypeInf.addConstructors(env);
  // Add definitions
  Blockly.TypeInf.addBareFunctions(env);
  // Add globally defined environment
  Blockly.TypeInf.addUserDefined(env);
  // Add functions with their inferred types, this is done last so that other
  // functions are already in scope
  Blockly.TypeInf.addFledgedFunctions(env);

  var allBlocks = workspace.getAllBlocks();
  allBlocks.forEach(function(b){
    b.initArrows();
    if(b.outputConnection && b.outputConnection.isConnected()) 
      b.preConnect(b.outputConnection.targetConnection); 
  });

  var topBlocks = workspace.getTopBlocks();

  for(var i = 0; i < topBlocks.length; i++){
    var block = topBlocks[i];

    // Some blocks we skip

    if(block.nextConnection || block.previousConnection || !block.getExpr) 
      continue; //ignore statement blocks
    if(block.type.startsWith("type"))
      continue; // Skip type blocks, they are monomorphic anyway
    if(block.outputConnection)
      continue; // Skip blocks that aren't really top level, e.g. a disconnected vars_local
    if(block.disabled)
      continue; // This one is obvious

    var subs;
    try{
      if(block.warning && block.warning.getText() === 'This program contains type errors')
        block.setWarningText(null);
      subs = Blockly.TypeInf.typeInference(block, env);
    } 
    catch(e){
      console.log('Critical error');
      console.log(env);
      //console.log(block.getExpr().toString());
      console.log(e);
      block.setWarningText('This program contains type errors');
      continue; // Skip this block for now
    }

    // Apply substitutions
    var blocks = Blockly.TypeInf.getComponent(block);
    blocks.forEach(b => b.applySubst(subs));

    // Handle top level function special case
    if(block.type == 'procedures_letFunc'){
      if(block.typeExpr)
        block.updateTypes(Type.apply(subs, block.typeExpr));
    }
  }

  Blockly.TypeInf.redrawBlocks(allBlocks);

  // HACK to manually set outputs !
  // allBlocks.forEach(b => b.rendered = false);
  allBlocks.forEach(function(b){
    if(b.outputConnection && b.outputConnection.isConnected()){
      if(b.type == "procedures_callreturn"){ // An even uglier hack
        b.outputConnection.typeExpr = b.outputConnection.targetConnection.typeExpr;
      }
      else{
        var s = Type.mgu(b.outputConnection.typeExpr, b.outputConnection.targetConnection.typeExpr);
        b.outputConnection.typeExpr = Type.apply(s, b.outputConnection.typeExpr);
      }
    }
  });

  Blockly.Events.enable();
  
}

Blockly.TypeInf.redrawBlocks = function(blocks){
};

// Test HM

/**
 * Applies hindley milner inference to the component containing block
 * Updates connections to match
 */
Blockly.TypeInf.hmComponent = function(block){
  throw "deprecated";

};

Blockly.TypeInf.unificationTest2 = function(){
  var blocks = Blockly.getMainWorkspace().getTopBlocks();
  blocks.forEach(function(block){
    Blockly.TypeInf.hmComponent(block);
  });

};



Blockly.TypeInf.ti = function(te, exp){
    if(! (te instanceof TypeEnv)){
      throw "Must supply a TypeEnv";
    }
    var env = te.env;

    if(exp.isVar()){
      var n = exp.getVarName();
      if(env.has(n)){
        /**
         * @type {Scheme}
         */
        var sigma = env.get(n); // sigma : Scheme
        var t = Scheme.instantiate(sigma);
        if(exp.tag)
          exp.tag.typeExpr = t;
        return {sub: nullSubst , tp:t};
      }
      else{
        throw "Unbound variable '" + n + "' in expression: " + exp.toString();
      }
    }
    else if(exp.isLiteral()){
      if(exp.tag)
        exp.tag.typeExpr = exp.getLiteral();
      return {sub: nullSubst , tp : exp.getLiteral()}; // Expand here
    }
    else if(exp.isAbs()){
      var n = exp.getAbsVarName();
      var e = exp.getAbsExp();
      var tv = Type.generateTypeVar('a');
      var ten = TypeEnv.remove(te, n);
      var tenn = TypeEnv.insert(n,new Scheme([],tv),ten);
      var k = Blockly.TypeInf.ti(tenn,e);
      var s1 = k['sub']; var t1 = k['tp'];
      //console.log(Type.apply(s1,tv));
      //console.log(t1);
      //console.log(new Type(Type.apply(s1,tv), t1) );
      var res = Type.Func(Type.apply(s1,tv), t1);
      if(exp.tag){
        exp.tag.typeExpr = res;
      }
      return {sub : s1, tp : res};
    }
    else if(exp.isApp()){
      var e1 = exp.getAppExpFirst();
      var e2 = exp.getAppExpSecond();
      var tv = Type.generateTypeVar('a');

      var k1 = Blockly.TypeInf.ti(te, e1); var s1 = k1['sub']; var t1= k1['tp'];
      var k2 = Blockly.TypeInf.ti(TypeEnv.apply(s1,te), e2); var s2 = k2['sub']; var t2 = k2['tp'];
      var s3 = Type.mgu(Type.apply(s2,t1), Type.Func(t2,tv));
      
      var newType = Type.apply(s3, tv);
      if(exp.tag){
        exp.tag.typeExpr = newType;
      }
      return {sub : Type.composeSubst(s3,Type.composeSubst(s2,s1)), tp : newType};
    }
    else if (exp.isLet()){
      var x = exp.getLetVarName();
      var e1 = exp.getLetExpFirst();
      var e2 = exp.getLetExpSecond();
      var k1 = Blockly.TypeInf.ti(te, e1); var s1 = k1['sub']; var t1 = k1['tp'];
      var ten = TypeEnv.remove(te,x);
      var tn = TypeEnv.generalize(TypeEnv.apply(s1,ten),t1);
      var tenn = TypeEnv.insert(x,tn,ten); 
      var k2 = Blockly.TypeInf.ti(TypeEnv.apply(s1,tenn), e2); var s2 = k2['sub']; var t2 = k2['tp'];
      return { sub : Type.composeSubst(s1,s2), tp : t2 };
    }
    throw "Partial pattern match";
  }

/**
 * Returns the type of a block given env, is used for functions
 * @param {Object<string,Scheme>} env
 * @param {Exp} e
 */
Blockly.TypeInf.typeInference = function(block, env){
  var e = block.getExpr();
  var k = Blockly.TypeInf.ti(new TypeEnv(env), e);
  return k['sub'];
}

/**
 * Returns the type of a block given env, is used for functions
 * @param {Object<string,Scheme>} env
 * @param {Exp} e
 */
Blockly.TypeInf.typeInference_ = function(block, env){
  var e = block.getExpr();
  var k = Blockly.TypeInf.ti(new TypeEnv(env), e);
  return k['tp'];
}

// Adds functions as polymorphic
Blockly.TypeInf.addBareFunctions = function(env){
  var blocks = Blockly.getMainWorkspace().getTopBlocks();
  blocks.forEach(function(block){
    if(block.type == "procedures_letFunc"){
      var name = block.getFieldValue('NAME');
      var scheme = new Scheme(['z'],Type.Var('z')); 
      env[name] = scheme;
    }
  });
};

// Sets the correct type
// Todo, maybe do functions with high edge degree first
Blockly.TypeInf.addFledgedFunctions = function(env){
  var blocks = Blockly.getMainWorkspace().getTopBlocks();
  blocks.forEach(function(block){
    if(block.type == "procedures_letFunc"){
      var tp = Blockly.TypeInf.typeInference_(block, env);
      var name = block.getFieldValue('NAME');
      var scheme = new Scheme(Type.ftv(tp), tp);
      env[name] = scheme;
    }
  });
}

Blockly.TypeInf.addUserDefined = function(env){
  var dic = Blockly.TypeInf.userDefinedEnviro;
  for (var key in dic) {
    if (dic.hasOwnProperty(key)) {
      env[key] = dic[key];
    }
  }
};

// This can be optimized !!
Blockly.TypeInf.userDefinedEnviro = [];
Blockly.TypeInf.addUserDefinedConstructor = function(name, type){
  var foralls = Type.ftv(type); // No kinds, so the only allowed one is going to be a list - [a]
  var sch = new Scheme(foralls, type);
  Blockly.TypeInf.userDefinedEnviro[name] = sch; 
};

Blockly.TypeInf.addConstructors = function(env){
  var workspace = Blockly.getMainWorkspace();

  var blocks = Blockly.getMainWorkspace().getAllBlocks(false); // We only really need to iterate over top level sum blocks
  blocks.forEach(function(block){
    if(block.type == 'type_product')
    {
      var parentBlock = block.outputConnection.targetBlock();
      if(parentBlock){
        var userTypeName = parentBlock.getFieldValue('NAME');

        var name = block.getFieldValue('CONSTRUCTOR');
        var arrows = [];
        
        for(var i =0; i < block.itemCount_; i++){
          var typeBlock = block.getInputTargetBlock('TP' + i);
          if(!typeBlock) continue;
          arrows.push(typeBlock.getType());
        }

        arrows.push(Type.Lit(userTypeName));
        arrows = Type.fromList(arrows);
        var foralls = Type.ftv(arrows); // No kinds, so the only allowed one is going to be a list - [a]
        var sch = new Scheme(foralls, arrows);
        env[name] = sch; // Finally we add the constructor !
      }
    }
  });
}
