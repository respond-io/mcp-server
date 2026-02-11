export abstract class BaseProtocol {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  init(): Promise<void | unknown> {
    throw new Error("Method not implemented.");
  }
}
