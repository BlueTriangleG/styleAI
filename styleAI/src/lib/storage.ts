interface StorageData<T> {
  value: T;
  timestamp?: number;
  expires?: number;
}

class Storage {
  private prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  /**
   * 设置localStorage数据
   * @param key 键名
   * @param value 值
   * @param expires 过期时间（毫秒）
   */
  set<T>(key: string, value: T, expires?: number): void {
    const data: StorageData<T> = {
      value,
      timestamp: Date.now(),
      expires
    };

    try {
      localStorage.setItem(
        this.getKey(key),
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Storage设置失败:', error);
      throw error;
    }
  }

  /**
   * 获取localStorage数据
   * @param key 键名
   * @returns 存储的值，如果已过期或不存在则返回null
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;

      const data: StorageData<T> = JSON.parse(item);
      
      if (this.isExpired(data)) {
        this.remove(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error('Storage获取失败:', error);
      return null;
    }
  }

  /**
   * 删除指定的localStorage数据
   * @param key 键名
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('Storage删除失败:', error);
      throw error;
    }
  }

  /**
   * 清空所有带有指定前缀的localStorage数据
   */
  clear(): void {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Storage清空失败:', error);
      throw error;
    }
  }

  /**
   * 获取完整的键名（包含前缀）
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * 检查数据是否已过期
   */
  private isExpired(data: StorageData<any>): boolean {
    if (!data.expires || !data.timestamp) return false;
    return Date.now() - data.timestamp > data.expires;
  }
}

// 导出默认实例
export default new Storage();

// 导出类以支持创建自定义实例
export { Storage };