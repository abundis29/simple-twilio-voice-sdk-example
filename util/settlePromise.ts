export async function settlePromise<T>(
  promise: Promise<T>,
): Promise<
  {status: 'fulfilled'; value: T} | {status: 'rejected'; reason: unknown}
> {
  return promise
    .then(value => ({status: 'fulfilled' as const, value}))
    .catch(reason => ({status: 'rejected' as const, reason}));
}
