import { Duplex, PassThrough, Readable, Transform } from 'node:stream';

describe('Duplex.from({ writable, readable })', () => {

  it('flushes stream after filling buffer', async () => {
    // Create 16 items so that we overflow stream buffer
    const values = [...new Array(16).keys()];

    // Simple pass-through as a placeholder for more complex setup
    const through = new PassThrough({ objectMode: true });

    // Stream prepared values, pipe through simple duplex and async transformer
    const stream = Readable.from(values, { objectMode: true })
      .pipe(Duplex.from({
        writable: through,
        readable: through
      }))
      .pipe(new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
          // We need to have async transformer to make sure buffer capacity is reached
          setTimeout(() => callback(null, chunk), 0);
        }
      }));

    // This never finishes for 15+ items
    const result = await stream.toArray();

    expect(result).toEqual(values);
  });

});