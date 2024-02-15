'use strict';

/**
 * Cache monitoring mechanism for tracking and checking cache updates.
 * @param instance
 * @constructor
 */
// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'CacheMonitor'.
function CacheMonitor(this: any, instance: any) {

  const self = this;

  let operations: any = []
    , listening = false;

  instance.ctx.bus.on('data-update', (operation: any) => {
    if (listening) {
      operations.push(operation);
    }
  });

  self.listen = () => {
    listening = true;
    return self;
  }

  self.stop = () => {
    listening = false;
    return self;
  }

  self.clear = () => {
    operations = [];
    return self;
  }

  self.shouldBeEmpty = () => {
    operations.length.should.equal(0)
  }

  self.nextShouldEql = (col: any, doc: any) => {
    operations.length.should.not.equal(0)

    const operation = operations.shift();
    operation.type.should.equal(col);
    operation.op.should.equal('update');

    if (doc) {
      operation.changes.should.be.Array();
      operation.changes.length.should.be.eql(1);
      const change = operation.changes[0];
      change.should.containEql(doc);
    }
  }

  self.nextShouldEqlLast = (col: any, doc: any) => {
    self.nextShouldEql(col, doc);
    self.shouldBeEmpty();
  }

  self.nextShouldDelete = (col: any, _id: any) => {
    operations.length.should.not.equal(0)

    const operation = operations.shift();
    operation.type.should.equal(col);
    operation.op.should.equal('remove');

    if (_id) {
      operation.changes.should.equal(_id);
    }
  }

  self.nextShouldDeleteLast = (col: any, _id: any) => {
    self.nextShouldDelete(col, _id);
    self.shouldBeEmpty();
  }

}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = CacheMonitor;
