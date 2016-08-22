
'use strict';

  goog.provide('Type');
  goog.provide('Scheme');
  goog.provide('TypeEnv');
  goog.provide('Exp');
  goog.provide('EVar');
  goog.provide('ELit');
  goog.provide('EAbs');
  goog.provide('EApp');
  goog.provide('ELet');
  // All js boys

  // Type = TypeVar
  //      | Literal
  //      | Function this next

  // if next then name is type and next is a type
  /**
   * @constructor
   * @param {(Type|string|null)} base
   * @param {Type=} next
   */
  Type = function(base, next){
    if(!next && !(typeof base == 'string'))
      throw "Cannot construct type like this: ";
    this.base = base;
    this.next = next;
  }

  Type.prototype.isTypeVar = function(){
    return !this.isFunction() && this.base.startsWith("_POLY_");
  }

  Type.prototype.isLiteral = function(){
    return !this.isTypeVar() && !this.isFunction();
  }

  Type.prototype.getLiteral = function(){
    if(!this.isLiteral()) 
      // We error in order to avoid mistakingly using
      // incorrect function
      throw "This is not a literal type !";
    return this.base;
  }

  Type.prototype.getTypeVar = function(){
    if(!this.isTypeVar())
      throw "This is not a type variable !";
    return this.base.substring(6);
  }
  
  // Is arrow type a -> b ?
  Type.prototype.isFunction = function(){
    return this.next != null;
  }
  // If function, get the first part a -> b 
  Type.prototype.getFirst = function(){
    if(!this.isFunction())
      throw "This is not a function !";
    return this.base;
  }

  // If function, get the second part a -> b
  Type.prototype.getSecond = function(){
    if(!this.isFunction())
      throw "This is not a function !";
    return this.next;
  }

  Type.prototype.toString = function(){
    var str = "";
    if(this.isTypeVar())
      str = this.getTypeVar();
    else if (this.isLiteral())
      str = this.getLiteral();
    else
      str = this.getFirst().toString() + " -> " + this.getSecond().toString();
    return str;
  }

  /**
   * @param {Type} tp
   * @return {Array<Type>}
   */
  /*Type.flatten = function(tp){
    var tps = [];
    while(tp.next){
      tps.push(new Type(tp.base.base));
      tp = tp.next;
    }
    tps.push(new Type(tp.base));
    return tps;
  }*/
  Type.flatten = function(tp){
    var tps = [];
    if(!tp.next)
      return [tp];
    return Type.flatten(tp.base).concat(Type.flatten(tp.next));
  }
  
  Type.getOutput = function(tp){
    if (tp.next)
      return Type.getOutput(tp.next);
    return tp;
  }
  
  /**
   * @param {Array<string>} ls
   * @return {Type}
   */
  Type.fromList = function(ls){
    if(! (typeof ls[0] == 'string' ))
      throw 'Can only use fromList on strings';
    if(ls.length == 1)
      return new Type(ls[0]);

    return new Type(new Type(ls[0]), Type.fromList(ls.splice(1)));
  }

  // Get free type variables
  // ftv :: Type -> Set String
  /**
   * @param {Type} tp
   * @return {Set}
   */
  Type.ftv = function(tp){
    if (tp.isTypeVar())
      return new Immutable.Set([tp.getTypeVar()]);
    else if (tp.isLiteral())
      return new Immutable.Set();
    else{
      var left = Type.ftv(tp.getFirst());
      var right = Type.ftv(tp.getFirst());
      return left.union(right);
    }
  }


  // apply : Dictionary String Type -> Type -> Type
  /**
   * Apply substitutions
   * @param {Object} s
   * @param {Type} t a type
   * @return {Type}
   */
  Type.apply = function(s, t){
    if (s==false)
      throw "Types do not match";
    if (t.isTypeVar()){
      var n = t.getTypeVar();
      if(s.has(n))
        return s.get(n);
      else
        return t;
    }
    else if (t.isFunction()){
      return new Type(Type.apply(s,t.getFirst()), Type.apply(s, t.getSecond()));
    }
    else
      return t;
  }

  /**
   * @param {Object<string, Type>} s1
   * @param {Object<string, Type>} s2
   * @return {Object<string, Type>}
   */
  Type.composeSubst = function(s1,s2){

    //var left = s2.map(v => Type.apply(s1,v));
    //var res = left.merge(s1);
    return (s2.map(v => Type.apply(s1,v))).merge(s1);
    //return res;
  }

  /**
   * Most general unifier
   * @param {Type} t1 first type
   * @param {Type} t2 second type
   * @return {Object<string, Type>}
   */
  Type.mgu = function(t1, t2){
    if (t1.isFunction() && t2.isFunction()){
      var s1 = Type.mgu(t1.getFirst(), t2.getFirst());

      var arg1 = Type.apply(s1, t1.getSecond());
      var arg2 = Type.apply(s1, t2.getSecond());
      var s2 = Type.mgu(arg1,arg2);
      return Type.composeSubst(s1,s2); 
    }
    else if(t1.isTypeVar()){
      var u = t1.getTypeVar();
      return Type.varBind(u,t2);
    }
    else if(t2.isTypeVar()){
      var u = t2.getTypeVar();
      return Type.varBind(u,t1);
    }
    else if(t1.isLiteral() && t2.isLiteral() && t1.getLiteral() ===
        t2.getLiteral()){
      return nullSubst;
    }
    else{
      return false;
      throw "types do not unify: " + t1.toString() + " and " + t2.toString();
    }
  }

  /**
   * @param {string} u name of variable
   * @param {Type} t type of variable
   * @return {Object<string, Type>}
   */
  Type.varBind = function(u,t){
    if (t.isTypeVar() && t.getTypeVar() == u)
      return nullSubst;
    else if ( Type.ftv(t).has(u) )
      throw "occur check fails " + u + " vs " + t.toString();
    else{
      return Immutable.Map([[u,t]]);
    }
  };

    // Global state
  var tiSupply = 0;

  /**
   * @param {string} prefix
   * @return {Type}
   */
  Type.generateTypeVar = function(prefix){
    var tv = new Type("_POLY_" + prefix + tiSupply);
    tiSupply++;
    return tv;
  }

  /**
   * @constructor
   */
  Scheme = function(varNames, tp){
    this.varNames = varNames;
    this.tp = tp;
  };

  /**
   * We only use it for schemes anyway
   * @param {Array<Scheme>} ls
   * @return {Set}
   */
  Scheme.ftvList = function(ls){
    var s = new Immutable.Set([]);
    if(ls.length == 0) return s;
    ls.map(Scheme.ftv).forEach(function(l){
      s=s.add(l);
    });
    return s;
  };

  /**
   * @param {Scheme} scheme
   * @return {Set}
   */
  Scheme.ftv = function(scheme){
    var s = Type.ftv(scheme.tp);
    scheme.varNames.forEach(function(varName){
      s=s.delete(varName);
    });
    return s;
  };

  /**
   * @param {Object} s
   * @param {Scheme} scheme
   * @return {Scheme}
   */
  Scheme.apply = function(s, scheme){
    if(! (scheme instanceof Scheme) )
      throw "Can only apply on Schemes !";  
    var sn = s;
    scheme.varNames.forEach(function(varName){
      sn = sn.delete(varName);
    });

    return new Scheme(scheme.varNames, Type.apply(sn, scheme.tp));
  }
  
  /**
   * @param {Scheme} scheme
   * @return {Type}
   */
  Scheme.instantiate = function(scheme){
    if (! (scheme instanceof Scheme))
      throw "Can only instantiate schemes !";
    var nvars = [];
    var s = Immutable.Map({}); // s : Map String Type
    scheme.varNames.forEach(function(varName){
      var n = Type.generateTypeVar("a");
      s = s.set(varName, n);
    });
    return Type.apply(s, scheme.tp); // return : Type
  }

  
  /**
   * @constructor
   */
  EVar = function(varName){
    this.varName = varName
  };
  EVar.prototype.toString = function(){
    return this.varName; 
  };
  /**
   * @constructor
   */
  ELit = function(lit){
    this.lit = lit
  };
  ELit.prototype.toString = function(){ return this.lit; };
  /**
   * @constructor
   */
  EApp = function(exp1, exp2){
    this.exp1 = exp1; this.exp2 = exp2
  };
  EApp.prototype.toString = function(){ 
    var left = this.exp1.toString();
    var right = this.exp2.toString();
    return "(" + left + ")(" + right + ")";
  };
  /**
   * @constructor
   */
  EAbs = function(varName, exp){
    this.varName = varName; this.exp = exp
  };
  EAbs.prototype.toString = function(){ return "\\" + this.varName + " -> (" + this.exp.toString() + ")";};
  /**
   * @constructor
   */
  ELet = function(varName, exp1, exp2){
    this.varName = varName; 
    this.exp1 = exp1;
    this.exp2 = exp2
  };
  ELet.prototype.toString = function(){ return "let " + this.varName + " = " + this.exp1.toString() + " in " + this.exp2.toString(); };

  /**
   * @constructor
   */
  Exp = function(exp){
    this.exp = exp;
  }
  Exp.prototype.toString = function(){
    return this.exp.toString();
  }
  // Static constructor helpers
  /**
   * @return {Exp}
   */
  Exp.Var = function(varName){
    return new Exp(new EVar(varName));
  }
  /**
   * @return {Exp}
   */
  Exp.Lit = function(lit){
    return new Exp(new ELit(lit));
  }
  /**
   * @return {Exp}
   */
  Exp.App = function(exp1, exp2){
    if(!exp1 || !exp2)
      throw 'Expressions must be defined';
    return new Exp(new EApp(exp1, exp2));
  }
  
  Exp.AppFunc = function(exps, exp){
    var e = exp;
    exps.forEach(function(i){
      e = Exp.App(e,i);
    });
    return e;
  }
  
  /**
   * @return {Exp}
   */
  Exp.Abs = function(varName, exp){
    if(!exp)
      throw 'Expression must be defined';
    return new Exp(new EAbs(varName, exp));
  }

  /**
   * Create an anonymous function with the given variables
   * @return {Exp}
   */
  Exp.AbsFunc = function(varNames, exp){
    if(!exp)
      throw 'Expression must be defined';
    if(!varNames || varNames.length == 0)
      throw "Cannot create a function with no arguments"
    if(varNames.length == 1)
      return Exp.Abs(varNames[0],exp);
    return Exp.Abs(varNames[0], Exp.AbsFunc(varNames.splice(1),exp));
  }

  /**
   * @return {Exp}
   */
  Exp.Let = function(varName, exp1, exp2){
    return new Exp(new ELet(varName, exp1, exp2));
  }

  Exp.prototype.isVar = function(){return this.exp instanceof EVar;};
  Exp.prototype.getVarName = function(){
    if(!this.isVar()) throw "Not a var expression !";
    return this.exp.varName;
  }

  Exp.prototype.isLiteral = function(){return this.exp instanceof ELit;};
  Exp.prototype.getLiteral = function(){
    if(!this.isLiteral()) throw "Not a literal expression !";
    return this.exp.lit;
  }

  Exp.prototype.isApp = function(){return this.exp instanceof EApp;};
  Exp.prototype.getAppExpFirst = function(){
    if(!this.isApp()) throw "Not an application expression !";
    return this.exp.exp1;
  }
  Exp.prototype.getAppExpSecond = function(){
    if(!this.isApp()) throw "Not an application expression !";
    return this.exp.exp2;
  }

  Exp.prototype.isAbs = function(){return this.exp instanceof EAbs;};
  Exp.prototype.getAbsVarName = function(){
    if(!this.isAbs()) throw "Not an abstraction expression !";
    return this.exp.varName;
  }
  Exp.prototype.getAbsExp = function(){
    if(!this.isAbs()) throw "Not an abstraction expression !";
    return this.exp.exp;
  }

  Exp.prototype.isLet = function(){return this.exp instanceof ELet;};
  Exp.prototype.getLetVarName = function(){
    if(!this.isLet()) throw "Not a Let expression !";
    return this.exp.varName;
  }
  Exp.prototype.getLetExpFirst = function(){
    if(!this.isLet()) throw "Not a Let expression !";
    return this.exp.exp1;
  }
  Exp.prototype.getLetExpSecond = function(){
    if(!this.isLet()) throw "Not a Let expression !";
    return this.exp.exp2;
  }
  // Algorithm W
  // env : Map String Scheme
  // exp : Exp
  
  // TypeEnv Map String Scheme
  /**
   * @constructor
   * @param {Object<string, Scheme>} env
   */
  TypeEnv = function(env){
    this.env = Immutable.Map(env);
  }
  
  // Dic String Type -> TypeEnv -> TypeEnv
  /**
   * @param {Object} s
   * @param {TypeEnv} te
   * @return {TypeEnv}
   */
  TypeEnv.apply = function(s, te){
    if(! (te instanceof TypeEnv) ){
      console.log(te);
      throw "Not a TypeEnvironment";
    }

    return new TypeEnv(te.env.map(v => Scheme.apply(s,v)));
  };
  
  /**
   * @param {TypeEnv} te
   * @return {Set}
   */
  TypeEnv.ftv = function(te){
    if( ! (te instanceof TypeEnv))
      throw "Must be applied to a TypeEnv";

    return Scheme.ftvList(Array.from(te.env.values()) );
  };

  /**
   * @param {TypeEnv} te
   * @param {string} x
   * @return {TypeEnv}
   */
  TypeEnv.remove = function(te, x){
    return new TypeEnv(te.env.delete(x));
  };

  /**
   * @param {string} x
   * @param {Scheme} s
   * @param {TypeEnv} te
   * @return {TypeEnv}
   */
  TypeEnv.insert = function(x,s,te){
    if (! (s instanceof Scheme) )
      throw "Can only insert Schemes !";
    return new TypeEnv(te.env.set(x,s));
  };

  // generalize : TypeEnv -> Type -> Scheme
  /**
   * @param {TypeEnv} te
   * @param {Type} t
   * @return {Scheme}
   */
  TypeEnv.generalize = function(te,t){
    if( ! (te instanceof TypeEnv))
      throw "Must be applied to TypeEnv";
    if ( ! (t instanceof Type))
      throw "Must be applied to Type";
    var a = Type.ftv(t);
    var b = TypeEnv.ftv(te);

    b.forEach(function(i){
      a = a.delete(i);
    });

    return new Scheme(a.toList(),t);
  };

    /*applyList = function(s,ls){
    var lsn = [];
    var apply = eval(ls[0].constructor.name + "." + "apply");
    ls.forEach(function(l){
      lsn.push(apply(s,l));
    });
    return lsn;
  };*/

  var nullSubst = Immutable.Map({});

  /**
   * @param {TypeEnv} te
   * @param {Exp} exp
   * @return {{sub : Object<string, Type>, tp : Type}}
   */
  Exp.ti = function(te, exp){
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

        return {sub: nullSubst , tp:t};
      }
      else{
        throw "Unbound variable " + n;
      }
    }
    else if(exp.isLiteral()){
      return {sub: nullSubst , tp : new Type(exp.getLiteral())}; // Expand here
    }
    else if(exp.isAbs()){
      var n = exp.getAbsVarName();
      var e = exp.getAbsExp();
      var tv = Type.generateTypeVar('a');
      var ten = TypeEnv.remove(te, n);
      var tenn = TypeEnv.insert(n,new Scheme([],tv),ten);
      var k = Exp.ti(tenn,e);
      var s1 = k['sub']; var t1 = k['tp'];
      //console.log(Type.apply(s1,tv));
      //console.log(t1);
      //console.log(new Type(Type.apply(s1,tv), t1) );
      var res = new Type(Type.apply(s1,tv), t1);
      if( ! (res instanceof Type))
        throw "Must be type damnit";
      return {sub : s1, tp : res};
    }
    else if(exp.isApp()){
      var e1 = exp.getAppExpFirst();
      var e2 = exp.getAppExpSecond();
      var tv = Type.generateTypeVar('a');

      var k1 = Exp.ti(te, e1); var s1 = k1['sub']; var t1= k1['tp'];
      var k2 = Exp.ti(TypeEnv.apply(s1,te), e2); var s2 = k2['sub']; var t2 = k2['tp'];
      var s3 = Type.mgu(Type.apply(s2,t1), new Type(t2,tv));

      return {sub : Type.composeSubst(s3,Type.composeSubst(s2,s1)), tp : Type.apply(s3,tv)};
    }
    else if (exp.isLet()){
      var x = exp.getLetVarName();
      var e1 = exp.getLetExpFirst();
      var e2 = exp.getLetExpSecond();
      var k1 = Exp.ti(te, e1); var s1 = k1['sub']; var t1 = k1['tp'];
      var ten = TypeEnv.remove(te,x);
      var tn = TypeEnv.generalize(TypeEnv.apply(s1,ten),t1);
      var tenn = TypeEnv.insert(x,tn,ten); 
      var k2 = Exp.ti(TypeEnv.apply(s1,tenn), e2); var s2 = k2['sub']; var t2 = k2['tp'];
      return { sub : Type.composeSubst(s1,s2), tp : t2 };
    }
    throw "Partial pattern match";
  }

  /**
   * @param {Object<string,Scheme>} env
   * @param {Exp} e
   */
  Exp.typeInference = function(env, e){
    // Reset state
    tiSupply = 0;

    var k = Exp.ti(new TypeEnv(env), e);

    var s = k['sub']; var t = k['tp'];
    return Type.apply(s,t);
  }



  var t = new Type("Int");
  var u = new Type("_POLY_A");
  var i = new Type("Int");
  // var f = Type.flatten(r);

  // test mgu
  
  var ll =Type.mgu(t,u);
  //console.log(Array.from(ll.keys()) );

  var r = Type.fromList(["Int","Float","_POLY_A"]);
  var y = Type.fromList(["_POLY_A","_POLY_B","_POLY_A"]);
  var z = Type.mgu(r,y);
  var o = Type.fromList(["Int","_POLY_A","_POLY_A"]);
  var p = Type.fromList(["_POLY_B","_POLY_A","_POLY_A"]);
  var x = Type.mgu(o,p);
  //console.log(z.toObject() );
  //console.log(x.toObject());
  //console.log('end test mgu');

  // test ti


  var e0 = Exp.Abs('x', Exp.Var('x'));
  var e1 = Exp.App(e0, Exp.Lit('10'));
  var e2 = Exp.Let("id", e0, Exp.App(Exp.Var("id"), Exp.Lit('20')));
  var e3 = Exp.Let("id", e0, Exp.Var("id"));
  var e7 = Exp.Lit('20');

  var t7 = Exp.typeInference({},e7);
  console.log(e7.toString());
  console.log(t7.toString());

  var t0 = Exp.typeInference({},e0);
  console.log(e0.toString());
  console.log(t0.toString());

  var t1 = Exp.typeInference({},e1);
  console.log(e1.toString());
  console.log(t1.toString());

  var t2 = Exp.typeInference({},e2);
  console.log(e2.toString());
  console.log(t2.toString());

  var t3 = Exp.typeInference({},e3);
  console.log(e3.toString());
  console.log(t3.toString());


  // FIX ERROR HERE !
  var e4 = Exp.App( Exp.Var('+'), Exp.Lit('Integer'));
  var pt = Type.fromList(["Integer","Integer","Integer"]);
  var s = new Scheme(['+'],pt) 
  var t4 = Exp.typeInference({'+' :s },e4);
  //console.log(s);
  console.log(e4.toString());
  console.log(t4.toString());

//  var e5 = Exp.App(e4, Exp.Lit('20'));
//  var t5 = Exp.typeInference({'+':s},e5);
//  console.log(e5.toString());
//  console.log(t5.toString());

//  var e6 = Exp.AppFunc([Exp.Lit('1'),Exp.Lit('2')], Exp.Var('tri'))
//  console.log(e6.toString());
//  var s = new Scheme(['tri'], Type.fromList(['Integer','Integer','Integer','Integer']));
//  var t6 = Exp.typeInference({'tri' : s}, e6);
//  console.log(t6.toString());

//   var functionName = 'if';
//   var arrows = Type.fromList(['Integer','_POLY_A','_POLY_A','_POLY_A']);
//   var exps = [Exp.Lit('1'), Exp.Lit('2')];
//   var e6 = Exp.AppFunc(exps, Exp.Var(functionName))
//   var s = new Scheme([functionName], arrows);
//   var env = {}; env[functionName] = s;
//   var t6 = Exp.typeInference(env, e6);
//   console.log(e6.toString());
//   console.log(t6.toString());


