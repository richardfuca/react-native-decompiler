/**
  React Native Decompiler
  Copyright (C) 2020 Richard Fu and contributors

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Map that supports multiple values in one key
 */
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
    return this.get(key).length > 0;
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
