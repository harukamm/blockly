/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Components for creating connections between blocks.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.RenderedConnection');

goog.require('Blockly.Connection');
goog.require('Blockly.TypeExpr');
goog.require('Blockly.TypeVar');


/**
 * Class for a connection between blocks that may be rendered on screen.
 * @param {!Blockly.Block} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @extends {Blockly.Connection}
 * @constructor
 */
Blockly.RenderedConnection = function(source, type) {
  Blockly.RenderedConnection.superClass_.constructor.call(this, source, type);
  this.offsetInBlock_ = new goog.math.Coordinate(0, 0);
};
goog.inherits(Blockly.RenderedConnection, Blockly.Connection);

/**
 * Returns the distance between this connection and another connection.
 * @param {!Blockly.Connection} otherConnection The other connection to measure
 *     the distance to.
 * @return {number} The distance between connections.
 */
Blockly.RenderedConnection.prototype.distanceFrom = function(otherConnection) {
  var xDiff = this.x_ - otherConnection.x_;
  var yDiff = this.y_ - otherConnection.y_;
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

/**
 * Move the block(s) belonging to the connection to a point where they don't
 * visually interfere with the specified connection.
 * @param {!Blockly.Connection} staticConnection The connection to move away
 *     from.
 * @private
 */
Blockly.RenderedConnection.prototype.bumpAwayFrom_ = function(staticConnection) {
  if (Blockly.dragMode_ != Blockly.DRAG_NONE) {
    // Don't move blocks around while the user is doing the same.
    return;
  }
  // Move the root block.
  var rootBlock = this.sourceBlock_.getRootBlock();
  if (rootBlock.isInFlyout) {
    // Don't move blocks around in a flyout.
    return;
  }
  var reverse = false;
  if (!rootBlock.isMovable()) {
    // Can't bump an uneditable block away.
    // Check to see if the other block is movable.
    rootBlock = staticConnection.getSourceBlock().getRootBlock();
    if (!rootBlock.isMovable()) {
      return;
    }
    // Swap the connections and move the 'static' connection instead.
    staticConnection = this;
    reverse = true;
  }
  // Raise it to the top for extra visibility.
  var selected = Blockly.selected == rootBlock;
  selected || rootBlock.select();
  var dx = (staticConnection.x_ + Blockly.SNAP_RADIUS) - this.x_;
  var dy = (staticConnection.y_ + Blockly.SNAP_RADIUS) - this.y_;
  if (reverse) {
    // When reversing a bump due to an uneditable block, bump up.
    dy = -dy;
  }
  if (rootBlock.RTL) {
    dx = -dx;
  }
  rootBlock.moveBy(dx, dy);
  selected || rootBlock.unselect();
};

/**
 * Change the connection's coordinates.
 * @param {number} x New absolute x coordinate.
 * @param {number} y New absolute y coordinate.
 */
Blockly.RenderedConnection.prototype.moveTo = function(x, y) {
  // Remove it from its old location in the database (if already present)
  if (this.inDB_) {
    this.db_.removeConnection_(this);
  }
  this.x_ = x;
  this.y_ = y;
  // Insert it into its new location in the database.
  if (!this.hidden_) {
    this.db_.addConnection(this);
  }
};

/**
 * Change the connection's coordinates.
 * @param {number} dx Change to x coordinate.
 * @param {number} dy Change to y coordinate.
 */
Blockly.RenderedConnection.prototype.moveBy = function(dx, dy) {
  this.moveTo(this.x_ + dx, this.y_ + dy);
};

/**
 * Move this connection to the location given by its offset within the block and
 * the coordinate of the block's top left corner.
 * @param {!goog.math.Coordinate} blockTL The coordinate of the top left corner
 *     of the block.
 */
Blockly.RenderedConnection.prototype.moveToOffset = function(blockTL) {
  this.moveTo(blockTL.x + this.offsetInBlock_.x,
      blockTL.y + this.offsetInBlock_.y);
};

/**
 * Set the offset of this connection relative to the top left of its block.
 * @param {number} x The new relative x.
 * @param {number} y The new relative y.
 */
Blockly.RenderedConnection.prototype.setOffsetInBlock = function(x, y) {
  this.offsetInBlock_.x = x;
  this.offsetInBlock_.y = y;
};

/**
 * Move the blocks on either side of this connection right next to each other.
 * @private
 */
Blockly.RenderedConnection.prototype.tighten_ = function() {
  var dx = this.targetConnection.x_ - this.x_;
  var dy = this.targetConnection.y_ - this.y_;
  if (dx != 0 || dy != 0) {
    var block = this.targetBlock();
    var svgRoot = block.getSvgRoot();
    if (!svgRoot) {
      throw 'block is not rendered.';
    }
    var xy = Blockly.getRelativeXY_(svgRoot);
    block.getSvgRoot().setAttribute('transform',
        'translate(' + (xy.x - dx) + ',' + (xy.y - dy) + ')');
    block.moveConnections_(-dx, -dy);
  }
};

/**
 * Find the closest compatible connection to this connection.
 * @param {number} maxLimit The maximum radius to another connection.
 * @param {number} dx Horizontal offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @param {number} dy Vertical offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @return {!{connection: ?Blockly.Connection, radius: number}} Contains two
 *     properties: 'connection' which is either another connection or null,
 *     and 'radius' which is the distance.
 */
Blockly.RenderedConnection.prototype.closest = function(maxLimit, dx, dy) {
  return this.dbOpposite_.searchForClosest(this, maxLimit, dx, dy);
};

/**
 * Add highlighting around this connection.
 */
Blockly.RenderedConnection.prototype.highlight = function() {
  var steps;
  if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.OUTPUT_VALUE) {
    steps = 'm 0,0 ' + Blockly.BlockSvg.getDownPath(this) +  ' v 5';
  } else {
    steps = 'm -20,0 h 5 ' + Blockly.BlockSvg.NOTCH_PATH_LEFT + ' h 5';
  }
  var xy = this.sourceBlock_.getRelativeToSurfaceXY();
  var x = this.x_ - xy.x;
  var y = this.y_ - xy.y;
  Blockly.Connection.highlightedPath_ = Blockly.createSvgElement('path',
      {'class': 'blocklyHighlightedConnectionPath',
       'd': steps,
       transform: 'translate(' + x + ',' + y + ')' +
           (this.sourceBlock_.RTL ? ' scale(-1 1)' : '')},
      this.sourceBlock_.getSvgRoot());
};

/**
 * Unhide this connection, as well as all down-stream connections on any block
 * attached to this connection.  This happens when a block is expanded.
 * Also unhides down-stream comments.
 * @return {!Array.<!Blockly.Block>} List of blocks to render.
 */
Blockly.RenderedConnection.prototype.unhideAll = function() {
  this.setHidden(false);
  // All blocks that need unhiding must be unhidden before any rendering takes
  // place, since rendering requires knowing the dimensions of lower blocks.
  // Also, since rendering a block renders all its parents, we only need to
  // render the leaf nodes.
  var renderList = [];
  if (this.type != Blockly.INPUT_VALUE && this.type != Blockly.NEXT_STATEMENT) {
    // Only spider down.
    return renderList;
  }
  var block = this.targetBlock();
  if (block) {
    var connections;
    if (block.isCollapsed()) {
      // This block should only be partially revealed since it is collapsed.
      connections = [];
      block.outputConnection && connections.push(block.outputConnection);
      block.nextConnection && connections.push(block.nextConnection);
      block.previousConnection && connections.push(block.previousConnection);
    } else {
      // Show all connections of this block.
      connections = block.getConnections_(true);
    }
    for (var c = 0; c < connections.length; c++) {
      renderList.push.apply(renderList, connections[c].unhideAll());
    }
    if (!renderList.length) {
      // Leaf block.
      renderList[0] = block;
    }
  }
  return renderList;
};

/**
 * Remove the highlighting around this connection.
 */
Blockly.RenderedConnection.prototype.unhighlight = function() {
  goog.dom.removeNode(Blockly.Connection.highlightedPath_);
  delete Blockly.Connection.highlightedPath_;
};

/**
 * Set whether this connections is hidden (not tracked in a database) or not.
 * @param {boolean} hidden True if connection is hidden.
 */
Blockly.RenderedConnection.prototype.setHidden = function(hidden) {
  this.hidden_ = hidden;
  if (hidden && this.inDB_) {
    this.db_.removeConnection_(this);
  } else if (!hidden && !this.inDB_) {
    this.db_.addConnection(this);
  }
};

/**
 * Hide this connection, as well as all down-stream connections on any block
 * attached to this connection.  This happens when a block is collapsed.
 * Also hides down-stream comments.
 */
Blockly.RenderedConnection.prototype.hideAll = function() {
  this.setHidden(true);
  if (this.targetConnection) {
    var blocks = this.targetBlock().getDescendants();
    for (var b = 0; b < blocks.length; b++) {
      var block = blocks[b];
      // Hide all connections of all children.
      var connections = block.getConnections_(true);
      for (var c = 0; c < connections.length; c++) {
        connections[c].setHidden(true);
      }
      // Close all bubbles of all children.
      var icons = block.getIcons();
      for (var i = 0; i < icons.length; i++) {
        icons[i].setVisible(false);
      }
    }
  }
};

/**
 * Check if the two connections can be dragged to connect to each other.
 * @param {!Blockly.Connection} candidate A nearby connection to check.
 * @param {number} maxRadius The maximum radius allowed for connections.
 * @return {boolean} True if the connection is allowed, false otherwise.
 */
Blockly.RenderedConnection.prototype.isConnectionAllowed = function(candidate,
    maxRadius) {
  if (this.distanceFrom(candidate) > maxRadius) {
    return false;
  }

  // Type checking.
  var canConnect = this.canConnectWithReason_(candidate);
  if (canConnect != Blockly.Connection.CAN_CONNECT &&
      canConnect != Blockly.Connection.REASON_MUST_DISCONNECT) {
    return false;
  }

  return Blockly.RenderedConnection.superClass_.isConnectionAllowed.call(this,
      candidate);
};

/**
 * Disconnect two blocks that are connected by this connection.
 * @param {!Blockly.Block} parentBlock The superior block.
 * @param {!Blockly.Block} childBlock The inferior block.
 * @private
 */
Blockly.RenderedConnection.prototype.disconnectInternal_ = function(parentBlock,
    childBlock) {
  Blockly.RenderedConnection.superClass_.disconnectInternal_.call(this,
      parentBlock, childBlock);
  // Rerender the parent so that it may reflow.
  if (parentBlock.rendered) {
    parentBlock.render();
  }
  if (childBlock.rendered) {
    childBlock.updateDisabled();
    childBlock.render();
  }
};

/**
 * Respawn the shadow block if there was one connected to the this connection.
 * Render/rerender blocks as needed.
 * @private
 */
Blockly.RenderedConnection.prototype.respawnShadow_ = function() {
  var parentBlock = this.getSourceBlock();
  // Respawn the shadow block if there is one.
  var shadow = this.getShadowDom();
  if (parentBlock.workspace && shadow && Blockly.Events.recordUndo) {
    Blockly.RenderedConnection.superClass_.respawnShadow_.call(this);
    var blockShadow = this.targetBlock();
    if (!blockShadow) {
      throw 'Couldn\'t respawn the shadow block that should exist here.';
    }
    blockShadow.initSvg();
    blockShadow.render(false);
    if (parentBlock.rendered) {
      parentBlock.render();
    }
  }
};

/**
 * Find all nearby compatible connections to this connection.
 * Type checking does not apply, since this function is used for bumping.
 * @param {number} maxLimit The maximum radius to another connection.
 * @return {!Array.<!Blockly.Connection>} List of connections.
 * @private
 */
Blockly.RenderedConnection.prototype.neighbours_ = function(maxLimit) {
  return this.dbOpposite_.getNeighbours(this, maxLimit);
};

/**
 * Connect two connections together.  This is the connection on the superior
 * block.  Rerender blocks as needed.
 * @param {!Blockly.Connection} childConnection Connection on inferior block.
 * @private
 */
Blockly.RenderedConnection.prototype.connect_ = function(childConnection) {
  Blockly.RenderedConnection.superClass_.connect_.call(this, childConnection);

  var parentConnection = this;
  var parentBlock = parentConnection.getSourceBlock();
  var childBlock = childConnection.getSourceBlock();

  if (parentBlock.rendered) {
    parentBlock.updateDisabled();
  }
  if (childBlock.rendered) {
    childBlock.updateDisabled();
  }
  if (parentBlock.rendered && childBlock.rendered) {
    if (parentConnection.type == Blockly.NEXT_STATEMENT ||
        parentConnection.type == Blockly.PREVIOUS_STATEMENT) {
      // Child block may need to square off its corners if it is in a stack.
      // Rendering a child will render its parent.
      childBlock.render();
    } else {
      // Child block does not change shape.  Rendering the parent node will
      // move its connected children into position.
      parentBlock.render();
    }
  }
};

// Stefan
// Sorin
Blockly.Connection.prototype.renderTypeVarHighlights = function() {
  if (this.typeVarPaths_) {
    for (var i = 0; i < this.typeVarPaths_.length; i++) {
      goog.dom.removeNode(this.typeVarPaths_[i]);
      delete this.typeVarPaths_[i];
    }
  }

  // Stefan, TODO - Fix
  if(this.typeExpr && this.typeExpr.name == 'Function_'){

    this.typeVarPaths_ = [];
    var xy = this.sourceBlock_.getRelativeToSurfaceXY();
    var x = this.x_ - xy.x;
    var y = this.y_ - xy.y;
    var typeVarHighlights = Blockly.BlockSvg.typeVarHighlights(this.typeExpr.children[this.typeExpr.children.length-1]);

    for (var i = 0; i < typeVarHighlights.length; i++) {
      var highlight = typeVarHighlights[i];
      this.typeVarPaths_.push(
        Blockly.createSvgElement(
          'path', {
            'class': 'blocklyTypeVarPath',
            stroke: highlight.color,
            d: highlight.path,
            transform: 'translate(' + x + ', ' + y + ')'
          },
          this.sourceBlock_.getSvgRoot()));
    }

    xy = this.sourceBlock_.getRelativeToSurfaceXY();
    x = this.x_ - xy.x + 43;
    y = this.y_ - xy.y + 1;
    var inps = [];
    for(var i = 0; i < this.typeExpr.children.length - 1; i++){
      inps.push(this.typeExpr.children[i]);
    }
    var thisBlock = this;
    inps.forEach(function(tp){
    var typeVarHighlights = Blockly.BlockSvg.typeVarHighlights(tp);

    for (var i = 0; i < typeVarHighlights.length; i++) {
        var highlight = typeVarHighlights[i];
        thisBlock.typeVarPaths_.push(
          Blockly.createSvgElement(
            'path', {
              'class': 'blocklyTypeVarPath',
              stroke: highlight.color,
              d: highlight.path,
              transform: 'translate(' + x + ', ' + y + ')'
            },
            thisBlock.sourceBlock_.getSvgRoot()));
      }
      y += Blockly.BlockSvg.getTypeExprHeight(tp);
    });





    return;
  }


  this.typeVarPaths_ = [];
  var xy = this.sourceBlock_.getRelativeToSurfaceXY();
  var x = this.x_ - xy.x;
  var y = this.y_ - xy.y;
  var typeVarHighlights = Blockly.BlockSvg.typeVarHighlights(this.typeExpr);

  for (var i = 0; i < typeVarHighlights.length; i++) {
    var highlight = typeVarHighlights[i];
    this.typeVarPaths_.push(
      Blockly.createSvgElement(
        'path', {
          'class': 'blocklyTypeVarPath',
          stroke: highlight.color,
          d: highlight.path,
          transform: 'translate(' + x + ', ' + y + ')'
        },
        this.sourceBlock_.getSvgRoot()));
  }
}

/**
 * Adds color if this is a type variable connection
 * Sorin
 */
Blockly.Connection.prototype.addColor = function() {
  if (this.coloredPath_) {
    goog.dom.removeNode(this.coloredPath_);
    delete this.coloredPath_;
  }
  if (!(this.typeExpr)) {
    return;
  }
  if (!(this.typeExpr.isTypeVar())) {
    return;
  }
  var steps;
  if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.OUTPUT_VALUE) {
    // Sorin
    steps = 'm 0,0 ' + Blockly.BlockSvg.getDownPath(this) +  ' v 5';
    //steps = 'm 0,0 l -8,10 8,10 v 5';
    // var tabWidth = Blockly.RTL ? -Blockly.BlockSvg.TAB_WIDTH :
    //                              Blockly.BlockSvg.TAB_WIDTH;
    // steps = 'm 0,0 v 5 c 0,10 ' + -tabWidth + ',-8 ' + -tabWidth + ',7.5 s ' +
    //         tabWidth + ',-2.5 ' + tabWidth + ',7.5 v 5';
  } else {
    if (Blockly.RTL) {
      steps = 'm 20,0 h -5 l -6,4 -3,0 -6,-4 h -5';
    } else {
      steps = 'm -20,0 h 5 l 6,4 3,0 6,-4 h 5';
    }
  }
  var xy = this.sourceBlock_.getRelativeToSurfaceXY();
  var x = this.x_ - xy.x;
  var y = this.y_ - xy.y;
  
  this.coloredPath_ = Blockly.createSvgElement(
    'path', {
      'class': 'blocklyTypeVarPath',
      stroke: Blockly.TypeVar.getTypeVarColor(this.typeExpr.name),
      d: steps,
      transform: 'translate(' + x + ', ' + y + ')'
    },
    this.sourceBlock_.getSvgRoot());

  // this.coloredPath_ = Blockly.createSvgElement('path',
  //     {class: 'blocklyHighlightedConnectionPath' + 
  //                Blockly.TypeVar.getTypeVarColor(this.typeExpr.name),
  //      stroke: Blockly.TypeVar.getTypeVarColor(this.typeExpr.name),
  //      d: steps,
  //      transform: 'translate(' + x + ', ' + y + ')'},
  //     this.sourceBlock_.getSvgRoot());
};


