export interface IQueueClient<T> {
  peek(): Promise<T>;

  add(t: T);

  poll(): Promise<T>;

  getPosition(key: any);
}
