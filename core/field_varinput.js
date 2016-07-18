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

Blockly.FieldVarInput.prototype.getPath = function(width)
{
  var width_ = width+2;
  return 'M -6,2 a 6,6,0,0,0,0,12 l 0 4 l '+ width_ + ' 0 l 0 -20 l -' + width_ + ' 0 z';
};

Blockly.FieldVarInput.prototype.init = function() {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }
  // Build the DOM.
  this.fieldGroup_ = Blockly.createSvgElement('g', {}, null);
  if (!this.visible_) {
    this.fieldGroup_.style.display = 'none';
  }

  this.borderRect_ = Blockly.createSvgElement('rect',
      {'rx': 4,
       'ry': 4,
       'x': -Blockly.BlockSvg.SEP_SPACE_X / 2,
       'y': 0,
       'height': 16}, this.fieldGroup_, this.sourceBlock_.workspace);

  this.borderRect_ = Blockly.createSvgElement('path',
       {'class': 'blocklyFieldVarInput',
       'd': this.getPath(20)},
       this.fieldGroup_);



  /** @type {!Element} */
  this.textElement_ = Blockly.createSvgElement('text',
      {'class': 'blocklyText', 'y': this.size_.height - 12.5},
      this.fieldGroup_);

    this.updateEditable();
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
  this.mouseUpWrapper_ =
      Blockly.bindEvent_(this.fieldGroup_, 'mouseup', this, this.onMouseUp_);
  this.mouseDownWrapper_ =
      Blockly.bindEvent_(this.fieldGroup_, 'mousedown', this, this.onMouseDown_); 

  // Force a render.
  this.updateTextNode_();
};

Blockly.FieldVarInput.prototype.render_ = function() {
  if (this.visible_ && this.textElement_) {
    var key = this.textElement_.textContent + '\n' +
        this.textElement_.className.baseVal;
    if (Blockly.Field.cacheWidths_ && Blockly.Field.cacheWidths_[key]) {
      var width = Blockly.Field.cacheWidths_[key];
    } else {
      try {
        var width = this.textElement_.getComputedTextLength();
      } catch (e) {
        // MSIE 11 is known to throw "Unexpected call to method or property
        // access." if Blockly is hidden.
        var width = this.textElement_.textContent.length * 8;
      }
      if (Blockly.Field.cacheWidths_) {
        Blockly.Field.cacheWidths_[key] = width;
      }
    }
    if (this.borderRect_) {
      this.borderRect_.setAttribute('d', this.getPath(width + Blockly.BlockSvg.SEP_SPACE_X));
    }
  } else {
    var width = 0;
  }
  this.size_.width = width;
};

Blockly.FieldVarInput.prototype.render_ = function() {
  if (this.visible_ && this.textElement_) {
    var key = this.textElement_.textContent + '\n' +
        this.textElement_.className.baseVal;
    if (Blockly.Field.cacheWidths_ && Blockly.Field.cacheWidths_[key]) {
      var width = Blockly.Field.cacheWidths_[key];
    } else {
      try {
        var width = this.textElement_.getComputedTextLength();
      } catch (e) {
        // MSIE 11 is known to throw "Unexpected call to method or property
        // access." if Blockly is hidden.
        var width = this.textElement_.textContent.length * 8;
      }
      if (Blockly.Field.cacheWidths_) {
        Blockly.Field.cacheWidths_[key] = width;
      }
    }
    if (this.borderRect_) {
      this.borderRect_.setAttribute('width',
          width + Blockly.BlockSvg.SEP_SPACE_X);
    }
  } else {
    var width = 0;
  }
  this.size_.width = width+10;
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

Blockly.FieldVarInput.prototype.showEditor_ = function(){};

Blockly.FieldVarInput.prototype.onMouseDown_ = function(e){

  var name = this.getValue();
  Blockly.dragMode_ = Blockly.DRAG_NONE;
  this.sourceBlock_.setDragging_(false);
  this.sourceBlock_.onMouseUp_(e);
  this.sourceBlock_.unselect();
 
  var blocksXMLText =
     '<xml>' +
      '<block type="vars_local">' +
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


