/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Text input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldVarInput');

goog.require('Blockly.Field');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.userAgent');


/**
 * Class for an editable text field.
 * @param {string} text The initial content of the field.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldVarInput = function(text, opt_validator) {
  Blockly.FieldVarInput.superClass_.constructor.call(this, text,
      opt_validator);

  //Blockly.removeClass_(this.svgGroup_, 'blocklyEditableText');
  //Blockly.addClass_(this.svgGroup_, 'blocklyFieldVarInput');

};
goog.inherits(Blockly.FieldVarInput, Blockly.Field);


Blockly.FieldVarInput.prototype.updateEditable = function() {
  console.log('dum dum');
  Blockly.addClass_(/** @type {!Element} */ (this.fieldGroup_),
                      'blocklyFieldVarInput');

};



/**
 * Point size of text.  Should match blocklyText's font-size in CSS.
 */
Blockly.FieldVarInput.FONTSIZE = 11;

/**
 * Close the input widget if this input is being deleted.
 */
Blockly.FieldVarInput.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldVarInput.superClass_.dispose.call(this);
};

/**
 * Set the text in this field.
 * @param {?string} text New text.
 * @override
 */
Blockly.FieldVarInput.prototype.setValue = function(text) {
  if (text === null) {
    return;  // No change if null.
  }
  Blockly.Field.prototype.setValue.call(this, text);
};


Blockly.FieldVarInput.prototype.onMouseDown_ = function(e){

  var name = this.getValue();
  Blockly.dragMode_ = Blockly.DRAG_NONE;
  this.sourceBlock_.setDragging_(false);
  this.sourceBlock_.onMouseUp_(e);
  this.sourceBlock_.unselect();
 
  var blocksXMLText =
     '<xml>' +
      '<block type="block_variable">' +
        '<field name="NAME">' +
          name +
        '</field>' +
      '</block>' +
     '</xml>';

    var blocksDom = Blockly.Xml.textToDom(blocksXMLText);
    var blocksXMLList = goog.dom.getChildren(blocksDom);

  var curBlock = Blockly.Xml.domToBlock(blocksXMLList[0], Blockly.getMainWorkspace());

  var targetWorkspace = Blockly.getMainWorkspace();
  this.workspace_ = Blockly.getMainWorkspace();

  var svgRootOld = this.sourceBlock_.getSvgRoot();
  var xyOld = Blockly.getSvgXY_(svgRootOld, targetWorkspace);
  
  xyOld.x = e.clientX;
  xyOld.y = e.clientY;

  var scrollX = this.workspace_.scrollX;
  var scale = this.workspace_.scale;
  xyOld.x += scrollX / scale - scrollX;
  var scrollY = this.workspace_.scrollY;
  scale = this.workspace_.scale;
  xyOld.y += scrollY / scale - scrollY;


  var svgRootNew = curBlock.getSvgRoot();
  var xyNew = Blockly.getSvgXY_(svgRootNew, targetWorkspace);
  xyNew.x += targetWorkspace.scrollX / targetWorkspace.scale - targetWorkspace.scrollX;
  xyNew.y += targetWorkspace.scrollY / targetWorkspace.scale - targetWorkspace.scrollY;

  curBlock.moveBy(xyOld.x - xyNew.x, xyOld.y - xyNew.y);
  curBlock.moveBy(-curBlock.getHeightWidth().width/2, -curBlock.getHeightWidth().height/2);
  
  curBlock.onMouseDown_(e);
  Blockly.dragMode_ = Blockly.DRAG_FREE;
  curBlock.setDragging_(true);

};


