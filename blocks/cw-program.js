
Blockly.Blocks['cwSimulationOf'] = {
  /**
   * Block for comparison operator.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(0);
    this.setOutput(false);
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel('Simulation Of', 'blocklyTextEmph'));
    
    var world = Blockly.TypeVar.getUnusedTypeVar();
    var number = new Blockly.TypeExpr('Number');
    var listNum = new Blockly.TypeExpr('list', [new Blockly.TypeExpr('Number')]);
    this.appendValueInput('INITIAL')
        .setTypeExpr(new Blockly.TypeExpr('Function_', 
              [new Blockly.TypeExpr('list', [new Blockly.TypeExpr('Number') ] ), world ]  ));

    this.appendValueInput('STEP')
        .setTypeExpr(new Blockly.TypeExpr('Function_', 
              [world, new Blockly.TypeExpr('Number'), world ]  ));
    this.appendValueInput('DRAW')
        .setTypeExpr(new Blockly.TypeExpr('Function_', 
              [world, new Blockly.TypeExpr('Picture') ]  ));
    this.setInputsInline(true);
    this.functionName = "";
  }
};



