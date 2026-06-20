export class ServiceRegistry {
  private readonly services = new Map<string, unknown>();

  register<T>(key: string, service: T): void {
    if (this.services.has(key)) {
      throw new Error(`Service already registered: ${key}`);
    }

    this.services.set(key, service);
  }

  get<T>(key: string): T {
    if (!this.services.has(key)) {
      throw new Error(`Service not registered: ${key}`);
    }

    return this.services.get(key) as T;
  }

  clear(): void {
    this.services.clear();
  }
}
