export default class ArrayMap<K, V> extends Map<K, V[]> {
  /**
   * Gets the given key array
   * @param key The key to get
   */
  get(key: K): V[] {
    if (!super.get(key)) {
      super.set(key, []);
    }
    return super.get(key) ?? [];
  }

  /**
   * Returns if the given key has elements in it
   * @param key The key to find
   */
  has(key: K): boolean {
    return this.get(key).length === 0;
  }

  /**
   * Pushes the given value into the given key
   * @param key The key to push a value into
   * @param value The value to push
   */
  push(key: K, value: V): void {
    this.get(key).push(value);
  }

  /**
   * Iterates through each element of the given key
   * @param key The key to iterate through
   * @param fn The callback function
   */
  forEachElement(key: K, fn: (value: V, index: number, array: V[]) => void): void {
    this.get(key).forEach(fn);
  }
}
