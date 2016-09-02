/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Stefan Jacholke.
 * https://github.com/stefan-j/blockly
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
 * @author stefanjacholke@gmail.com (Stefan Jacholke)
 */
'use strict';

goog.provide('Blockly.FieldLocalVar');

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
Blockly.FieldLocalVar = function(text,typeExpr) {
  Blockly.FieldLocalVar.superClass_.constructor.call(this, text,
      null);
  
  this.typeExpr = typeExpr;
  this.lastRendTypeExpr = typeExpr;
  this.size_.height += 4;
};
goog.inherits(Blockly.FieldLocalVar, Blockly.Field);


Blockly.FieldLocalVar.prototype.updateEditable = function() {
  Blockly.addClass_(/** @type {!Element} */ (this.fieldGroup_),
                      'blocklyFieldVarInput');

};

Blockly.FieldLocalVar.prototype.getType = function(){
  return this.typeExpr; 
}

Blockly.FieldLocalVar.prototype.setTypeExprRendered = function(){
  this.lastRendTypeExpr = this.typeExpr;
}

Blockly.FieldLocalVar.prototype.setNewTypeExpr = function(tp){
  this.lastRendTypeExpr = this.typeExpr;
  this.typeExpr = tp;
}

Blockly.FieldLocalVar.prototype.hasTypeChange = function(){
  if (!this.lastRendTypeExpr) // Means we haven't yet setNewTypeExpr
    return true;
  if(!this.typeExpr) // Something with no type cannot change
    return false;

  return Type.equals(this.lastRendTypeExpr, this.typeExpr);
}


Blockly.FieldLocalVar.prototype.getPath = function(width)
{
  var width_ = width+4;
  
  var inlineSteps = [];
  var typeExpr = this.getType();
  if(typeExpr)
  {
    inlineSteps.push('M 0,-2');

    Blockly.BlockSvg.renderTypeExpr(typeExpr, inlineSteps, 'down');

    var height = Blockly.BlockSvg.getTypeExprHeight(typeExpr); 
    this.size_.height = height + 10;
    if(height < 23)
      height = 23;

    inlineSteps.push('M 0,' + (height - 6) ) ;

    inlineSteps.push('l 0 4 l ' + width_ + ' 0 l 0 -' +height + ' l -' + width_ + ' 0');
  }
  else
  {
      inlineSteps.push('M 0,4');
      inlineSteps.push('a 6,6,0,0,0,0,12'); 
      inlineSteps.push('l 0 4 l '+ width_ + ' 0 l 0 -20 l -' + width_ + ' 0 z');
  }

  return inlineSteps.join(' ');
};

Blockly.FieldLocalVar.prototype.init = function() {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }
  // Build the DOM.
  this.fieldGroup_ = Blockly.createSvgElement('g', {}, null);
  if (!this.visible_) {
    this.fieldGroup_.style.display = 'none';
  }

  this.borderRect_ = Blockly.createSvgElement('path',
       {'class': 'blocklyFieldLocalVar',
       'd': this.getPath(this.size_.width)},
       this.fieldGroup_);

  /** @type {!Element} */
  this.textElement_ = Blockly.createSvgElement('text',
      {'class': 'blocklyText', 'y': 15, 'x':6},
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

Blockly.FieldLocalVar.prototype.render_ = function() {
  if (this.visible_ && this.textElement_) {
    var key = this.textElement_.textContent + '\n' +
        this.textElement_.className.baseVal;
    if (Blockly.Field.cacheWidths_ && Blockly.Field.cacheWidths_[key]) {
      var width = Blockly.Field.cacheWidths_[key];
    } else {
      var width = this.textElement_.getComputedTextLength();
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

Blockly.FieldLocalVar.prototype.render_ = function() {
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
      this.borderRect_.setAttribute('d',this.getPath(width + Blockly.BlockSvg.SEP_SPACE_X));
    }
  } else {
    var width = 0;
  }
  this.size_.width = width+10;
};

/**
 * Point size of text.  Should match blocklyText's font-size in CSS.
 */
Blockly.FieldLocalVar.FONTSIZE = 11;

/**
 * Close the input widget if this input is being deleted.
 */
Blockly.FieldLocalVar.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldLocalVar.superClass_.dispose.call(this);
};

/**
 * Set the text in this field.
 * @param {?string} text New text.
 * @override
 */
Blockly.FieldLocalVar.prototype.setValue = function(text) {
  if (text === null) {
    return;  // No change if null.
  }
  Blockly.Field.prototype.setValue.call(this, text);
};

Blockly.FieldLocalVar.prototype.showEditor_ = function(){};

Blockly.FieldLocalVar.prototype.onMouseDown_ = function(e){
  if(e.button!=0)
    return; // Only proceed on left click

  if(this.sourceBlock_.isInFlyout )
    return;
  var name = this.getValue();
  Blockly.dragMode_ = Blockly.DRAG_NONE;
  this.sourceBlock_.setDragging_(false);
  this.sourceBlock_.onMouseUp_(e);
  this.sourceBlock_.unselect();

  var container = goog.dom.createDom('block');
  container.setAttribute('type','vars_local');

  var field = goog.dom.createDom('field',null,name);
  field.setAttribute('name','NAME');
  container.appendChild(field);

  var mutation = goog.dom.createDom('mutation');
  if(this.localId) mutation.setAttribute('localId',this.localId);
  mutation.setAttribute('parentId',this.sourceBlock_.id);
  var typeDom = Blockly.TypeInf.toDom(this.getType());
  mutation.appendChild(typeDom);
  container.appendChild(mutation);

  var curBlock = Blockly.Xml.domToBlock(container, Blockly.getMainWorkspace());
  curBlock.parentField_ = this;
  curBlock.parentBlock__ = this.sourceBlock_;

  curBlock.setOutputTypeExpr(this.getType());

  curBlock.render();

  var targetWorkspace = Blockly.getMainWorkspace();
  this.workspace_ = Blockly.getMainWorkspace();

  var svgRootOld = this.sourceBlock_.getSvgRoot();
  var xyOld = Blockly.getSvgXY_(svgRootOld, targetWorkspace);
 
  var element = document.getElementById('blocklyDiv');
  var rect = element.getBoundingClientRect();

  var mouseX = e.clientX - rect.left;
  var mouseY = e.clientY - rect.top;
 
  var scale = this.workspace_.scale;

  var svgRootNew = curBlock.getSvgRoot();
  var xyNew = Blockly.getSvgXY_(svgRootNew, targetWorkspace);

  var blockOffsetX = xyNew.x;
  var blockOffsetY = xyNew.y;

  var offsetX = mouseX - blockOffsetX; 
  var offsetY = mouseY - blockOffsetY; 

  offsetX /= scale;
  offsetY /= scale;

  curBlock.moveBy(offsetX, offsetY);
  curBlock.moveBy(-curBlock.getHeightWidth().width/2, -curBlock.getHeightWidth().height/2);
  
  curBlock.onMouseDown_(e);
  Blockly.dragMode_ = Blockly.DRAG_FREE;
  curBlock.setDragging_(true);

};


