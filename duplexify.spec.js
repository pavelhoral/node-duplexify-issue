import { Duplex, PassThrough, Readable, Transform } from 'node:stream';

describe('Duplex.from({ writable, readable })', () => {

  it('flushes stream after filling buffer', async () => {
    // Simple pass-through as a placeholder for more complex setup
    const through = new PassThrough({ objectMode: true });

    // Stream prepared values, pipe through simple duplex and async transformer for backpressure
    const stream = Readable.from(['foo', 'bar'], { objectMode: true })
      .pipe(Duplex.from({
        writable: through,
        readable: through
      }))
      .pipe(new Transform({
        objectMode: true,
        highWaterMark: 1, // Setting 1 to force backpressure after a single item
        transform(chunk, encoding, callback) {
          setTimeout(() => callback(null, chunk), 0);
        }
      }));

    // This never finishes when high water mark is reached
    const result = await stream.toArray();

    expect(result).toEqual(['foo', 'bar']);
  });

});
