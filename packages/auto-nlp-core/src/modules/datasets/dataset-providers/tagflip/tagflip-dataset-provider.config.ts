export class TagFlipDatasetProviderConfig {
  private _api: string;

  public get api(): string {
    if (this._api && this._api.endsWith('/')) return this._api.slice(0, -1);
    else return this._api;
  }
  public set api(value: string) {
    this._api = value;
  }
}
