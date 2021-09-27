export class HuggingFaceDatasetProviderConfig {
  private _searchServiceUrl: string;

  public get searchServiceUrl(): string {
    if (this._searchServiceUrl && this._searchServiceUrl.endsWith('/'))
      return this._searchServiceUrl.slice(0, -1);
    else return this._searchServiceUrl;
  }
  public set searchServiceUrl(value: string) {
    this._searchServiceUrl = value;
  }
}
